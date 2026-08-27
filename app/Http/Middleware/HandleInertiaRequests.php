<?php

namespace App\Http\Middleware;

use App\Models\AppNotification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        if (file_exists(public_path('build/manifest.json'))) {
            return parent::version($request);
        }

        return null;
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'isSuperAdmin' => $user->isSuperAdmin(),
                    'isNationalCouncil' => $user->hasRole('national_council'),
                    'canManageLgu' => $user->canManageLgu(),
                    'canReviewPermits' => $user->canReviewPermits(),
                    'push_enabled' => $user->push_enabled,
                    'locale' => $user->locale,
                ] : null,
                'unreadNotifications' => fn () => $user
                    ? AppNotification::where('user_id', $user->id)->whereNull('read_at')->count()
                    : 0,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
