<?php

use App\Services\RiskAssessmentService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('ai:analyze-risk')->dailyAt('06:00')->withoutOverlapping();
Schedule::command('model:prune')->daily();

Artisan::command('inspire', function () {
    $this->comment(Illuminate\Foundation\Inspiring::quote());
})->purpose('Display an inspiring quote');
