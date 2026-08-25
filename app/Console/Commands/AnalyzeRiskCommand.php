<?php

namespace App\Console\Commands;

use App\Models\AiAnalysis;
use App\Services\RiskAssessmentService;
use Illuminate\Console\Command;

class AnalyzeRiskCommand extends Command
{
    protected $signature = 'ai:analyze-risk';

    protected $description = 'Run the AI predictive outage risk assessment and store the analysis';

    public function handle(RiskAssessmentService $service): int
    {
        $this->info('Aggregating last-24h data…');

        /** @var AiAnalysis|null $analysis */
        $analysis = $service->run();

        if (! $analysis) {
            $this->warn('No recent reports — nothing to analyze.');

            return self::SUCCESS;
        }

        $zones = collect($analysis->data['risk_zones'] ?? []);

        $this->table(
            ['Region', 'Province', 'Risk', 'Predicted cause'],
            $zones->map(fn ($z) => [$z['region'] ?? '-', $z['province'] ?? '-', $z['risk_level'] ?? '-', $z['predicted_cause'] ?? '-'])->all()
        );

        $actions = collect($analysis->data['recommended_actions'] ?? []);
        if ($actions->isNotEmpty()) {
            $this->info('Recommended actions:');
            $actions->each(fn ($a) => $this->line(" • {$a}"));
        }

        $this->components->info("Stored risk assessment #{$analysis->id} (source: {$analysis->data['source']}).");

        return self::SUCCESS;
    }
}
