<?php

namespace App\Http\Controllers;

use App\Models\AiAnalysis;
use App\Models\Announcement;
use App\Models\AutoDetectedOutage;
use App\Models\Lgu;
use App\Models\OutageReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MonitoringController extends Controller
{
    /**
     * Public monitoring page — live grid health, AI risk forecast,
     * and government advisories. Optional ?lgu_id scopes everything
     * to a specific LGU; otherwise national view.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'lgu_id' => ['nullable', 'integer', 'exists:lgus,id'],
        ]);

        $lgu = isset($validated['lgu_id']) ? Lgu::find($validated['lgu_id']) : null;
        $scopeKey = $lgu?->id ?? 'national';

        $metrics = Cache::remember("public.metrics.{$scopeKey}", 300, function () use ($lgu) {
            $base = OutageReport::query();
            if ($lgu) {
                $base->where('lgu_id', $lgu->id);
            }

            $active = (clone $base)->whereIn('status', ['pending', 'verified'])->count();

            return [
                'power_reliability' => max(50, round(100 - min(50, $active * 0.8), 1)),
                'active_outages' => $active,
                'reports_24h' => (clone $base)->where('created_at', '>=', now()->subDay())->count(),
                'resolved_today' => (clone $base)->where('status', 'resolved')
                    ->where('resolved_at', '>=', now()->startOfDay())->count(),
            ];
        });

        // Advisories: LGU-specific plus national (agency) announcements.
        $announcements = Announcement::query()
            ->when($lgu, fn ($q) => $q->where(fn ($w) => $w->where('lgu_id', $lgu->id)->orWhereNull('lgu_id')))
            ->with('agency:id,abbreviation')
            ->latest()->take(6)
            ->get(['id', 'agency_id', 'lgu_id', 'title', 'body', 'severity', 'created_at'])
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'body' => $a->body,
                'severity' => $a->severity,
                'source' => $a->agency?->abbreviation ?? $a->lgu?->name ?? 'eWattPH',
                'published_at' => $a->created_at->diffForHumans(),
            ]);

        // Risk zones: match the selected LGU's province; national shows all.
        $risk = AiAnalysis::latest('id')->where('type', 'risk_assessment')->first();
        $riskZones = collect($risk?->data['risk_zones'] ?? [])
            ->when($lgu, fn ($zones) => $zones->filter(
                fn ($z) => strcasecmp((string) ($z['province'] ?? ''), (string) $lgu->province) === 0
            )->values())
            ->values()->all();

        // Auto-detected outages from social media (last 24h)
        $autoDetected = AutoDetectedOutage::query()
            ->where('status', '!=', 'dismissed')
            ->where('confidence_score', '>=', 50)
            ->where('detected_at', '>=', now()->subDays(2))
            ->when($lgu, fn ($q) => $q->where('detected_province', $lgu->province))
            ->latest('detected_at')
            ->take(10)
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'source' => $d->source,
                'source_label' => AutoDetectedOutage::sourceLabel($d->source),
                'source_url' => $d->source_url,
                'province' => $d->detected_province,
                'summary' => $d->summary,
                'raw_text' => $d->raw_text,
                'confidence' => $d->confidence_score,
                'outage_type' => $d->outage_type,
                'detected_at' => $d->detected_at->diffForHumans(),
            ]);

        return inertia('Monitoring/Index', [
            'metrics' => $metrics,
            'announcements' => $announcements,
            'riskZones' => $riskZones,
            'autoDetected' => $autoDetected,
            'selectedLgu' => $lgu ? $lgu->only(['id', 'name', 'province', 'region']) : null,
        ]);
    }
}
