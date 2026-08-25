<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiAnalysis;
use App\Models\Announcement;
use App\Models\OutageReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PublicController extends Controller
{
    /** GET /api/public/map — live national outage map (public, cached 60s). */
    public function map(): JsonResponse
    {
        $data = Cache::remember('public.map', 60, function () {
            $reports = OutageReport::query()
                ->whereIn('status', ['pending', 'verified', 'resolved'])
                ->where('created_at', '>=', now()->subDays(3))
                ->with('lgu:id,name,province')
                ->get(['id', 'lgu_id', 'latitude', 'longitude', 'status', 'outage_type', 'ai_severity_score', 'created_at']);

            $riskZones = AiAnalysis::latest('id')->where('type', 'risk_assessment')->first()?->data['risk_zones'] ?? [];

            return [
                'reports' => $reports->map(fn ($r) => [
                    'id' => $r->id,
                    'lat' => (float) $r->latitude,
                    'lng' => (float) $r->longitude,
                    'status' => $r->status,
                    'outage_type' => $r->outage_type,
                    'severity' => $r->ai_severity_score,
                    'lgu' => $r->lgu?->name,
                    'reported_at' => $r->created_at->toIso8601String(),
                ]),
                'risk_zones' => $riskZones,
            ];
        });

        return response()->json($data);
    }

    /** GET /api/public/metrics — headline stats for the public dashboard. */
    public function metrics(): JsonResponse
    {
        return response()->json(Cache::remember('public.metrics', 300, function () {
            $active = OutageReport::whereIn('status', ['pending', 'verified'])->count();

            return [
                'power_reliability' => max(50, round(100 - min(50, $active * 0.8), 1)),
                'active_outages' => $active,
                'resolved_today' => OutageReport::where('status', 'resolved')->where('resolved_at', '>=', now()->startOfDay())->count(),
                'reports_24h' => OutageReport::where('created_at', '>=', now()->subDay())->count(),
                'avg_response_hours' => round(OutageReport::whereNotNull('resolved_at')
                    ->where('resolved_at', '>=', now()->subDays(7))
                    ->get(['created_at', 'resolved_at'])
                    ->map(fn ($r) => $r->resolved_at->diffInHours($r.created_at))
                    ->avg() ?? 0, 1),
                'coverage_lgus' => \App\Models\Lgu::count(),
                'updated_at' => now()->toIso8601String(),
            ];
        }));
    }

    /** GET /api/public/announcements — government advisories. */
    public function announcements(): JsonResponse
    {
        return response()->json(
            Announcement::latest()->take(10)
                ->with('agency:id,abbreviation,name')
                ->get(['id', 'agency_id', 'title', 'body', 'severity', 'created_at'])
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'title' => $a->title,
                    'body' => $a->body,
                    'severity' => $a->severity,
                    'source' => $a->agency?->abbreviation ?? 'eWattPH',
                    'published_at' => $a->created_at->diffForHumans(),
                ])
        );
    }
}
