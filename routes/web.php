<?php

use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\User\RequestingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();

        if ($user->roles->contains('name', 'admin')) {
            return redirect()->route('admin.admin_dashboard');
        }elseif ($user->roles->contains('name', 'user')) {
            return redirect()->route('user.user_dashboard');
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
    
    Route::get('/inventory', [InventoryController::class, 'items'])->name('admin.inventory');
    Route::post('/add-item', [InventoryController::class, 'addItem'])->name('admin.add_item');
    Route::post('/restock-item', [InventoryController::class, 'restock'])->name('admin.restock_item');
    Route::put('/admin/items/{item}', [InventoryController::class, 'update'])->name('admin.update_item');
    Route::get('/requests/{request}', [InventoryController::class, 'showRequest'])->name('admin.requests.show');


    Route::get('/users', [UsersController::class, 'view_users'])->name('admin.view_users');
    Route::post('/add-user', [UsersController::class, 'addUser'])->name('admin.add_user');
    Route::get('/requests', [LoginController::class, 'requests'])->name('admin.requests');
    Route::get('/settings', [LoginController::class, 'settings'])->name('admin.settings');
});

Route::middleware(['auth', 'role:user'])->prefix('user')->group(function () {
    Route::get('/dashboard', [LoginController::class, 'user_dashboard'])->name('user.user_dashboard');
    Route::get('/items', [RequestingController::class, 'user_items'])->name('user.items');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('user.profile');
    Route::post('/requests', [RequestingController::class, 'store'])->name('requests.store');
});

Route::get('/api/admin/notifications', function() {
    $notifications = Auth::user()->notifications()->latest()->get();
    return response()->json($notifications);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



require __DIR__.'/auth.php';
