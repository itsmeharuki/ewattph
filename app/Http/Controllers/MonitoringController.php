<?php

namespace App\Http\Controllers;

use App\Models\Lgu;
use App\Services\MetricsService;
use Illuminate\Http\Request;

class MonitoringController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'lgu_id' => ['nullable', 'integer', 'exists:lgus,id'],
        ]);

        $lgu = isset($validated['lgu_id']) ? Lgu::find($validated['lgu_id']) : null;

        // Use shared metrics — same as NEC dashboard
        $metrics = $lgu
            ? MetricsService::lguMetrics($lgu->id)
            : MetricsService::nationalMetrics();

        return inertia('Monitoring/Index', [
            'metrics' => $metrics,
            'announcements' => MetricsService::advisories($lgu?->id, 6)->items(),
            'riskZones' => MetricsService::riskZones($lgu?->province),
            'autoDetected' => MetricsService::autoDetected(null, $lgu?->province, 10)->items(),
            'selectedLgu' => $lgu ? $lgu->only(['id', 'name', 'province', 'region']) : null,
        ]);
    }
}
