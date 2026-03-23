<?php

namespace App\Http\Controllers;

use App\Models\Items;
use App\Models\RequestItems;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LoginController extends Controller
{
public function admin_dashboard()
{
    // 1️⃣ Total items
    $totalItems = Items::count();

    // 2️⃣ Low stock items (threshold: 5)
    $lowStockItems = Items::where('stock_quantity', '<=', 5)
        ->get(['id', 'description', 'stock_quantity', 'unit']);

    // 3️⃣ Recent requests (last 10)
    $recentRequests = RequestItems::with(['request.user', 'item'])
        ->latest()
        ->take(10)
        ->get()
        ->map(function ($requestItem) {
            return [
                'id' => $requestItem->id,
                'description' => $requestItem->item->description ?? 'N/A',
                'issued_quantity' => $requestItem->issued_quantity,
                'user' => $requestItem->request->user->firstname . ' ' . $requestItem->request->user->lastname ?? 'Unknown',
                'date' => $requestItem->created_at->format('Y-m-d H:i'),
            ];
        });

    // 4️⃣ Frequently requested items (top 5)
    $frequentlyRequested = RequestItems::select('item_id', DB::raw('COUNT(*) as request_count'))
        ->groupBy('item_id')
        ->orderByDesc('request_count')
        ->take(5)
        ->with('item')
        ->get()
        ->map(function ($req) {
            return [
                'id' => $req->item_id,
                'description' => $req->item->description ?? 'N/A',
                'request_count' => $req->request_count,
            ];
        });

    // 5️⃣ Inventory summary by unit
    $inventorySummary = Items::select('unit', DB::raw('SUM(stock_quantity) as total_quantity'))
        ->groupBy('unit')
        ->get();

    $requestsOverTime = RequestItems::select(
        DB::raw('DATE(created_at) as date'),
        DB::raw('COUNT(*) as request_count')
    )
    ->where('created_at', '>=', Carbon::now()->subDays(7))
    ->groupBy('date')
    ->orderBy('date')
    ->get()
    ->map(fn($r) => [
        'date' => Carbon::parse($r->date)->format('M d'), // e.g., Mar 23
        'request_count' => $r->request_count,
    ]);
    
    $totalUsers = User::role('user')->count();

    return Inertia::render('Admin/Dashboard', [
        'dashboard' => [
            'total_items' => $totalItems,
            'low_stock_items' => $lowStockItems,
            'recent_requests' => $recentRequests,
            'frequently_requested' => $frequentlyRequested,
            'inventory_summary' => $inventorySummary,
            'requests_over_time' => $requestsOverTime,
            'total_users' => $totalUsers,
        ],
    ]);
}

public function user_dashboard()
{
    $user = Auth::user();

    // Total requests
    $totalRequests = RequestItems::whereHas('request', function ($q) use ($user) {
        $q->where('user_id', $user->id);
    })->count();

    // Pending requests
    $pendingRequests = RequestItems::whereHas('request', function ($q) use ($user) {
        $q->where('user_id', $user->id)
          ->where('status', 'pending'); // adjust status column if different
    })->count();

    // Approved requests
    $approvedRequests = RequestItems::whereHas('request', function ($q) use ($user) {
        $q->where('user_id', $user->id)
          ->where('status', 'approved');
    })->count();

    // Recent 10 requests
    $recentRequests = RequestItems::with('item', 'request')
        ->whereHas('request', fn($q) => $q->where('user_id', $user->id))
        ->latest('id')
        ->take(10)
        ->get()
        ->map(fn($r) => [
            'id' => $r->id,
            'item' => $r->item->description ?? 'N/A',
            'quantity' => $r->quantity,
            'status' => $r->request->status ?? 'Unknown',
            'date' => $r->created_at?->format('Y-m-d H:i'),
        ]);

    // Requests over the last 7 days
    $requestsOverTime = RequestItems::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as request_count')
        )
        ->whereHas('request', fn($q) => $q->where('user_id', $user->id))
        ->where('created_at', '>=', Carbon::now()->subDays(7))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

    return Inertia::render('User/Dashboard', [
        'dashboard' => [
            'total_requests' => $totalRequests,
            'pending_requests' => $pendingRequests,
            'approved_requests' => $approvedRequests,
            'recent_requests' => $recentRequests,
            'requests_over_time' => $requestsOverTime,
        ],
        'user' => $user,
    ]);
}
    
    public function app_guide()
    {
        return Inertia::render('Student/Guide');  
    }
}
