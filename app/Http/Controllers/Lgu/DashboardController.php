<?php

namespace App\Http\Controllers\Lgu;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\OutageReport;
use App\Events\OutageReportUpdated;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user->canManageLgu(), 403);

        $base = OutageReport::where('lgu_id', $user->lgu_id);

        $reports = (clone $base)->latest()->with(['lgu:id,name,province', 'reporter:id,name'])->paginate(15)->withQueryString();

        return inertia('Lgu/Dashboard', [
            'lgu' => $user->lgu()->first(['id', 'name', 'province', 'region']),
            'reports' => $reports,
            'stats' => [
                'pending' => (clone $base)->where('status', 'pending')->count(),
                'verified' => (clone $base)->where('status', 'verified')->count(),
                'resolved' => (clone $base)->where('status', 'resolved')->where('created_at', '>=', now()->subDays(7))->count(),
                'avg_response_hours' => round($this->avgResponseHours((clone $base)->whereNotNull('resolved_at')->get(['created_at', 'resolved_at'])), 1),
            ],
        ]);
    }

    public function verify(Request $request, OutageReport $report)
    {
        abort_unless($request->user()->canManageLgu() && $report->lgu_id === $request->user()->lgu_id, 403);
        abort_if($report->status !== 'pending', 422, 'Report already processed.');

        $old = ['status' => $report->status];
        $report->update(['status' => 'verified', 'verified_by' => $request->user()->id]);
        AuditLog::record('outage_verified', $report, $old, ['status' => 'verified']);

        NotificationService::send(
            $report->user_id,
            'Your outage report was verified',
            "Report #{$report->id} has been verified by ".optional($report->lgu)->name.' response team.',
            'updates',
            'in_app',
            route('reports.show', $report),
        );

        broadcast(new OutageReportUpdated($report))->toOthers();

        return back()->with('success', __('Report verified.'));
    }

    public function dispatch(Request $request, OutageReport $report)
    {
        abort_unless($request->user()->canManageLgu() && $report->lgu_id === $request->user()->lgu_id, 403);

        $validated = $request->validate([
            'dispatch_notes' => ['required', 'string', 'max:1000'],
        ]);

        $old = $report->only('dispatch_notes');
        $report->update($validated);
        AuditLog::record('outage_dispatched', $report, $old, $validated);

        return back()->with('success', __('Response team dispatched.'));
    }

    public function resolve(Request $request, OutageReport $report)
    {
        abort_unless($request->user()->canManageLgu() && $report->lgu_id === $request->user()->lgu_id, 403);
        abort_if($report->status === 'resolved', 422, 'Already resolved.');

        $old = ['status' => $report->status];
        $report->update(['status' => 'resolved', 'resolved_at' => now()]);
        AuditLog::record('outage_resolved', $report, $old, ['status' => 'resolved']);

        NotificationService::send(
            $report->user_id,
            'Power restored',
            "Report #{$report->id} has been marked resolved. Thank you for helping map the grid!",
            'updates',
            'in_app',
            route('reports.show', $report),
        );

        broadcast(new OutageReportUpdated($report))->toOthers();

        return back()->with('success', __('Marked as resolved.'));
    }

    protected function avgResponseHours($reports): float
    {
        $durations = $reports->map(fn ($r) => $r->resolved_at?->diffInHours($r->created_at))->filter();

        return (float) ($durations->isEmpty() ? 0 : $durations->avg());
    }
}
