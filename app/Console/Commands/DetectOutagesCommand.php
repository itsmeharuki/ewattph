<?php

namespace App\Console\Commands;

use App\Services\SocialMediaMonitorService;
use Illuminate\Console\Command;

class DetectOutagesCommand extends Command
{
    protected $signature = 'ewatt:detect-outages';
    protected $description = 'Scan social media and web sources for power outage reports';

    public function handle(SocialMediaMonitorService $monitor): int
    {
        $this->info('🔍 Scanning social media and web sources for outage reports...');

        $detected = $monitor->scan();

        if (empty($detected)) {
            $this->info('No new outages detected.');
            return Command::SUCCESS;
        }

        $this->info("Found " . count($detected) . " new auto-detected outage(s):\n");

        foreach ($detected as $outage) {
            $this->line("  <info>[{$outage->sourceIcon()}]</info> {$outage->detected_province}");
            $this->line("    Confidence: <comment>{$outage->confidence_score}%</comment> | Type: {$outage->outage_type}");
            $this->line("    \"{$outage->summary}\"");
            $this->newLine();
        }

        return Command::SUCCESS;
    }
}
