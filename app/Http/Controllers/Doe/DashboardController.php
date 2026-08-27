<?php

namespace App\Http\Controllers\Doe;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Permit;
use App\Models\User;
use App\Services\MetricsService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->hasRole('agency_staff', 'agency_head'), 403);

        $user = $request->user();
        $isHead = $user->hasRole('agency_head');

        // National metrics
        $metrics = MetricsService::nationalMetrics();

        // Permits assigned to DOE
        $permits = Permit::query()
            ->where('agency_id', $user->agency_id)
            ->with('applicant:id,name,email')
            ->latest()
            ->paginate(10)
            ->through(fn ($p) => [
                'id' => $p->id,
                'permit_type' => $p->permit_type,
                'description' => $p->description,
                'status' => $p->status,
                'ai_compliance_score' => $p->ai_compliance_score,
                'applicant' => $p->applicant?->name,
                'submitted_at' => $p->created_at->diffForHumans(),
            ]);

        // Advisories by DOE
        $advisories = Announcement::query()
            ->where('agency_id', $user->agency_id)
            ->latest()
            ->paginate(10)
            ->through(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'body' => $a->body,
                'severity' => $a->severity,
                'created_at' => $a->created_at->diffForHumans(),
            ]);

        // DOE staff activity (for head only)
        $staffActivity = [];
        if ($isHead) {
            $staffIds = User::where('agency_id', $user->agency_id)
                ->where('id', '!=', $user->id)
                ->pluck('id');

            $staffActivity = \App\Models\AuditLog::whereIn('user_id', $staffIds)
                ->with('user:id,name')
                ->latest('created_at')
                ->take(20)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'user' => $log->user?->name ?? 'Unknown',
                    'action' => $log->action,
                    'entity' => class_basename($log->entity_type) . ' #' . $log->entity_id,
                    'time' => $log->created_at->diffForHumans(),
                ]);
        }

        return inertia('Doe/Dashboard', [
            'metrics' => $metrics,
            'permits' => $permits,
            'advisories' => $advisories,
            'staffActivity' => $staffActivity,
            'isHead' => $isHead,
        ]);
    }

    public function approvePermit(Request $request, Permit $permit)
    {
        abort_unless($request->user()->hasRole('agency_staff', 'agency_head'), 403);
        abort_if($permit->agency_id !== $request->user()->agency_id, 403);

        $validated = $request->validate([
            'decision_note' => ['nullable', 'string'],
        ]);

        $permit->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'decision_note' => $validated['decision_note'] ?? null,
        ]);

        \App\Models\AuditLog::record('permit_approved', $permit, ['status' => $permit->getOriginal('status')], ['status' => 'approved']);

        return back()->with('success', 'Permit approved.');
    }

    public function rejectPermit(Request $request, Permit $permit)
    {
        abort_unless($request->user()->hasRole('agency_staff', 'agency_head'), 403);
        abort_if($permit->agency_id !== $request->user()->agency_id, 403);

        $validated = $request->validate([
            'decision_note' => ['required', 'string'],
        ]);

        $permit->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'decision_note' => $validated['decision_note'],
        ]);

        \App\Models\AuditLog::record('permit_rejected', $permit, ['status' => $permit->getOriginal('status')], ['status' => 'rejected']);

        return back()->with('success', 'Permit rejected.');
    }

    public function storeAdvisory(Request $request)
    {
        abort_unless($request->user()->hasRole('agency_staff', 'agency_head'), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'severity' => ['required', 'in:info,warning,critical'],
        ]);

        Announcement::create([
            ...$validated,
            'agency_id' => $request->user()->agency_id,
        ]);

        return back()->with('success', 'Advisory published.');
    }
}
