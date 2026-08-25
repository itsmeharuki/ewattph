<?php

namespace App\Services;

use App\Models\AiAnalysis;
use App\Models\Lgu;
use App\Models\OutageReport;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class RiskAssessmentService
{
    public function __construct(
        protected OpenRouterService $ai,
        protected OutageAiService $outageAi,
    ) {
    }

    /**
     * Aggregate last-24h outage data per region and produce predictive risk zones.
     * Stores result in ai_analyses and returns the analysis model.
     */
    public function run(): ?AiAnalysis
    {
        $reports = OutageReport::query()
            ->where('created_at', '>=', now()->subDay())
            ->with('lgu')
            ->get();

        if ($reports->isEmpty()) {
            Log::info('Risk assessment skipped: no recent reports');

            return null;
        }

        $dataset = $this->buildDataset($reports);

        $result = $this->callAi($dataset) ?? $this->mockAssessment($dataset);

        return AiAnalysis::create([
            'type' => 'risk_assessment',
            'region' => $result['regions'][0] ?? null,
            'data' => [
                'source' => $result['source'],
                'generated_at' => now()->toIso8601String(),
                ...$result,
            ],
        ]);
    }

    protected function buildDataset(Collection $reports): array
    {
        return $reports
            ->groupBy(fn ($r) => $r->lgu?->region ?? 'Unknown')
            ->map(function ($group, $region) {
                $provinces = $group->groupBy(fn ($r) => $r->lgu?->province ?? 'Unknown')
                    ->map(fn ($g) => [
                        'province' => $g->first()->lgu?->province ?? 'Unknown',
                        'report_count' => $g->count(),
                        'verified_count' => $g->where('status', 'verified')->count(),
                        'resolved_count' => $g->where('status', 'resolved')->count(),
                        'avg_severity' => round($g->avg('ai_severity_score') ?? 0),
                        'common_outage_types' => array_slice(array_keys($g->countBy('outage_type')->sortDesc()->toArray()), 0, 3),
                    ])->values();

                return [
                    'region' => $region,
                    'total_reports_24h' => $group->count(),
                    'provinces' => $provinces,
                ];
            })->values()->toArray();
    }

    protected function callAi(array $dataset): ?array
    {
        $prompt = 'You are a national grid-risk forecaster for the Philippines. Analyze this dataset of outage reports from the last 24 hours.'
            .' Identify regions with high risk of outages in the next 48 hours. Respond ONLY with JSON:'
            .' {"risk_zones": [{"region": "", "province": "", "risk_level": "low|medium|high|critical", "predicted_cause": ""}],'
            .' "recommended_actions": ["..."], "affected_sectors": ["..."]}'
            ."\n\nDataset:\n".json_encode($dataset);

        $content = $this->ai->chat([
            ['role' => 'system', 'content' => 'You are a precise JSON-only risk forecasting engine for the Philippine power grid. Never output prose.'],
            ['role' => 'user', 'content' => $prompt],
        ], jsonMode: true);

        $parsed = $this->ai->extractJson($content);

        if (! $parsed || empty($parsed['risk_zones'])) {
            return null;
        }

        return [
            'source' => 'openrouter',
            'model' => config('services.openrouter.model'),
            'risk_zones' => array_values((array) $parsed['risk_zones']),
            'recommended_actions' => array_values((array) ($parsed['recommended_actions'] ?? [])),
            'affected_sectors' => array_values((array) ($parsed['affected_sectors'] ?? [])),
        ];
    }

    protected function mockAssessment(array $dataset): array
    {
        Log::info('Using mock risk assessment');

        $zones = collect($dataset)
            ->map(function ($d) {
                $top = collect($d['provinces'])->sortByDesc('report_count')->first();

                $level = match (true) {
                    $top['report_count'] >= 10 => 'critical',
                    $top['report_count'] >= 6 => 'high',
                    $top['report_count'] >= 3 => 'medium',
                    default => 'low',
                };

                return [
                    'region' => $d['region'],
                    'province' => $top['province'],
                    'risk_level' => $level,
                    'predicted_cause' => str_contains(implode(',', $top['common_outage_types']), 'rotational')
                        ? 'Sustained load shedding demand exceeding available capacity'
                        : 'Aging distribution equipment under elevated load',
                ];
            })
            ->sortByDesc(fn ($z) => ['low' => 0, 'medium' => 1, 'high' => 2, 'critical' => 3][$z['risk_level']])
            ->values()->all();

        return [
            'source' => 'mock',
            'risk_zones' => $zones,
            'recommended_actions' => [
                'Position response crews in high-risk provinces before peak hours',
                'Coordinate with NGCP on transmission loading limits',
                'Prepare public advisories for rotational brownouts in affected regions',
            ],
            'affected_sectors' => ['Residential', 'Commercial establishments', 'Industrial zones', 'Healthcare facilities'],
        ];
    }
}
