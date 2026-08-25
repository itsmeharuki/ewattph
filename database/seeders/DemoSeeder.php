<?php

namespace Database\Seeders;

use App\Models\AiAnalysis;
use App\Models\Announcement;
use App\Models\Agency;
use App\Models\Lgu;
use App\Models\OutageReport;
use App\Models\Permit;
use App\Models\PermitStatusHistory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $role = fn (string $name) => Role::where('name', $name)->value('id');

        $qc = Lgu::where('name', 'Quezon City')->first();

        $users = [
            ['Super Admin', 'admin@ewattph.gov', 'super_admin', null, null],
            ['Maria Santos', 'lgu.staff@quezoncity.gov.ph', 'lgu_staff', 'Quezon City', null],
            ['Engr. Jose Reyes', 'lgu.admin@quezoncity.gov.ph', 'lgu_admin', 'Quezon City', null],
            ['Gov. Ana Dela Cruz', 'provincial@calabarzon.gov.ph', 'provincial_admin', null, null],
            ['Engr. Carlo Mendoza', 'staff@doe.gov.ph', 'agency_staff', null, 'DOE'],
            ['Sec. Rafael Lim', 'head@doe.gov.ph', 'agency_head', null, 'DOE'],
            ['Dir. Elena Torres', 'council@ndrrmc.gov.ph', 'national_council', null, null],
            ['Juan dela Cruz', 'juan@example.com', 'citizen', null, null],
            ['Pedro Ramos', 'pedro@example.com', 'citizen', null, null],
        ];

        foreach ($users as [$name, $email, $roleName, $lguName, $agencyAbbr]) {
            User::firstOrCreate(['email' => $email], [
                'name' => $name,
                'password' => 'password',
                'role_id' => $role($roleName),
                'lgu_id' => $lguName ? Lgu::where('name', $lguName)->value('id') : null,
                'agency_id' => $agencyAbbr ? Agency::where('abbreviation', $agencyAbbr)->value('id') : null,
                'email_verified_at' => now(),
            ]);
        }

        if (OutageReport::exists()) {
            return;
        }

        $citizen = User::where('email', 'juan@example.com')->first();
        $citizen2 = User::where('email', 'pedro@example.com')->first();
        $staff = User::where('email', 'lgu.staff@quezoncity.gov.ph')->first();
        $doe = Agency::where('abbreviation', 'DOE')->first();

        $reports = [
            ['lat' => 14.6507, 'lng' => 121.1029, 'status' => 'verified', 'type' => 'transformer', 'sev' => 78, 'desc' => 'Loud explosion from transformer near corner store, whole street dark.', 'hoursAgo' => 3],
            ['lat' => 14.6850, 'lng' => 121.0110, 'status' => 'pending', 'type' => 'brownout', 'sev' => 45, 'desc' => 'Flickering power since this morning in our barangay.', 'hoursAgo' => 6],
            ['lat' => 14.7030, 'lng' => 121.0610, 'status' => 'resolved', 'type' => 'distribution_line', 'sev' => 62, 'desc' => 'Fallen line after strong winds last night.', 'hoursAgo' => 20],
            ['lat' => 14.5995, 'lng' => 120.9842, 'status' => 'pending', 'type' => 'rotational_blackout', 'sev' => 40, 'desc' => 'Scheduled-looking blackout in Ermita area.', 'hoursAgo' => 2],
            ['lat' => 13.7565, 'lng' => 121.0583, 'status' => 'verified', 'type' => 'transmission_line', 'sev' => 88, 'desc' => 'Industrial zone without power for two hours already.', 'hoursAgo' => 4],
            ['lat' => 14.2119, 'lng' => 121.1653, 'status' => 'pending', 'type' => 'brownout', 'sev' => 35, 'desc' => 'Voltage very low, appliances struggling.', 'hoursAgo' => 8],
        ];

        foreach ($reports as $i => $r) {
            $reporter = $i % 2 === 0 ? $citizen : $citizen2;
            OutageReport::create([
                'user_id' => $reporter->id,
                'lgu_id' => Lgu::nearest($r['lat'], $r['lng'])->id,
                'latitude' => $r['lat'],
                'longitude' => $r['lng'],
                'description' => $r['desc'],
                'outage_type' => $r['type'],
                'status' => $r['status'],
                'ai_severity_score' => $r['sev'],
                'ai_metadata' => ['source' => 'mock', 'severity_score' => $r['sev'], 'probable_cause' => 'Seeded demo report', 'suggested_actions' => ['Dispatch assessment team']],
                'verified_by' => $r['status'] === 'verified' ? $staff->id : null,
                'resolved_at' => $r['status'] === 'resolved' ? now()->subHours(10) : null,
                'created_at' => now()->subHours($r['hoursAgo']),
            ]);
        }

        $permit = Permit::create([
            'applicant_id' => $citizen->id,
            'lgu_id' => $qc->id,
            'permit_type' => 'solar_rooftop',
            'description' => '5kW rooftop solar installation for residential property in Quezon City.',
            'documents' => [['path' => 'seed/demo.pdf', 'name' => 'site_plan.pdf']],
            'status' => 'in_review',
            'ai_compliance_score' => 82,
            'ai_metadata' => ['source' => 'mock', 'compliance_score' => 82, 'issues' => [], 'missing_requirements' => [], 'summary' => 'Complete application; awaiting engineering clearance.'],
            'submitted_at' => now()->subDays(4),
        ]);

        PermitStatusHistory::create([
            'permit_id' => $permit->id, 'old_status' => null, 'new_status' => 'submitted',
            'user_id' => $citizen->id, 'note' => 'Application submitted — AI compliance score: 82/100', 'created_at' => now()->subDays(4),
        ]);
        PermitStatusHistory::create([
            'permit_id' => $permit->id, 'old_status' => 'submitted', 'new_status' => 'in_review',
            'user_id' => $staff->id, 'note' => 'Routed to engineering review.', 'created_at' => now()->subDays(2),
        ]);

        Announcement::create([
            'agency_id' => $doe->id,
            'author_id' => User::where('email', 'head@doe.gov.ph')->value('id'),
            'title' => 'DOE: Load shedding schedule for Luzon grid',
            'body' => 'The Department of Energy announces rotational interruptions in select areas of Metro Manila and CALABARZON due to thin reserves during peak hours (2PM–6PM). Affected electric cooperatives will publish local schedules.',
            'severity' => 'warning',
        ]);

        AiAnalysis::create([
            'type' => 'risk_assessment',
            'region' => 'NCR',
            'data' => [
                'source' => 'mock',
                'generated_at' => now()->toIso8601String(),
                'risk_zones' => [
                    ['region' => 'NCR', 'province' => 'Metro Manila', 'risk_level' => 'medium', 'predicted_cause' => 'Transformer overloads during peak demand'],
                    ['region' => 'CALABARZON', 'province' => 'Batangas', 'risk_level' => 'high', 'predicted_cause' => 'Transmission constraint affecting industrial loads'],
                ],
                'recommended_actions' => ['Pre-position crews in high-risk areas', 'Issue public advisory for rotational brownouts'],
                'affected_sectors' => ['Residential', 'Industrial zones'],
            ],
            'created_at' => now(),
        ]);
    }
}
