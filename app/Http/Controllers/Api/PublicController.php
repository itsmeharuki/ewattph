<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiAnalysis;
use App\Models\Announcement;
use App\Models\AutoDetectedOutage;
use App\Models\OutageReport;
use App\Services\MetricsService;
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

            $riskZones = collect($rawZones)->map(function ($z) {
                $lgu = \App\Models\Lgu::where('province', $z['province'] ?? '')->first();
                return [...$z, 'lat' => $lgu?->latitude, 'lng' => $lgu?->longitude];
            })->filter(fn ($z) => $z['lat'] && $z['lng'])->values()->all();

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

    /** GET /api/public/metrics — headline stats (same as NEC + Monitoring). */
    public function metrics(): JsonResponse
    {
        return response()->json([
            ...MetricsService::nationalMetrics(),
            'updated_at' => now()->toIso8601String(),
        ]);
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
