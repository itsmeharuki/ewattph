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
            ['Super Admin', 'admin@ewattph.gov.ph', 'super_admin', null, null],
            ['National Emergency Council', 'nec@ewattph.gov.ph', 'national_council', null, null],
            ['Sec. Rafael Lim', 'doe.secretary@ewattph.gov.ph', 'agency_head', null, 'DOE'],
            ['Engr. Carlo Mendoza', 'doe.staff@ewattph.gov.ph', 'agency_staff', null, 'DOE'],
            ['Dir. Elena Torres', 'dole.staff@ewattph.gov.ph', 'agency_staff', null, 'DOLE'],
            ['Gov. Ana Dela Cruz', 'governor.batangas@ewattph.gov.ph', 'provincial_admin', 'Batangas City', null],
            ['QC Mayor', 'qc.mayor@ewattph.gov.ph', 'lgu_admin', 'Quezon City', null],
            ['Maria Santos', 'qc.staff@ewattph.gov.ph', 'lgu_staff', 'Quezon City', null],
            ['Batangas Staff', 'batangas.staff@ewattph.gov.ph', 'lgu_staff', 'Batangas City', null],
            ['Juan dela Cruz', 'citizen1@example.com', 'citizen', null, null],
            ['Pedro Ramos', 'citizen2@example.com', 'citizen', null, null],
            ['Solar Company', 'solarcompany@example.com', 'company', null, null],
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

        $citizen = User::where('email', 'citizen1@example.com')->first();
        $citizen2 = User::where('email', 'citizen2@example.com')->first();
        $staff = User::where('email', 'qc.staff@ewattph.gov.ph')->first();
        $doe = Agency::where('abbreviation', 'DOE')->first();

        $reports = [
            ['lat' => 14.6507, 'lng' => 121.1029, 'status' => 'verified', 'type' => 'transformer', 'sev' => 78, 'desc' => 'Loud explosion from transformer near corner store, whole street dark.', 'hoursAgo' => 3],
            ['lat' => 14.6850, 'lng' => 121.0110, 'status' => 'pending', 'type' => 'brownout', 'sev' => 45, 'desc' => 'Flickering power since this morning in our barangay.', 'hoursAgo' => 6],
            ['lat' => 14.7030, 'lng' => 121.0610, 'status' => 'resolved', 'type' => 'distribution_line', 'sev' => 62, 'desc' => 'Fallen line after strong winds last night.', 'hoursAgo' => 20],
            ['lat' => 14.5995, 'lng' => 120.9842, 'status' => 'pending', 'type' => 'rotational_blackout', 'sev' => 40, 'desc' => 'Scheduled-looking blackout in Ermita area.', 'hoursAgo' => 2],
            ['lat' => 13.7565, 'lng' => 121.0583, 'status' => 'verified', 'type' => 'transmission_line', 'sev' => 88, 'desc' => 'Industrial zone without power for two hours already.', 'hoursAgo' => 4],
            ['lat' => 14.2119, 'lng' => 121.1653, 'status' => 'pending', 'type' => 'brownout', 'sev' => 35, 'desc' => 'Voltage very low, appliances struggling.', 'hoursAgo' => 8],
            // ── Visayas ──
            ['lat' => 10.3157, 'lng' => 123.8854, 'status' => 'verified', 'type' => 'distribution_line', 'sev' => 70, 'desc' => 'Fallen distribution line along the highway, half of the barangay is out.', 'hoursAgo' => 5],
            ['lat' => 11.2442, 'lng' => 125.0042, 'status' => 'pending', 'type' => 'brownout', 'sev' => 48, 'desc' => 'Intermittent power since early morning in downtown area.', 'hoursAgo' => 7],
            ['lat' => 10.7202, 'lng' => 122.5621, 'status' => 'pending', 'type' => 'transformer', 'sev' => 66, 'desc' => 'Transformer sparking near the market before the outage.', 'hoursAgo' => 3],
            ['lat' => 9.6496, 'lng' => 123.8536, 'status' => 'resolved', 'type' => 'brownout', 'sev' => 30, 'desc' => 'Short brownout after the storm passed.', 'hoursAgo' => 22],
            // ── Mindanao ──
            ['lat' => 7.1907, 'lng' => 125.4553, 'status' => 'verified', 'type' => 'rotational_blackout', 'sev' => 72, 'desc' => 'Rotational blackout hit the whole district right on schedule.', 'hoursAgo' => 6],
            ['lat' => 8.4822, 'lng' => 124.6472, 'status' => 'pending', 'type' => 'transmission_line', 'sev' => 80, 'desc' => 'Loud blast from the substation, wide area without power.', 'hoursAgo' => 2],
            ['lat' => 6.1164, 'lng' => 125.1716, 'status' => 'pending', 'type' => 'brownout', 'sev' => 44, 'desc' => 'No power in the port area for over an hour.', 'hoursAgo' => 9],
            ['lat' => 6.9214, 'lng' => 122.0790, 'status' => 'resolved', 'type' => 'distribution_line', 'sev' => 52, 'desc' => 'Crews fixed the line early this morning.', 'hoursAgo' => 16],
            // ── Northern Luzon ──
            ['lat' => 16.4023, 'lng' => 120.5960, 'status' => 'pending', 'type' => 'brownout', 'sev' => 38, 'desc' => 'Flickering voltage in the evening, appliances acting up.', 'hoursAgo' => 11],
            ['lat' => 17.6132, 'lng' => 121.7270, 'status' => 'verified', 'type' => 'transformer', 'sev' => 68, 'desc' => 'Transformer blew near the public market, whole street is dark.', 'hoursAgo' => 4],
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
            'author_id' => User::where('email', 'doe.secretary@ewattph.gov.ph')->value('id'),
            'title' => 'DOE: Load shedding schedule for Luzon grid',
            'body' => 'The Department of Energy announces rotational interruptions in select areas of Metro Manila and CALABARZON due to thin reserves during peak hours (2PM–6PM). Affected electric cooperatives will publish local schedules.',
            'severity' => 'warning',
        ]);

        AiAnalysis::create([
            'type' => 'risk_assessment',
            'region' => 'National',
            'data' => [
                'source' => 'mock',
                'generated_at' => now()->toIso8601String(),
                'risk_zones' => [
                    ['region' => 'NCR', 'province' => 'Metro Manila', 'risk_level' => 'medium', 'predicted_cause' => 'Transformer overloads during peak demand'],
                    ['region' => 'CALABARZON', 'province' => 'Batangas', 'risk_level' => 'high', 'predicted_cause' => 'Transmission constraint affecting industrial loads'],
                    ['region' => 'Region VII', 'province' => 'Cebu', 'risk_level' => 'high', 'predicted_cause' => 'Distribution line failures under storm recovery load'],
                    ['region' => 'Region XI', 'province' => 'Davao del Sur', 'risk_level' => 'medium', 'predicted_cause' => 'Sustained rotational blackouts from reserve deficiency'],
                    ['region' => 'Region X', 'province' => 'Misamis Oriental', 'risk_level' => 'high', 'predicted_cause' => 'Substation capacity constraint on the northern corridor'],
                ],
                'recommended_actions' => ['Pre-position crews in high-risk areas nationwide', 'Issue public advisory for rotational brownouts', 'Coordinate NGCP inter-regional transfer limits'],
                'affected_sectors' => ['Residential', 'Industrial zones', 'Commercial establishments', 'Agriculture'],
            ],
            'created_at' => now(),
        ]);
    }
}
