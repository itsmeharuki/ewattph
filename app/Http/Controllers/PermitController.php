<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePermitRequest;
use App\Models\Agency;
use App\Models\AuditLog;
use App\Models\Lgu;
use App\Models\Permit;
use App\Models\PermitStatusHistory;
use App\Services\NotificationService;
use App\Services\PermitAiService;
use Illuminate\Http\Request;

class PermitController extends Controller
{
    public function __construct(protected PermitAiService $ai)
    {
    }

    /** Public permit tracker — anyone (even guests) can follow status by reference. */
    public function tracker(Request $request)
    {
        $permits = Permit::query()
            ->when($request->user()?->isCitizen() ?? false, fn ($q) => $q->where('applicant_id', $request->user()->id))
            ->latest('submitted_at')
            ->with(['lgu:id,name,province', 'agency:id,abbreviation', 'reviewer:id,name'])
            ->paginate(10)
            ->withQueryString();

        return inertia('Permits/Index', [
            'permits' => $permits,
            'isPublicTracker' => ! ($request->user()?->isCitizen()),
        ]);
    }

    public function create()
    {
        return inertia('Permits/Create', [
            'lgus' => Lgu::orderBy('name')->get(['id', 'name', 'province']),
            'agencies' => Agency::orderBy('abbreviation')->get(['id', 'abbreviation', 'name']),
        ]);
    }

    public function store(StorePermitRequest $request)
    {
        $validated = $request->validated();

        $paths = [];
        foreach ((array) $request->file('documents', []) as $doc) {
            $paths[] = ['path' => $doc->store('permit-documents', 'public'), 'name' => $doc->getClientOriginalName()];
        }

        /** @var Permit $permit */
        $permit = $request->user()->permits()->create([
            ...collect($validated)->except(['documents'])->all(),
            'documents' => $paths,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        // AI pre-screening → compliance score + routing.
        try {
            $screening = $this->ai->preScreen($permit);
            $permit->update([
                'ai_compliance_score' => $screening['compliance_score'],
                'ai_metadata' => $screening,
            ]);
        } catch (\Throwable $e) {
            report($e);
        }

        PermitStatusHistory::create([
            'permit_id' => $permit->id,
            'old_status' => null,
            'new_status' => 'submitted',
            'user_id' => $request->user()->id,
            'note' => 'Application submitted'.(isset($screening) ? ' — AI compliance score: '.$screening['compliance_score'].'/100' : ''),
        ]);

        return redirect()->route('permits.show', $permit)
            ->with('success', __('Application submitted. Reference #:ref.', ['ref' => str_pad((string) $permit->id, 6, '0', STR_PAD_LEFT)]));
    }

    public function show(Request $request, Permit $permit)
    {
        $this->authorize('view', $permit);

        return inertia('Permits/Show', [
            'permit' => $permit->load(['lgu:id,name,province', 'agency:id,abbreviation,name', 'reviewer:id,name', 'statusHistories.user:id,name']),
        ]);
    }

    public function review(Request $request, Permit $permit)
    {
        abort_unless($request->user()->canReviewPermits(), 403);

        // Scoped access: local permits reviewed by the matching LGU; national ones by any agency staff.
        if ($permit->lgu_id && ! $request->user()->isSuperAdmin()) {
            abort_unless($permit->lgu_id === $request->user()->lgu_id, 403);
        }
        if (! $permit->lgu_id && $permit->agency_id && ! $request->user()->hasRole('super_admin') && $request->user()->agency_id) {
            abort_unless($permit->agency_id === $request->user()->agency_id, 403);
        }

        $validated = $request->validate([
            'decision' => ['required', 'in:in_review,approved,rejected'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        abort_if(in_array($permit->status, ['approved', 'rejected']), 422, 'Permit already has a final decision.');

        $old = ['status' => $permit->status];
        $permit->update([
            'status' => $validated['decision'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => in_array($validated['decision'], ['approved', 'rejected']) ? now() : null,
            'decision_note' => $validated['note'] ?? $permit->decision_note,
        ]);

        PermitStatusHistory::create([
            'permit_id' => $permit->id,
            'old_status' => $old['status'],
            'new_status' => $validated['decision'],
            'user_id' => $request->user()->id,
            'note' => $validated['note'] ?? null,
        ]);

        AuditLog::record("permit_{$validated['decision']}", $permit, $old, ['status' => $validated['decision']]);

        NotificationService::send(
            $permit->applicant_id,
            'Permit '.ucfirst(str_replace('_', ' ', $validated['decision'])),
            "Your {$permit->permit_type} application #".str_pad((string) $permit->id, 6, '0', STR_PAD_LEFT).' is now '.$validated['decision'].'.',
            'updates',
            'push',
            route('permits.show', $permit),
        );

        return back()->with('success', __('Permit status updated.'));
    }
}
