<?php

namespace App\Http\Controllers\Lgu;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\OutageReport;
use App\Models\Permit;
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

        // Permits for this LGU
        $permits = Permit::where('lgu_id', $user->lgu_id)
            ->with('applicant:id,name,email', 'reviewer:id,name')
            ->latest()
            ->paginate(10)
            ->through(fn ($p) => [
                'id' => $p->id,
                'permit_type' => $p->permit_type,
                'description' => $p->description,
                'status' => $p->status,
                'ai_compliance_score' => $p->ai_compliance_score,
                'applicant' => $p->applicant?->name,
                'reviewer' => $p->reviewer?->name,
                'decision_note' => $p->decision_note,
                'submitted_at' => $p->created_at->diffForHumans(),
            ]);

        return inertia('Lgu/Dashboard', [
            'lgu' => $user->lgu()->first(['id', 'name', 'province', 'region']),
            'reports' => $reports,
            'permits' => $permits,
            'isHead' => $user->hasRole('lgu_admin'),
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

    /** LGU Staff recommends approval/rejection for a permit */
    public function recommendPermit(Request $request, Permit $permit)
    {
        $user = $request->user();
        abort_unless($user->hasRole('lgu_staff', 'lgu_admin'), 403);
        abort_if($permit->lgu_id !== $user->lgu_id, 403);
        abort_if(!in_array($permit->status, ['submitted', 'in_review']), 422, 'Permit cannot be recommended in its current status.');

        $validated = $request->validate([
            'decision' => ['required', 'in:recommended_for_approval,recommended_for_rejection'],
            'decision_note' => ['nullable', 'string'],
        ]);

        $old = ['status' => $permit->status];
        $permit->update([
            'status' => $validated['decision'],
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'decision_note' => $validated['decision_note'] ?? null,
        ]);

        AuditLog::record("permit_{$validated['decision']}", $permit, $old, ['status' => $validated['decision']]);

        return back()->with('success', 'Recommendation submitted.');
    }

    /** LGU Administrator makes final approval/rejection */
    public function approvePermit(Request $request, Permit $permit)
    {
        $user = $request->user();
        abort_unless($user->hasRole('lgu_admin'), 403);
        abort_if($permit->lgu_id !== $user->lgu_id, 403);
        abort_unless($permit->status === 'recommended_for_approval', 422, 'Permit must be recommended for approval first.');

        $validated = $request->validate([
            'decision_note' => ['nullable', 'string'],
        ]);

        $old = ['status' => $permit->status];
        $permit->update([
            'status' => 'approved',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'decision_note' => $validated['decision_note'] ?? null,
        ]);

        AuditLog::record('permit_approved', $permit, $old, ['status' => 'approved']);

        return back()->with('success', 'Permit approved.');
    }

    public function rejectPermit(Request $request, Permit $permit)
    {
        $user = $request->user();
        abort_unless($user->hasRole('lgu_admin'), 403);
        abort_if($permit->lgu_id !== $user->lgu_id, 403);
        abort_unless($permit->status === 'recommended_for_rejection', 422, 'Permit must be recommended for rejection first.');

        $validated = $request->validate([
            'decision_note' => ['required', 'string'],
        ]);

        $old = ['status' => $permit->status];
        $permit->update([
            'status' => 'rejected',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'decision_note' => $validated['decision_note'],
        ]);

        AuditLog::record('permit_rejected', $permit, $old, ['status' => 'rejected']);

        return back()->with('success', 'Permit rejected.');
    }

    protected function avgResponseHours($reports): float
    {
        $durations = $reports->map(fn ($r) => $r->resolved_at?->diffInHours($r->created_at))->filter();

        return (float) ($durations->isEmpty() ? 0 : $durations->avg());
    }
}
