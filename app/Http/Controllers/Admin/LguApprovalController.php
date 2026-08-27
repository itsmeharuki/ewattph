<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class LguApprovalController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $pending = User::query()
            ->with(['role:id,name', 'lgu:id,name,province'])
            ->whereHas('role', fn ($q) => $q->whereIn('name', ['lgu_staff', 'lgu_admin', 'provincial_admin']))
            ->whereNull('email_verified_at')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('Admin/LguApprovals', ['pendingUsers' => $pending]);
    }

    public function approve(Request $request, User $user)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $user->update(['email_verified_at' => now()]);
        AuditLog::record('lgu_account_approved', $user, null, ['approved_by' => $request->user()->id]);

        return back()->with('success', 'LGU account approved.');
    }

    public function reject(Request $request, User $user)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $user->delete();
        AuditLog::record('lgu_account_rejected', $user, null, ['rejected_by' => $request->user()->id]);

        return back()->with('success', 'LGU account rejected and removed.');
    }
}
