<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\ItemsImport;
use App\Models\Items;
use Illuminate\Http\Request;
use App\Models\RequestItems as UserRequest;
use App\Models\Requests;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class InventoryController extends Controller
{
public function items(Request $request)
{
    $search = $request->search;

    $items = Items::when($search, function ($query) use ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('description', 'like', "%{$search}%")
              ->orWhere('unit', 'like', "%{$search}%")
              ->orWhere('id', 'like', "%{$search}%");
        });
    })
    ->orderBy('created_at', 'asc')
    ->paginate(10) // <-- number of items per page
    ->withQueryString(); // <-- preserves search/filter query

    return inertia('Admin/Inventory', [
        'items' => $items,
        'filters' => [
            'search' => $search,
        ],
    ]);
}

public function addItem(Request $request)
{
    $validated = $request->validate([
        'description' => 'required|string|max:255',
        'stock_quantity' => 'required|numeric|min:0',
        'unit' => 'required|string|max:50',
        'image' => 'nullable|image|max:2048', // optional file validation
    ]);

    // Handle image upload
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('items', 'public');
        $validated['image'] = $path;
    }

    // Automatically set status based on stock_quantity
    if ($validated['stock_quantity'] == 0) {
        $validated['status'] = 'out_of_stock';
    } elseif ($validated['stock_quantity'] < 5) {
        $validated['status'] = 'low_stock';
    } else {
        $validated['status'] = 'in_stock';
    }

    // Create item
    Items::create($validated);

    return redirect()->route('admin.inventory')->with('success', 'Item added!');
}

public function restock(Request $request)
{
    $request->validate([
        'item_id' => 'required|exists:items,id',
        'additional_stock' => 'required|numeric|min:1',
    ]);

    $item = Items::findOrFail($request->item_id);

    $item->stock_quantity += $request->additional_stock;

    if ($item->stock_quantity == 0) {
        $item->status = 'out_of_stock';
    } elseif ($item->stock_quantity <= 5) {
        $item->status = 'low_stock';
    } else {
        $item->status = 'in_stock';
    }

    $item->save();

    return back();
}

public function update(Request $request, $id)
{
    $item = Items::findOrFail($id);

    $validated = $request->validate([
        'description' => 'required|string|max:255',
        'stock_quantity' => 'required|numeric|min:0',
        'unit' => 'required|string|max:50',
        'image' => 'nullable|image|max:2048',
    ]);

    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('items', 'public');
        $validated['image'] = $path;
    }

    if ($validated['stock_quantity'] == 0) {
        $validated['status'] = 'out_of_stock';
    } elseif ($validated['stock_quantity'] < 5) {
        $validated['status'] = 'low_stock';
    } else {
        $validated['status'] = 'in_stock';
    }

    $item->update($validated);

    return redirect()->route('admin.inventory')->with('success', 'Item updated!');
}


