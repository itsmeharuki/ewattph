<?php

namespace App\Http\Controllers;

use App\Models\AiAnalysis;
use App\Models\Announcement;
use App\Models\OutageReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function home(Request $request)
    {
        $user = $request->user();

        $metrics = Cache::remember('public.metrics', 300, fn () => [
            'power_reliability' => max(50, round(100 - min(50, OutageReport::whereIn('status', ['pending', 'verified'])->count() * 0.8), 1)),
            'active_outages' => OutageReport::whereIn('status', ['pending', 'verified'])->count(),
            'reports_24h' => OutageReport::where('created_at', '>=', now()->subDay())->count(),
            'resolved_today' => OutageReport::where('status', 'resolved')->where('resolved_at', '>=', now()->startOfDay())->count(),
        ]);

        $risk = AiAnalysis::latest('id')->where('type', 'risk_assessment')->first();

        return inertia('Home', [
            'greeting' => $this->greeting($user?->name),
            'metrics' => $metrics,
            'myReportsCount' => $user ? $user->outageReports()->count() : 0,
            'myActivePermits' => $user ? $user->permits()->whereIn('status', ['submitted', 'in_review'])->count() : 0,
            'announcements' => Announcement::with('agency:id,abbreviation')
                ->latest()->take(5)->get(['id', 'agency_id', 'title', 'body', 'severity', 'created_at'])
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

    protected function greeting(?string $name): string
    {
        $hour = (int) now('Asia/Manila')->format('G');

        $salutation = match (true) {
            $hour < 12 => __('Magandang Umaga'),
            $hour < 18 => __('Magandang Hapon'),
            default => __('Magandang Gabi'),
        };

        return $name ? "{$salutation}, {$name}!" : "{$salutation}!";
    }
}
