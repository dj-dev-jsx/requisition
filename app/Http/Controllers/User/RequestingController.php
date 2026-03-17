<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Items;
use Illuminate\Http\Request;

class RequestingController extends Controller
{
    public function user_items()
    {
        $items = Items::all();
        return inertia('User/Items', [
            'items' => $items
        ]);
    }
}
