<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Requests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequestsController extends Controller
{
public function requests(Request $request)
{
    $search = $request->search;
    $from = $request->from;
    $to = $request->to;

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
    ->when($from && $to, function ($query) use ($from, $to) {
        $query->whereBetween('created_at', [
            $from . ' 00:00:00',
            $to . ' 23:59:59'
        ]);
    })
    ->when($from && !$to, function ($query) use ($from) {
        $query->whereDate('created_at', '>=', $from);
    })
    ->when(!$from && $to, function ($query) use ($to) {
        $query->whereDate('created_at', '<=', $to);
    })
    ->orderBy('created_at', 'asc')
    ->paginate(10)  // <-- paginate instead of get
    ->withQueryString(); // <-- preserve filters in pagination links

    return Inertia::render('Admin/Requests', [
        'requests' => $requests,
        'filters' => [
            'search' => $search,
            'from' => $from,
            'to' => $to,
        ]
    ]);
}
}