public function showRequest(Requests $request)
{
    $request->load('items.item', 'user', 'ris'); // eager load related data
    return Inertia::render('Admin/RequestDetail', [
        'request' => $request,
    ]);
}
public function approve(Request $req, Requests $request)
{
    $req->validate([
        'issue_date' => 'nullable|date',
    ]);

    if ($request->status !== 'pending') {
        return redirect()->route('admin.requests')
            ->withErrors(['error' => 'This request has already been processed.']);
    }

    DB::beginTransaction();

    try {
        foreach ($request->items as $item) {
            $inventoryItem = $item->item;
            if ($inventoryItem->status === 'out_of_stock' || $inventoryItem->stock_quantity <= 0) {
                throw new \Exception('Cannot approve request because "' . $inventoryItem->description . '" is out of stock.');
            }

            $issuedQty = (int) ($req->items[(string) $item->id] ?? 0);
            $inventoryItem = $item->item;

            $stock = $inventoryItem->stock_quantity;

            if ($issuedQty > $stock) {
                throw new \Exception('Not enough stock for ' . $inventoryItem->description);
            }

            if ($issuedQty > 0) {
                // ✅ Deduct stock
                $inventoryItem->stock_quantity -= $issuedQty;

                // ✅ Update status
                if ($inventoryItem->stock_quantity == 0) {
                    $inventoryItem->status = 'out_of_stock';
                } elseif ($inventoryItem->stock_quantity <= 5) {
                    $inventoryItem->status = 'low_stock';
                } else {
                    $inventoryItem->status = 'in_stock';
                }

                $inventoryItem->save();
            }

            // ✅ Save issued qty
            $item->update([
                'issued_quantity' => $issuedQty
            ]);
        }

        // ✅ Update request
        $request->update([
            'status' => 'processed',
            'processed_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        // ✅ Generate RIS Number (YY-MM-###)
        if (!$request->ris) {

            $year = now()->format('y');   // 25
            $month = now()->format('m');  // 01
            $prefix = "{$year}-{$month}-";

            // Get latest RIS this month
            $latestRIS = \App\Models\RIS::where('ris_number', 'like', "{$prefix}%")
                ->lockForUpdate() // 🔥 prevents duplicate in concurrent requests
                ->orderBy('ris_number', 'desc')
                ->first();

            if ($latestRIS) {
                $lastNumber = (int) substr($latestRIS->ris_number, -3);
                $nextNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
            } else {
                $nextNumber = '001';
            }

            $risNumber = $prefix . $nextNumber;

            // ✅ Create RIS
            \App\Models\RIS::create([
                'request_id' => $request->id,
                'ris_number' => $risNumber,
                'issued_by' => Auth::id(),
                'requested_by' => $request->user_id,
                'received_by' => null,
                'issue_date' => $req->issue_date ?: null,
            ]);
        }

        DB::commit();

    return response()->json([
        'success' => true,
        'print_url' => route('admin.requests.print', $request->id),
    ]);

    } catch (\Exception $e) {
        DB::rollback();
        return back()->withErrors(['error' => $e->getMessage()]);
    }
}



public function printRis(Requests $request)
{
    // Correctly fetch the RIS
    $ris = $request->ris()->with(['issuedBy', 'requestedBy', 'receivedBy'])->first();
    // Fetch the request items (these belong to Requests)
    $items = $request->items()->with('item')->get();
    $logo = public_path('logo.png');
    if (!file_exists($logo)) $logo = null;
    $approvedAt = $request->approved_at ?? null;
    $risNumber = $ris ? ($ris->ris_number ?? 'N/A') : 'N/A';
    $filename = "RIS-{$risNumber}.pdf";
    // Sanitize filename to remove invalid characters
    $filename = preg_replace('/[\/\\\\:*?"<>|]/', '-', $filename);
    $pdf = Pdf::loadView('admin.requests.pdf', [
        'ris' => $ris,
        'request' => $request,
        'approvedAt' => $approvedAt,
        'items' => $items,
        'logo' => $logo,
        'risNumber' => $risNumber,
    ])->setPaper('a4', 'portrait');

    return $pdf->stream($filename);
}


public function reject(Request $req, Requests $request)
{
    $req->validate([
        'rejection_reason' => 'required|string|max:1000'
    ]);

    if ($request->status !== 'pending') {
        return redirect()->route('admin.requests')
            ->withErrors(['error' => 'This request has already been processed.']);
    }

    // Update request
    $request->update([
        'status' => 'rejected',
        'processed_by' => Auth::id(),
        'rejection_reason' => $req->rejection_reason,
    ]);

    // Send notification to user
    $request->user->notify(new \App\Notifications\RejectedRequestNotification($request));

    return back()->with('success', 'Request rejected successfully.');
}
public function bulkUpload(Request $request)
{
    $request->validate([
        'file' => 'required|mimes:xlsx,csv'
    ]);

    Excel::import(new ItemsImport, $request->file('file'));

    return back()->with('success', 'Items uploaded successfully.');
}

}
