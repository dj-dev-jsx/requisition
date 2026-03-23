<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
public function view_users(Request $request)
{
    $search = $request->search;
    $role = $request->role;

    // Get all roles
    $roles = Role::all()->pluck('name');

    $users = User::when($search, function ($query) use ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                  ->orWhere('lastname', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('office', 'like', "%{$search}%");
            });
        })
        ->when($role, function ($query) use ($role) {
            // Use Spatie's role relationship
            $query->role($role); // this automatically filters users with the given role
        })
        ->orderBy('firstname')
        ->paginate(10)
        ->withQueryString();

    return inertia('Admin/Users', [
        'users' => $users,
        'roles' => $roles,
        'filters' => [
            'search' => $search,
            'role' => $role,
        ],
    ]);
}

public function addUser(Request $request)
{
    $validated = $request->validate([
        'firstName' => 'required|string|max:50',
        'lastName' => 'required|string|max:50',
        'email' => 'required|email|unique:users,email',
        'office' => 'required|string|max:100',
        'username' => 'required|string|unique:users,username|max:30',
        'password' => 'required|string|min:6|confirmed',
        'role' => 'required|string|exists:roles,name',
    ]);

    $user = User::create([
        'firstname' => $validated['firstName'],
        'lastname' => $validated['lastName'],
        'email' => $validated['email'],
        'username' => $validated['username'],
        'password' => Hash::make($validated['password']),
    ]);

    $user->assignRole($validated['role']);

    return back()->with('success', 'User added successfully!');
}
}
