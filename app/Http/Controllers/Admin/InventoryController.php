<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Items;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function items()
    {
        // For now, just return the view with dummy data
        // $items = [
        //     ['id' => 1, 'description' => 'Item 1', 'stock_quantity' => 100, 'unit' => 'pcs', 'status' => 'Available'],
        //     ['id' => 2, 'description' => 'Item 2', 'stock_quantity' => 50, 'unit' => 'pcs', 'status' => 'Low Stock'],
        //     ['id' => 3, 'description' => 'Item 3', 'stock_quantity' => 0, 'unit' => 'pcs', 'status' => 'Out of Stock'],
        // ];

        $items = Items::all();

        return inertia('Admin/Inventory', [
            'items' => $items,
        ]);
    }
}
