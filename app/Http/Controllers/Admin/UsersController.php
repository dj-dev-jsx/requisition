<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    public function view_users(Request $request)
    {
        $search = $request->search;
        $role = $request->role;
        $status = $request->status;

        // Get all roles
        $roles = Role::all()->pluck('name');

        $users = User::with('roles')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('firstname', 'like', "%{$search}%")
                      ->orWhere('lastname', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('office', 'like', "%{$search}%");
                });
            })
            ->when($role, function ($query) use ($role) {
                $query->role($role);
            })
            ->when($status && $status !== 'all', function ($query) use ($status) {
                $query->where('is_active', $status === 'active');
            })
            ->orderBy('firstname')
            ->paginate(10)
            ->withQueryString();

        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'username' => $user->username,
                'office' => $user->office,
                'role' => $user->roles->pluck('name')->first() ?? '',
                'is_active' => $user->is_active ?? true,
            ];
        });

        return inertia('Admin/Users', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
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
            'admin_password' => 'required|string',
        ]);

        if (!Hash::check($validated['admin_password'], Auth::user()->password)) {
            return back()->withErrors(['admin_password' => 'Incorrect admin password.']);
        }

        $user = User::create([
            'firstname' => $validated['firstName'],
            'lastname' => $validated['lastName'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'office' => $validated['office'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return back()->with('success', 'User added successfully!');
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:50',
            'lastName' => 'required|string|max:50',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'office' => 'required|string|max:100',
            'username' => 'required|string|unique:users,username,' . $user->id . '|max:30',
            'password' => 'nullable|string|min:6|confirmed',
            'role' => 'required|string|exists:roles,name',
            'admin_password' => 'required|string',
        ]);

        if (!Hash::check($validated['admin_password'], Auth::user()->password)) {
            return back()->withErrors(['admin_password' => 'Incorrect admin password.']);
        }

        $user->firstname = $validated['firstName'];
        $user->lastname = $validated['lastName'];
        $user->email = $validated['email'];
        $user->username = $validated['username'];
        $user->office = $validated['office'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();
        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'User updated successfully!');
    }

    public function deactivateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'admin_password' => 'required|string',
        ]);

        if (!Hash::check($validated['admin_password'], Auth::user()->password)) {
            return back()->withErrors(['admin_password' => 'Incorrect admin password.']);
        }

        $user->is_active = false;
        $user->save();

        return back()->with('success', 'User account has been marked inactive.');
    }

    public function activateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'admin_password' => 'required|string',
        ]);

        if (!Hash::check($validated['admin_password'], Auth::user()->password)) {
            return back()->withErrors(['admin_password' => 'Incorrect admin password.']);
        }

        $user->is_active = true;
        $user->save();

        return back()->with('success', 'User account has been activated.');
    }
}
