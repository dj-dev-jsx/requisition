<?php

namespace App\Http\Controllers;

use App\Models\Items;
use App\Models\RequestItems;
use App\Models\Requests;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LoginController extends Controller
{
public function admin_dashboard(Request $request)
{
    $filters = [
        'date_range' => (int) $request->query('date_range', 7),
        'request_status' => $request->query('request_status', 'all'),
        'item_status' => $request->query('item_status', 'all'),
    ];

    $allowedDateRanges = [7, 14, 30];
    if (!in_array($filters['date_range'], $allowedDateRanges, true)) {
        $filters['date_range'] = 7;
    }

    $allowedRequestStatuses = ['all', 'pending', 'processed', 'rejected'];
    if (!in_array($filters['request_status'], $allowedRequestStatuses, true)) {
        $filters['request_status'] = 'all';
    }

    $allowedItemStatuses = ['all', 'in_stock', 'low_stock', 'out_of_stock'];
    if (!in_array($filters['item_status'], $allowedItemStatuses, true)) {
        $filters['item_status'] = 'all';
    }

    $startDate = Carbon::now()->subDays($filters['date_range']);

    $itemQuery = Items::query();
    if ($filters['item_status'] !== 'all') {
        $itemQuery->where('status', $filters['item_status']);
    }

    $totalItems = (clone $itemQuery)->count();
    $inventorySummary = (clone $itemQuery)
        ->select('unit', DB::raw('SUM(stock_quantity) as total_quantity'))
        ->groupBy('unit')
        ->get()
        ->map(fn ($row) => [
            'unit' => $row->unit,
            'total_quantity' => intval($row->total_quantity),
        ]);

    $inventoryStatusBreakdown = (clone $itemQuery)
        ->select('status', DB::raw('COUNT(*) as total'))
        ->groupBy('status')
        ->get()
        ->map(fn ($row) => [
            'status' => $row->status,
            'total' => $row->total,
        ]);

    $lowStockItems = (clone $itemQuery)
        ->where('stock_quantity', '<=', 5)
        ->get(['id', 'description', 'stock_quantity', 'unit', 'status']);

    $requestQuery = Requests::with('user')
        ->where('created_at', '>=', $startDate)
        ->when($filters['request_status'] !== 'all', fn ($query) => $query->where('status', $filters['request_status']))
        ->when($filters['item_status'] !== 'all', fn ($query) =>
            $query->whereHas('items', fn ($query) =>
                $query->whereHas('item', fn ($query) => $query->where('status', $filters['item_status']))
            )
        );

    $requestItemsBase = RequestItems::with(['item', 'request'])
        ->where('created_at', '>=', $startDate)
        ->when($filters['request_status'] !== 'all', fn ($query) =>
            $query->whereHas('request', fn ($query) => $query->where('status', $filters['request_status']))
        )
        ->when($filters['item_status'] !== 'all', fn ($query) =>
            $query->whereHas('item', fn ($query) => $query->where('status', $filters['item_status']))
        );

    $recentRequests = (clone $requestItemsBase)
        ->latest('created_at')
        ->take(6)
        ->get()
        ->map(fn ($requestItem) => [
            'id' => $requestItem->id,
            'description' => $requestItem->item->description ?? 'N/A',
            'issued_quantity' => intval($requestItem->issued_quantity ?? $requestItem->quantity),
            'user' => optional($requestItem->request->user)->firstname . ' ' . optional($requestItem->request->user)->lastname,
            'status' => $requestItem->request->status ?? 'Unknown',
            'date' => $requestItem->created_at->format('M d, H:i'),
        ]);

    $totalRequests = (clone $requestQuery)->count();
    $totalRequestItems = (clone $requestItemsBase)->sum('quantity');
    $totalIssuedQuantity = (clone $requestItemsBase)->sum(DB::raw('COALESCE(issued_quantity, quantity)'));

    $frequentlyRequested = (clone $requestItemsBase)
        ->select('item_id', DB::raw('SUM(quantity) as request_count'))
        ->groupBy('item_id')
        ->orderByDesc('request_count')
        ->take(5)
        ->get()
        ->map(fn ($req) => [
            'id' => $req->item_id,
            'description' => $req->item->description ?? 'N/A',
            'request_count' => intval($req->request_count),
        ]);

    $requestsOverTime = (clone $requestQuery)
        ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as request_count'))
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->map(fn ($r) => [
            'date' => Carbon::parse($r->date)->format('M d'),
            'request_count' => $r->request_count,
        ]);

    $requestStatusBreakdown = (clone $requestQuery)
        ->select('status', DB::raw('COUNT(*) as total'))
        ->groupBy('status')
        ->get()
        ->map(fn ($row) => [
            'status' => $row->status,
            'total' => $row->total,
        ]);

    $fulfillmentRate = $totalRequestItems > 0 ? round($totalIssuedQuantity / $totalRequestItems * 100) : 0;
    $restockNeed = $totalItems > 0 ? round($lowStockItems->count() / $totalItems * 100) : 0;
    $topItemShare = $totalRequestItems > 0 ? round((optional($frequentlyRequested->first())['request_count'] ?? 0) / $totalRequestItems * 100) : 0;

    $totalUsers = User::count();

    return Inertia::render('Admin/Dashboard', [
        'dashboard' => [
            'total_items' => $totalItems,
            'low_stock_items' => $lowStockItems,
            'recent_requests' => $recentRequests,
            'frequently_requested' => $frequentlyRequested,
            'inventory_summary' => $inventorySummary,
            'inventory_status_breakdown' => $inventoryStatusBreakdown,
            'requests_over_time' => $requestsOverTime,
            'total_users' => $totalUsers,
            'total_requests' => $totalRequests,
            'request_status_breakdown' => $requestStatusBreakdown,
            'fulfillment_rate' => $fulfillmentRate,
            'restock_need' => $restockNeed,
            'top_item_share' => $topItemShare,
        ],
        'filters' => $filters,
        'request_statuses' => $allowedRequestStatuses,
        'item_statuses' => $allowedItemStatuses,
        'date_ranges' => $allowedDateRanges,
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
            'quantity' => intval($r->quantity),
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
