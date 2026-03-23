<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Items;
use Illuminate\Http\Request;
use App\Models\Requests as UserRequest;
use App\Models\RequestItems;
use App\Models\User;
use App\Notifications\NewRequestNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class RequestingController extends Controller
{
public function user_items(Request $request)
{
    $search = $request->search;

    $items = Items::when($search, function ($query, $search) {
        $query->where('description', 'like', "%{$search}%");
    })->get();

    return inertia('User/Items', [
        'items' => $items,
        'filters' => [
            'search' => $search, // ✅ keep state
        ],
    ]);
}

    public function store(Request $request)
    {
    $request->validate([
        'purpose' => 'nullable|string|max:255',
        'items' => 'required|array|min:1',
        'items.*.item_id' => 'required|exists:items,id',
        'items.*.quantity' => 'required|numeric|min:1',
    ]);

    $user = Auth::user();

    // ✅ Create main request
    $req = UserRequest::create([
        'user_id' => $user->id,
        'purpose' => $request->purpose, // ✅ ADD
        'status' => 'pending',
    ]);

    // ✅ Insert items
    foreach ($request->items as $item) {
        RequestItems::create([
            'request_id' => $req->id,
            'item_id' => $item['item_id'],
            'quantity' => $item['quantity'],
        ]);
    }
    $admins = User::whereHas('roles', fn($q) => $q->where('name', 'admin'))->get();

    foreach ($admins as $admin) {
        $admin->notify(new NewRequestNotification($req));
    }

    return redirect()->back()->with('success', 'Request submitted successfully!');
}
}
