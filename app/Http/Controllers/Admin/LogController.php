<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $logs = AuditLog::with('user:id,name,email')
            ->latest('created_at')
            ->paginate(25)
            ->withQueryString();

        return inertia('Admin/Logs', ['logs' => $logs]);
    }
}
