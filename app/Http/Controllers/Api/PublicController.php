<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiAnalysis;
use App\Models\Announcement;
use App\Models\AutoDetectedOutage;
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

            $rawZones = AiAnalysis::latest('id')->where('type', 'risk_assessment')->first()?->data['risk_zones'] ?? [];

            // Enrich risk zones with coordinates from lgus table
            $riskZones = collect($rawZones)->map(function ($z) {
                $lgu = \App\Models\Lgu::where('province', $z['province'] ?? '')->first();
                return [...$z, 'lat' => $lgu?->latitude, 'lng' => $lgu?->longitude];
            })->filter(fn ($z) => $z['lat'] && $z['lng'])->values()->all();

            // Auto-detected outages from social media (last 24h, confirmed or high confidence)
            $autoDetected = AutoDetectedOutage::query()
                ->where('status', '!=', 'dismissed')
                ->where('confidence_score', '>=', 50)
                ->where('detected_at', '>=', now()->subDays(2))
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->get([
                    'id', 'source', 'detected_province', 'latitude', 'longitude',
                    'confidence_score', 'outage_type', 'summary', 'status', 'detected_at',
                ])
                ->map(fn ($d) => [
                    'id' => 'auto-' . $d->id,
                    'lat' => (float) $d->latitude,
                    'lng' => (float) $d->longitude,
                    'status' => $d->status === 'confirmed' ? 'verified' : 'pending',
                    'outage_type' => $d->outage_type ?? 'brownout',
                    'severity' => $d->confidence_score,
                    'lgu' => $d->detected_province,
                    'source' => $d->source,
                    'source_label' => AutoDetectedOutage::sourceLabel($d->source),
                    'summary' => $d->summary,
                    'is_auto_detected' => true,
                    'reported_at' => $d->detected_at->toIso8601String(),
                ])
                ->toArray();

            return [
                'reports' => array_merge(
                    $reports->map(fn ($r) => [
                        'id' => $r->id,
                        'lat' => (float) $r->latitude,
                        'lng' => (float) $r->longitude,
                        'status' => $r->status,
                        'outage_type' => $r->outage_type,
                        'severity' => $r->ai_severity_score,
                        'lgu' => $r->lgu?->name,
                        'reported_at' => $r->created_at->toIso8601String(),
                    ])->toArray(),
                    $autoDetected,
                ),
                'risk_zones' => $riskZones,
                'auto_detected_count' => count($autoDetected),
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
