<?php

namespace App\Http\Controllers;

use App\Models\OutageReport;
use App\Services\NotificationService;
use App\Events\OutageReportUpdated;
use App\Http\Requests\StoreOutageReportRequest;
use App\Services\OutageAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OutageReportController extends Controller
{
    public function __construct(
        protected OutageAiService $ai,
    ) {
    }

    public function index(Request $request)
    {
        $reports = OutageReport::query()
            ->visibleTo($request->user())
            ->latest()
            ->with('lgu:id,name,province')
            ->paginate(10)
            ->withQueryString();

        return inertia('Reports/Index', [
            'reports' => $reports,
        ]);
    }

    public function create(Request $request)
    {
        $lgus = \App\Models\Lgu::orderBy('name')->get(['id', 'name', 'province', 'region', 'latitude', 'longitude']);
        $selectedLgu = null;

        if ($lguId = $request->query('lgu_id')) {
            $selectedLgu = $lgus->firstWhere('id', $lguId)?->only(['id', 'name', 'province', 'region']);
        }

        return inertia('Reports/Create', [
            'lgus' => $lgus,
            'selectedLgu' => $selectedLgu,
        ]);
    }

    public function store(StoreOutageReportRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('outage-photos', 'public');
        }

        /** @var OutageReport $report */
        $report = $request->user()->outageReports()->create([
            ...collect($validated)->except(['photo'])->all(),
            'status' => 'pending',
        ]);

        // AI analysis (OpenRouter or heuristic fallback) — attach to report.
        try {
            $analysis = $this->ai->analyze($report);
            $report->update([
                'ai_severity_score' => $analysis['severity_score'],
                'ai_metadata' => $analysis,
            ]);
        } catch (\Throwable $e) {
            report($e);
        }

        // Notify LGU staff of the affected LGU.
        $staffIds = Auth::check()
            ? \App\Models\User::where('lgu_id', $report->lgu_id)
                ->whereHas('role', fn ($q) => $q->whereIn('name', ['lgu_staff', 'lgu_admin']))
                ->pluck('id')
            : collect();

        foreach ($staffIds as $id) {
            NotificationService::send(
                $id,
                'New outage report in your area',
                "A {$report->outage_type} outage was reported near ".optional($report->lgu)->name.'. AI severity: '.$report->ai_severity_score.'/100.',
                'alerts',
                'push',
                route('lgu.dashboard'),
            );
        }

        broadcast(new OutageReportUpdated($report))->toOthers();

        return redirect()->route('reports.show', $report)
            ->with('success', __('Report submitted. Your ticket ID is #:ticket — estimated response time: :eta.', [
                'ticket' => $report->id,
                'eta' => $report->ai_severity_score >= 70 ? '2–4 hours' : '4–24 hours',
            ]));
    }

    public function show(Request $request, OutageReport $report)
    {
        $this->authorize('view', $report);

        return inertia('Reports/Show', [
            'report' => $report->load('lgu:id,name,province', 'verifier:id,name'),
        ]);
    }
}
