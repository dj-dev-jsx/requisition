<?php

namespace App\Http\Controllers\Admin;

use App\Exports\RISExport;
use App\Http\Controllers\Controller;
use App\Models\Requests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Excel;
use Maatwebsite\Excel\Facades\Excel as FacadesExcel;

class RequestsController extends Controller
{
public function requests(Request $request)
{
    $search = $request->search;
    $month = $request->month;
    $year = $request->year;

    $requests = Requests::with([
        'user',
        'items.item',
        'ris.issuedBy',
        'ris.requestedBy',
        'ris.receivedBy',
    ])
    ->when($search, function ($query) use ($search) {
        $query->where('id', 'like', "%{$search}%")
              ->orWhere('purpose', 'like', "%{$search}%")
              ->orWhereHas('user', function ($q) use ($search) {
                  $q->where('firstname', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%");
              });
    })
    ->when($month, function ($query) use ($month) {
    $query->whereMonth('created_at', $month);
    })
    ->when($year, function ($query) use ($year) {
        $query->whereYear('created_at', $year);
    })
    ->orderBy('created_at', 'desc')
    ->paginate(10)  // <-- paginate instead of get
    ->withQueryString(); // <-- preserve filters in pagination links

    return Inertia::render('Admin/Requests', [
        'requests' => $requests,
        'filters' => [
            'search' => $search,
            'month' => $month,
            'year' => $year,
        ]
    ]);
}

public function exportRIS(Request $request)
{
    // ✅ fallback to current month/year if empty
    $month = $request->month ?: date('n'); // 1–12
    $year  = $request->year ?: date('Y');

    // ✅ CAPS filename
    $monthName = strtoupper(date("F", mktime(0, 0, 0, (int)$month, 1)));
    $fileName = "RSMI_{$monthName}_{$year}.xlsx";

    return FacadesExcel::download(
        new RISExport($month, $year),
        $fileName
    );
}

}
