<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Items;
use Illuminate\Http\Request;

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
        'stock_quantity' => 'required|decimal:2|min:0',
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
        'additional_stock' => 'required|decimal:2|min:1',
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
        'stock_quantity' => 'required|decimal:2|min:0',
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

}
