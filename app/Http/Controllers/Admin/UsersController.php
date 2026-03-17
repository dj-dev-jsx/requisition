<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    public function view_users()
    {
        $roles = Role::all()->pluck('name');
        $users = User::all();
        return inertia('Admin/Users', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    public function addUser(Request $request)
    {
        // Validation
        $validated = $request->validate([
            'firstName'       => 'required|string|max:50',
            'lastName'        => 'required|string|max:50',
            'email'           => 'required|email|unique:users,email',
            'username'        => 'required|string|unique:users,username|max:30',
            'password'        => 'required|string|min:6|confirmed',
            'role'            => 'required|string|exists:roles,name',
            // 'division'     => 'nullable|string|max:100', // optional for now
        ]);

        // Create user
        $user = User::create([
            'firstname'     => $validated['firstName'],
            'lastname'      => $validated['lastName'],
            'email'    => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            // 'division' => $validated['division'] ?? null,
        ]);
        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'User added successfully!');
    }
}
