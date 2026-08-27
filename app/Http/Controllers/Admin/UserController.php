<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $query = User::query()
            ->with(['role:id,name', 'lgu:id,name,province', 'agency:id,abbreviation']);

        // Filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->input('role_id'));
        }

        if ($request->filled('lgu_id')) {
            $query->where('lgu_id', $request->input('lgu_id'));
        }

        if ($request->filled('agency_id')) {
            $query->where('agency_id', $request->input('agency_id'));
        }

        // Show deactivated too
        if ($request->boolean('show_deactivated')) {
            $query->onlyTrashed();
        }

        $query->latest();

        return inertia('Admin/Users', [
            'users' => $query->paginate(15)->withQueryString(),
            'roles' => Role::orderBy('id')->get(['id', 'name']),
            'lgus' => \App\Models\Lgu::orderBy('name')->get(['id', 'name', 'province']),
            'agencies' => \App\Models\Agency::orderBy('abbreviation')->get(['id', 'abbreviation', 'name']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $validated = $request->validate([
            'role_id' => ['required', 'exists:roles,id'],
            'lgu_id' => ['nullable', 'exists:lgus,id'],
            'agency_id' => ['nullable', 'exists:agencies,id'],
        ]);

        $old = $user->only(['role_id', 'lgu_id', 'agency_id']);
        $user->update(collect($validated)->filter(fn ($v) => $v !== null)->all());
        AuditLog::record('user_role_changed', $user, $old, $validated);

        return back()->with('success', 'User updated.');
    }

    public function resetPassword(Request $request, User $user)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $validated = $request->validate([
            'new_password' => ['required', 'string', 'min:8'],
        ]);

        $user->update(['password' => $validated['new_password']]);
        AuditLog::record('password_reset_by_admin', $user, null, ['reset_by' => $request->user()->id]);

        return back()->with('success', "Password reset for {$user->name}. They can now log in with the new password.");
    }

    public function deactivate(Request $request, User $user)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        abort_if($user->id === $request->user()->id, 400, 'Cannot deactivate your own account.');

        $user->delete();
        AuditLog::record('user_deactivated', $user, null, ['deactivated_by' => $request->user()->id]);

        return back()->with('success', "Account for {$user->name} has been deactivated.");
    }

    public function reactivate(Request $request, User $user)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        User::withTrashed()->where('id', $user->id)->restore();
        AuditLog::record('user_reactivated', $user, null, ['reactivated_by' => $request->user()->id]);

        return back()->with('success', "Account for {$user->name} has been reactivated.");
    }
}
