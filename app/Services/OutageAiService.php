<?php

namespace App\Services;

use App\Models\OutageReport;
use Illuminate\Support\Facades\Log;

class OutageAiService
{
    public function __construct(protected OpenRouterService $ai)
    {
    }

    /**
     * Analyze an outage report: severity score (0-100), probable cause, suggested actions.
     * Uses nearby reports from the last 24h as context. Falls back to a heuristic
     * mock when OpenRouter is not configured.
     */
    public function analyze(OutageReport $report): array
    {
        $nearby = OutageReport::query()
            ->where('id', '!=', $report->id)
            ->where('created_at', '>=', now()->subDay())
            ->where('lgu_id', $report->lgu_id)
            ->count();

        $context = [
            'outage_type' => $report->outage_type,
            'description' => OpenRouterService::sanitize((string) $report->description),
            'reports_same_lgu_last_24h' => $nearby,
            'latitude' => (float) $report->latitude,
            'longitude' => (float) $report->longitude,
        ];

        $prompt = 'You are an energy-grid emergency analyst for the Philippines. Analyze this power outage report and respond ONLY with JSON:'
            .' {"severity_score": <0-100 int>, "probable_cause": "<short string>", "suggested_actions": ["<action>", "..."]}'
            ."\n\nReport data:\n".json_encode($context);

        $content = $this->ai->chat([
            ['role' => 'system', 'content' => 'You are a precise JSON-only grid outage analyst. Never output prose.'],
            ['role' => 'user', 'content' => $prompt],
        ], jsonMode: true);

        $parsed = $this->ai->extractJson($content);

        if (! $parsed || ! isset($parsed['severity_score'])) {
            return $this->mockAnalysis($report, $nearby);
        }

        return [
            'source' => 'openrouter',
            'model' => config('services.openrouter.model'),
            'severity_score' => max(0, min(100, (int) $parsed['severity_score'])),
            'probable_cause' => (string) ($parsed['probable_cause'] ?? 'Unknown'),
            'suggested_actions' => array_values((array) ($parsed['suggested_actions'] ?? [])),
        ];
    }

    protected function mockAnalysis(OutageReport $report, int $nearby): array
    {
        Log::info('Using mock AI analysis for outage report', ['report_id' => $report->id]);

        $base = match ($report->outage_type) {
            'transmission_line' => 75,
            'transformer' => 55,
            'distribution_line' => 50,
            'rotational_blackout' => 40,
            default => 30,
        };

        return [
            'source' => 'mock',
            'severity_score' => min(100, $base + min(25, $nearby * 5)),
            'probable_cause' => $report->outage_type === 'rotational_blackout'
                ? 'Grid load balancing / scheduled load shedding'
                : 'Possible equipment failure near reported location',
            'suggested_actions' => [
                'Dispatch assessment team to verify location',
                $nearby >= 3 ? 'Multiple reports in area — check feeder/branch line' : 'Coordinate with local electric cooperative',
                'Notify affected barangay officials',
            ],
        ];
    }
}
