<?php

namespace Database\Seeders;

use App\Models\Lgu;
use Illuminate\Database\Seeder;

class LgusAgenciesSeeder extends Seeder
{
    /** Pilot coverage: Metro Manila + CALABARZON (per flow.md §5). */
    public function run(): void
    {
        $lgus = [
            // name, province, region, lat, lng
            ['Quezon City', 'Metro Manila', 'NCR', 14.6760, 121.0437],
            ['Manila', 'Metro Manila', 'NCR', 14.5995, 120.9842],
            ['Makati', 'Metro Manila', 'NCR', 14.5547, 121.0244],
            ['Pasig', 'Metro Manila', 'NCR', 14.5999, 121.0781],
            ['Taguig', 'Metro Manila', 'NCR', 14.5176, 121.0509],
            ['Caloocan', 'Metro Manila', 'NCR', 14.7602, 121.0383],
            ['Antipolo', 'Rizal', 'CALABARZON', 14.5878, 121.1760],
            ['Calamba', 'Laguna', 'CALABARZON', 14.2119, 121.1653],
            ['Batangas City', 'Batangas', 'CALABARZON', 13.7565, 121.0583],
            ['Lucena', 'Quezon', 'CALABARZON', 13.9314, 121.6172],
        ];

        foreach ($lgus as [$name, $province, $region, $lat, $lng]) {
            Lgu::firstOrCreate(['name' => $name], [
                'province' => $province,
                'region' => $region,
                'latitude' => $lat,
                'longitude' => $lng,
            ]);
        }

        $agencies = [
            ['Department of Energy', 'DOE', 'national'],
            ['Department of Labor and Employment', 'DOLE', 'national'],
            ['National Grid Corporation of the Philippines', 'NGCP', 'national'],
            ['Department of Public Works and Highways', 'DPWH', 'national'],
            ['National Disaster Risk Reduction and Management Council', 'NDRRMC', 'national'],
        ];

        foreach ($agencies as [$name, $abbr, $type]) {
            \App\Models\Agency::firstOrCreate(['abbreviation' => $abbr], ['name' => $name, 'type' => $type]);
        }
    }
}
