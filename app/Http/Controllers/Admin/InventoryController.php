<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Items;
use Illuminate\Http\Request;
use App\Models\RequestItems as UserRequest;
use App\Models\Requests;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function items()
    {

        $items = Items::all();

        return inertia('Admin/Inventory', [
            'items' => $items,
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
    } elseif ($item->stock_quantity < 5) {
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
    $request->load('items.item', 'user'); // eager load related data
    return Inertia::render('Admin/RequestDetail', [
        'request' => $request,
    ]);
}

public function approve(Request $req, Requests $request)
{
    // ✅ Prevent double approval
    if ($request->status !== 'pending') {
        return redirect()->route('admin.requests')
            ->withErrors(['error' => 'This request has already been processed.']);
    }

    // Loop through each requested item
    foreach ($request->items as $item) {
        $issuedQty = (int) ($req->items[(string) $item->id] ?? 0);
        $stock = $item->item->stock_quantity;

        if ($issuedQty > $stock) {
            return back()->withErrors([
                'error' => 'Not enough stock for ' . $item->item->description
            ]);
        }

        if ($issuedQty > 0) {
            $item->item->decrement('stock_quantity', $issuedQty);
        }

        $item->update(['issued_quantity' => $issuedQty]);
    }

    // ✅ Update request status to processed/approved
    $request->update([
        'status' => 'processed',
        'processed_by' => auth()->id(),
        'approved_at' => now(),
    ]);

    // ✅ Create RIS if it doesn't exist
    if (!$request->ris) {
        $ris = \App\Models\RIS::create([
            'request_id' => $request->id,
            'ris_number' => 'RIS-' . now()->format('Ymd') . '-' . $request->id,
            'issued_by' => auth()->id(),
            'requested_by' => $request->user_id,
            'received_by' => null, // you can fill later
        ]);
    }

    // ✅ Redirect to print PDF immediately
    return back()->with('success', 'Request approved successfully.');
}

public function printRis(Requests $request)
{
    // Correctly fetch the RIS
    $ris = $request->ris()->with(['issuedBy', 'requestedBy', 'receivedBy'])->first();
    // Fetch the request items (these belong to Requests)
    $items = $request->items()->with('item')->get();

    $logo = public_path('logo.png');
    if (!file_exists($logo)) $logo = null;

    $risNumber = $ris->ris_number ?? 'N/A';

    $pdf = Pdf::loadView('admin.requests.pdf', [
        'ris' => $ris,
        'request' => $request,
        'items' => $items,
        'logo' => $logo,
    ])->setPaper('a4', 'portrait');

    return $pdf->stream("RIS-{$risNumber}.pdf");
}


}
