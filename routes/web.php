<?php

use App\Http\Controllers\Api\PlacesController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Lgu\DashboardController as LguDashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OutageReportController;
use App\Http\Controllers\PermitController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// ── Public ─────────────────────────────────────────────────────────────────
Route::get('/', [DashboardController::class, 'home'])->name('welcome');
Route::get('/home', [DashboardController::class, 'home'])->name('home');
Route::get('/monitoring', [\App\Http\Controllers\MonitoringController::class, 'index'])->name('monitoring');
Route::get('/permits/tracker', [PermitController::class, 'tracker'])->name('permits.tracker');

// Live national map page (guests + citizens)
Route::get('/map', fn () => inertia('Map/LiveMap'))->name('map');

// Public API — live map data (throttled 60/min per IP per security.md)
Route::prefix('api/public')->middleware('throttle:60,1')->group(function () {
    Route::get('/map', [PublicController::class, 'map'])->name('api.public.map');
    Route::get('/metrics', [PublicController::class, 'metrics'])->name('api.public.metrics');
    Route::get('/announcements', [PublicController::class, 'announcements'])->name('api.public.announcements');
    Route::get('/places', [PlacesController::class, 'index'])->name('api.public.places');
});

// ── Auth ───────────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register/send-otp', [AuthController::class, 'sendOtp'])->name('register.send-otp');
    Route::post('/register/verify-otp', [AuthController::class, 'verifyOtp'])->name('register.verify-otp');
    Route::post('/register/resend-otp', [AuthController::class, 'resendOtp'])->name('register.resend-otp');
});

// ── Authenticated ──────────────────────────────────────────────────────────
Route::middleware(['auth', \App\Http\Middleware\EnsureRole::class.':citizen,lgu_staff,lgu_admin,provincial_admin,agency_staff,agency_head,national_council,super_admin'])
    ->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

        // Outage reports
        Route::get('/reports', [OutageReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/create', [OutageReportController::class, 'create'])->name('reports.create');
        Route::post('/reports', [OutageReportController::class, 'store'])
            ->middleware('throttle:10,1')
            ->name('reports.store');
        Route::get('/reports/{report}', [OutageReportController::class, 'show'])->name('reports.show');

        // Permits (applicant)
        Route::get('/permits/apply', [PermitController::class, 'create'])->name('permits.create');
        Route::post('/permits', [PermitController::class, 'store'])->name('permits.store');
        Route::get('/permits/{permit}', [PermitController::class, 'show'])->name('permits.show');
        Route::post('/permits/{permit}/review', [PermitController::class, 'review'])
            ->middleware(\App\Http\Middleware\EnsureRole::class.':lgu_staff,lgu_admin,provincial_admin,agency_staff,agency_head')
            ->name('permits.review');

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
        Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');

        // Profile & settings
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
        Route::patch('/profile/preferences', [ProfileController::class, 'updatePreferences'])->name('profile.preferences');
        Route::get('/profile/export', [ProfileController::class, 'export'])->name('profile.export');

        // LGU dashboard
        Route::get('/lgu/dashboard', [LguDashboardController::class, 'index'])
            ->middleware(\App\Http\Middleware\EnsureRole::class.':lgu_staff,lgu_admin,provincial_admin')
            ->name('lgu.dashboard');
        Route::post('/lgu/reports/{report}/verify', [LguDashboardController::class, 'verify'])->name('lgu.reports.verify');
        Route::post('/lgu/reports/{report}/dispatch', [LguDashboardController::class, 'dispatch'])->name('lgu.reports.dispatch');
        Route::post('/lgu/reports/{report}/resolve', [LguDashboardController::class, 'resolve'])->name('lgu.reports.resolve');

        // Admin panel (Super Admin only — system administration)
        Route::prefix('admin')->middleware(\App\Http\Middleware\EnsureRole::class.':super_admin')->group(function () {
            Route::get('/', fn () => inertia('Admin/Dashboard'))->name('admin.dashboard');
            Route::get('/users', [UserController::class, 'index'])->name('admin.users');
            Route::patch('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
            Route::patch('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('admin.users.reset-password');
            Route::patch('/users/{user}/deactivate', [UserController::class, 'deactivate'])->name('admin.users.deactivate');
            Route::patch('/users/{user}/reactivate', [UserController::class, 'reactivate'])->name('admin.users.reactivate');

            Route::get('/logs', [\App\Http\Controllers\Admin\LogController::class, 'index'])->name('admin.logs');
        });

        // NEC panel (National Emergency Council only)
        Route::prefix('nec')->middleware(\App\Http\Middleware\EnsureRole::class.':national_council')->group(function () {
            Route::get('/', [\App\Http\Controllers\Nec\DashboardController::class, 'index'])->name('nec.dashboard');
            Route::post('/declare-emergency', [\App\Http\Controllers\Nec\DashboardController::class, 'declareEmergency'])->name('nec.declare-emergency');
            Route::post('/deactivate-emergency', [\App\Http\Controllers\Nec\DashboardController::class, 'deactivateEmergency'])->name('nec.deactivate-emergency');
        });

        // DOE panel (Department of Energy — agency_staff + agency_head)
        Route::prefix('doe')->middleware(\App\Http\Middleware\EnsureRole::class.':agency_staff,agency_head')->group(function () {
            Route::get('/', [\App\Http\Controllers\Doe\DashboardController::class, 'index'])->name('doe.dashboard');
            Route::post('/permits/{permit}/approve', [\App\Http\Controllers\Doe\DashboardController::class, 'approvePermit'])->name('doe.permits.approve');
            Route::post('/permits/{permit}/reject', [\App\Http\Controllers\Doe\DashboardController::class, 'rejectPermit'])->name('doe.permits.reject');
            Route::post('/advisories', [\App\Http\Controllers\Doe\DashboardController::class, 'storeAdvisory'])->name('doe.advisories.store');
            Route::get('/history', [\App\Http\Controllers\Doe\HistoryController::class, 'index'])->name('doe.history');
        });
    });
