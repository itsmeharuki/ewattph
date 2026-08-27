<?php

namespace App\Http\Controllers\Nec;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\EmergencyDeclaration;
use App\Models\Permit;
use App\Models\User;
use App\Services\MetricsService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->hasRole('national_council'), 403);

        return inertia('Nec/Dashboard', [
            'metrics' => MetricsService::nationalMetrics(),
            'announcements' => MetricsService::advisories(null, 5),
            'riskZones' => MetricsService::riskZones(),
            'autoDetected' => MetricsService::autoDetected(null, null, 5),
            'agencyStatus' => $this->agencyStatus(),
            'emergencyActive' => EmergencyDeclaration::where('status', 'active')->latest()->first(),
        ]);
    }

    public function declareEmergency(Request $request)
    {
        abort_unless($request->user()->hasRole('national_council'), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'severity' => ['required', 'in:critical,high,medium'],
        ]);

        EmergencyDeclaration::create([
            ...$validated,
            'declared_by' => $request->user()->id,
            'status' => 'active',
        ]);

        return back()->with('success', 'State of emergency declared.');
    }

    public function deactivateEmergency(Request $request)
    {
        abort_unless($request->user()->hasRole('national_council'), 403);

        EmergencyDeclaration::where('status', 'active')
            ->update(['status' => 'resolved', 'resolved_at' => now()]);

        return back()->with('success', 'Emergency declaration deactivated.');
    }

    private function agencyStatus()
    {
        return Agency::all(['id', 'name', 'abbreviation', 'type'])->map(function ($agency) {
            return [
                'id' => $agency->id,
                'name' => $agency->name,
                'abbreviation' => $agency->abbreviation,
                'type' => $agency->type,
                'staff_count' => User::where('agency_id', $agency->id)->count(),
                'permits_pending' => Permit::where('agency_id', $agency->id)
                    ->whereIn('status', ['submitted', 'in_review'])->count(),
            ];
        });
    }
}
