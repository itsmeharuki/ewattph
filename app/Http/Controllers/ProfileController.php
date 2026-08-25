<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        return inertia('Profile/Edit', [
            'user' => $request->user()->only(['name', 'email', 'locale', 'push_enabled']),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($request->user()->id)],
            'locale' => ['required', 'in:en,fil'],
        ]);

        $request->user()->update($validated);

        return back()->with('success', __('Profile updated.'));
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update(['password' => $validated['password']]);

        return back()->with('success', __('Password updated.'));
    }

    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'push_enabled' => ['required', 'boolean'],
        ]);

        $request->user()->update($validated);

        return back()->with('success', __('Preferences saved.'));
    }

    /** GDPR-like data export. */
    public function export(Request $request)
    {
        $user = $request->user();

        return response()->streamDownload(function () use ($user) {
            echo json_encode([
                'profile' => $user->only(['name', 'email', 'locale', 'push_enabled', 'created_at']),
                'outage_reports' => $user->outageReports()->get()->toArray(),
                'permits' => $user->permits()->get()->toArray(),
                'notifications' => $user->notifications()->get()->toArray(),
            ], JSON_PRETTY_PRINT);
        }, 'ewattph-data-export.json');
    }
}
