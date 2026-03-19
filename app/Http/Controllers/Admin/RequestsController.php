<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Requests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequestsController extends Controller
{
    public function requests()
    {
        // Eager load related data: user, items, and RIS
        $requests = Requests::with([
            'user',           // Requested by
            'items.item',     // Each requested item (if you need item details)
            'ris.issuedBy',   // Issued by user
            'ris.requestedBy',// Requested by user (from RIS)
            'ris.receivedBy', // Received by user
        ])->orderBy('created_at', 'desc')->get();

        // Pass to Inertia view
        return Inertia::render('Admin/Requests', [
            'requests' => $requests,
        ]);
    }
}
