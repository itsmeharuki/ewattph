<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        return inertia('Admin/Users', [
            'users' => User::query()
                ->with(['role:id,name', 'lgu:id,name,province', 'agency:id,abbreviation'])
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'roles' => Role::orderBy('id')->get(['id', 'name']),
            'lgus' => \App\Models\Lgu::orderBy('name')->get(['id', 'name', 'province']),
            'agencies' => \App\Models\Agency::orderBy('abbreviation')->get(['id', 'abbreviation', 'name']),
            'auditLogs' => AuditLog::with('user:id,name')->latest('created_at')->take(20)->get(),
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

        return back()->with('success', __('User updated.'));
    }
}
