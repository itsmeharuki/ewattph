<?php

namespace App\Services;

use App\Models\AiAnalysis;
use App\Models\Announcement;
use App\Models\AutoDetectedOutage;
use App\Models\Lgu;
use App\Models\OutageReport;
use Illuminate\Support\Facades\Cache;

class MetricsService
{
    /**
     * Get national metrics — same formula used by both NEC and Monitoring.
     */
    public static function nationalMetrics(): array
    {
        return Cache::remember('metrics.national', 120, function () {
            $activeCitizen = OutageReport::whereIn('status', ['pending', 'verified'])->count();
            $activeAuto = AutoDetectedOutage::where('status', '!=', 'dismissed')
                ->where('confidence_score', '>=', 50)
                ->where('detected_at', '>=', now()->subDays(2))
                ->count();
            $activeTotal = $activeCitizen + $activeAuto;

            $resolvedToday = OutageReport::where('status', 'resolved')
                ->where('resolved_at', '>=', now()->startOfDay())->count();

            $reports24hCitizen = OutageReport::where('created_at', '>=', now()->subDay())->count();
            $reports24hAuto = AutoDetectedOutage::where('detected_at', '>=', now()->subDay())
                ->where('confidence_score', '>=', 50)->count();

            $totalCitizen = OutageReport::count();
            $totalAuto = AutoDetectedOutage::where('status', '!=', 'dismissed')->count();
            $totalResolved = OutageReport::where('status', 'resolved')->count();

            return [
                'power_reliability' => max(50, round(100 - min(50, $activeTotal * 0.6), 1)),
                'active_outages' => $activeTotal,
                'active_citizen' => $activeCitizen,
                'active_auto' => $activeAuto,
                'resolved_today' => $resolvedToday,
                'total_reports' => $totalCitizen + $totalAuto,
                'total_citizen' => $totalCitizen,
                'total_auto' => $totalAuto,
                'total_resolved' => $totalResolved,
                'reports_24h' => $reports24hCitizen + $reports24hAuto,
                'coverage_lgus' => Lgu::count(),
            ];
        });
    }

    /**
     * Get LGU-scoped metrics (for monitoring page with ?lgu_id).
     */
    public static function lguMetrics(int $lguId): array
    {
        return Cache::remember("metrics.lgu.{$lguId}", 120, function () use ($lguId) {
            $base = OutageReport::where('lgu_id', $lguId);
            $active = (clone $base)->whereIn('status', ['pending', 'verified'])->count();

            return [
                'power_reliability' => max(50, round(100 - min(50, $active * 0.6), 1)),
                'active_outages' => $active,
                'active_citizen' => $active,
                'active_auto' => 0,
                'resolved_today' => (clone $base)->where('status', 'resolved')
                    ->where('resolved_at', '>=', now()->startOfDay())->count(),
                'total_reports' => (clone $base)->count(),
                'total_citizen' => (clone $base)->count(),
                'total_auto' => 0,
                'total_resolved' => (clone $base)->where('status', 'resolved')->count(),
                'reports_24h' => (clone $base)->where('created_at', '>=', now()->subDay())->count(),
                'coverage_lgus' => 1,
            ];
        });
    }

    /**
     * Get advisories — same query for both pages.
     */
    public static function advisories(?int $lguId = null, int $perPage = 5)
    {
        $query = Announcement::query()
            ->with('agency:id,abbreviation')
            ->latest();

        if ($lguId) {
            $query->where(fn ($q) => $q->where('lgu_id', $lguId)->orWhereNull('lgu_id'));
        }

        return $query->paginate($perPage)->through(fn ($a) => [
            'id' => $a->id,
            'title' => $a->title,
            'body' => $a->body,
            'severity' => $a->severity,
            'source' => $a->agency?->abbreviation ?? 'eWattPH',
            'published_at' => $a->created_at->diffForHumans(),
        ]);
    }

    /**
     * Get auto-detected outages — same query for both pages.
     */
    public static function autoDetected(?int $lguId = null, ?string $province = null, int $perPage = 5)
    {
        $query = AutoDetectedOutage::query()
            ->where('status', '!=', 'dismissed')
            ->where('confidence_score', '>=', 50)
            ->where('detected_at', '>=', now()->subDays(2));

        if ($province) {
            $query->where('detected_province', $province);
        }

        return $query->latest('detected_at')
            ->paginate($perPage)
            ->through(fn ($d) => [
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
    }

    /**
     * Get risk zones — same query for both pages.
     */
    public static function riskZones(?string $province = null): array
    {
        $risk = AiAnalysis::latest('id')->where('type', 'risk_assessment')->first();
        $zones = collect($risk?->data['risk_zones'] ?? []);

        if ($province) {
            $zones = $zones->filter(fn ($z) => strcasecmp((string) ($z['province'] ?? ''), $province) === 0);
        }

        return $zones->values()->all();
    }
}
