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
    public function user_items()
    {
        $items = Items::all();
        return inertia('User/Items', [
            'items' => $items
        ]);
    }

    public function store(Request $request)
{
    $request->validate([
        'items' => 'required|array|min:1',
        'items.*.item_id' => 'required|exists:items,id',
        'items.*.quantity' => 'required|numeric|min:1',
    ]);

    $user = Auth::user();

    // ✅ Create main request
    $req = UserRequest::create([
        'user_id' => $user->id,
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
