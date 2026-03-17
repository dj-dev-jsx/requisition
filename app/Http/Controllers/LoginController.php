<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function admin_dashboard()
    {
        return Inertia::render('Admin/Dashboard');
    }

    public function user_dashboard()
    {
        return Inertia::render('User/Dashboard');
    }
    
    public function app_guide()
    {
        return Inertia::render('Student/Guide');  
    }
}
