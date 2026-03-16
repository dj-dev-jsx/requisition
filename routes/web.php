<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();

        if ($user->roles->contains('name', 'admin')) {
            return redirect()->route('admin.admin_dashboard');
        }

        // fallback: logged in but no role
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect()->route('login')->withErrors([
            'username' => 'Your account does not have an assigned role.',
        ]);
    }

    // guest only
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('dashboard');

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [LoginController::class, 'admin_dashboard'])->name('admin.admin_dashboard');
    Route::get('/inventory', [LoginController::class, 'inventory'])->name('admin.inventory');
    Route::get('/users', [LoginController::class, 'users'])->name('admin.users');
    Route::get('/requests', [LoginController::class, 'requests'])->name('admin.requests');
    Route::get('/settings', [LoginController::class, 'settings'])->name('admin.settings');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



require __DIR__.'/auth.php';
