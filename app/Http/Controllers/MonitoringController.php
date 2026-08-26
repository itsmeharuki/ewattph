<?php

namespace App\Http\Controllers;

use App\Models\AiAnalysis;
use App\Models\Announcement;
use App\Models\OutageReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MonitoringController extends Controller
{
    /**
     * Public monitoring page — live grid health, AI risk forecast,
     * and government advisories. No authentication required.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $metrics = Cache::remember('public.metrics', 300, fn () => [
            'power_reliability' => max(50, round(100 - min(50, OutageReport::whereIn('status', ['pending', 'verified'])->count() * 0.8), 1)),
            'active_outages' => OutageReport::whereIn('status', ['pending', 'verified'])->count(),
            'reports_24h' => OutageReport::where('created_at', '>=', now()->subDay())->count(),
            'resolved_today' => OutageReport::where('status', 'resolved')->where('resolved_at', '>=', now()->startOfDay())->count(),
        ]);

        $risk = AiAnalysis::latest('id')->where('type', 'risk_assessment')->first();

        return inertia('Monitoring/Index', [
            'metrics' => $metrics,
            'announcements' => Announcement::with('agency:id,abbreviation')
                ->latest()->take(6)->get(['id', 'agency_id', 'title', 'body', 'severity', 'created_at'])
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'title' => $a->title,
                    'body' => $a->body,
                    'severity' => $a->severity,
                    'source' => $a->agency?->abbreviation ?? 'eWattPH',
                    'published_at' => $a->created_at->diffForHumans(),
                ]),
            'riskZones' => $risk?->data['risk_zones'] ?? [],
        ]);
    }
}
