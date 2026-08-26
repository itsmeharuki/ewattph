<?php

namespace Database\Seeders;

use App\Models\Lgu;
use Illuminate\Database\Seeder;

/**
 * Nationwide LGU coverage — representative cities/municipalities across
 * all 17 Philippine regions. Production would import the full PSGC master
 * list (1,600+ LGUs); this seed keeps the national demo realistic.
 */
class LgusAgenciesSeeder extends Seeder
{
    public function run(): void
    {
        // name, province, region, lat, lng
        $lgus = [
            // ── NCR ──
            ['Quezon City', 'Metro Manila', 'NCR', 14.6760, 121.0437],
            ['Manila', 'Metro Manila', 'NCR', 14.5995, 120.9842],
            ['Makati', 'Metro Manila', 'NCR', 14.5547, 121.0244],
            ['Pasig', 'Metro Manila', 'NCR', 14.5999, 121.0781],
            ['Taguig', 'Metro Manila', 'NCR', 14.5176, 121.0509],
            ['Caloocan', 'Metro Manila', 'NCR', 14.7602, 121.0383],
            ['Parañaque', 'Metro Manila', 'NCR', 14.4791, 121.0198],
            ['Las Piñas', 'Metro Manila', 'NCR', 14.4448, 120.9939],

            // ── CAR (Cordillera) ──
            ['Baguio', 'Benguet', 'CAR', 16.4023, 120.5960],
            ['La Trinidad', 'Benguet', 'CAR', 16.4547, 120.5865],

            // ── Region I · Ilocos ──
            ['Laoag', 'Ilocos Norte', 'Region I', 18.1978, 120.5944],
            ['Vigan', 'Ilocos Sur', 'Region I', 17.5747, 120.3873],
            ['San Fernando', 'La Union', 'Region I', 16.6159, 120.3187],
            ['Dagupan', 'Pangasinan', 'Region I', 16.0433, 120.3333],

            // ── Region II · Cagayan Valley ──
            ['Tuguegarao', 'Cagayan', 'Region II', 17.6132, 121.7270],
            ['Ilagan', 'Isabela', 'Region II', 17.1485, 121.8892],
            ['Bayombong', 'Nueva Vizcaya', 'Region II', 16.4836, 121.1500],

            // ── Region III · Central Luzon ──
            ['San Fernando', 'Pampanga', 'Region III', 15.0370, 120.6840],
            ['Angeles', 'Pampanga', 'Region III', 15.1450, 120.5860],
            ['Olongapo', 'Zambales', 'Region III', 14.8291, 120.2840],
            ['Cabanatuan', 'Nueva Ecija', 'Region III', 15.4866, 120.9720],
            ['Malolos', 'Bulacan', 'Region III', 14.8430, 120.8130],
            ['Tarlac City', 'Tarlac', 'Region III', 15.4800, 120.5970],

            // ── CALABARZON ──
            ['Antipolo', 'Rizal', 'CALABARZON', 14.5878, 121.1760],
            ['Calamba', 'Laguna', 'CALABARZON', 14.2119, 121.1653],
            ['Santa Rosa', 'Laguna', 'CALABARZON', 14.3122, 121.1110],
            ['Batangas City', 'Batangas', 'CALABARZON', 13.7565, 121.0583],
            ['Tagaytay', 'Cavite', 'CALABARZON', 14.1000, 120.9330],
            ['Lucena', 'Quezon', 'CALABARZON', 13.9314, 121.6172],

            // ── MIMAROPA ──
            ['Calapan', 'Oriental Mindoro', 'MIMAROPA', 13.4110, 121.1800],
            ['Puerto Princesa', 'Palawan', 'MIMAROPA', 9.7392, 118.7352],
            ['Boac', 'Marinduque', 'MIMAROPA', 13.4434, 121.8400],

            // ── Region V · Bicol ──
            ['Legazpi', 'Albay', 'Region V', 13.1391, 123.7340],
            ['Naga', 'Camarines Sur', 'Region V', 13.6218, 123.1920],
            ['Sorsogon City', 'Sorsogon', 'Region V', 12.9783, 124.0040],
            ['Virac', 'Catanduanes', 'Region V', 13.5833, 124.2167],

            // ── Region VI · Western Visayas ──
            ['Iloilo City', 'Iloilo', 'Region VI', 10.7202, 122.5621],
            ['Bacolod', 'Negros Occidental', 'Region VI', 10.6407, 122.9667],
            ['Roxas', 'Capiz', 'Region VI', 11.5853, 122.7519],
            ['Kalibo', 'Aklan', 'Region VI', 11.7036, 122.3653],

            // ── Region VII · Central Visayas ──
            ['Cebu City', 'Cebu', 'Region VII', 10.3157, 123.8854],
            ['Lapu-Lapu', 'Cebu', 'Region VII', 10.3102, 123.9490],
            ['Dumaguete', 'Negros Oriental', 'Region VII', 9.3068, 123.3050],
            ['Tagbilaran', 'Bohol', 'Region VII', 9.6496, 123.8536],

            // ── Region VIII · Eastern Visayas ──
            ['Tacloban', 'Leyte', 'Region VIII', 11.2442, 125.0042],
            ['Ormoc', 'Leyte', 'Region VIII', 11.0058, 124.6122],
            ['Catbalogan', 'Samar', 'Region VIII', 11.7797, 124.8861],
            ['Borongan', 'Eastern Samar', 'Region VIII', 11.6053, 125.4336],

            // ── Region IX · Zamboanga ──
            ['Zamboanga City', 'Zamboanga del Sur', 'Region IX', 6.9214, 122.0790],
            ['Dipolog', 'Zamboanga del Norte', 'Region IX', 8.5864, 123.3405],
            ['Pagadian', 'Zamboanga del Sur', 'Region IX', 7.8257, 123.4370],

            // ── Region X · Northern Mindanao ──
            ['Cagayan de Oro', 'Misamis Oriental', 'Region X', 8.4822, 124.6472],
            ['Iligan', 'Lanao del Norte', 'Region X', 8.2280, 124.2310],
            ['Malaybalay', 'Bukidnon', 'Region X', 8.1575, 125.1278],

            // ── Region XI · Davao ──
            ['Davao City', 'Davao del Sur', 'Region XI', 7.1907, 125.4553],
            ['Tagum', 'Davao del Norte', 'Region XI', 7.4478, 125.8069],
            ['Digos', 'Davao del Sur', 'Region XI', 6.7497, 125.3572],
            ['Mati', 'Davao Oriental', 'Region XI', 6.9556, 126.2167],

            // ── Region XII · SOCCSKSARGEN ──
            ['General Santos', 'South Cotabato', 'Region XII', 6.1164, 125.1716],
            ['Koronadal', 'South Cotabato', 'Region XII', 6.5031, 124.8469],
            ['Kidapawan', 'Cotabato', 'Region XII', 7.0908, 125.0889],

            // ── Region XIII · Caraga ──
            ['Butuan', 'Agusan del Norte', 'Region XIII', 8.9475, 125.5406],
            ['Surigao City', 'Surigao del Norte', 'Region XIII', 9.7859, 125.4947],
            ['Tandag', 'Surigao del Sur', 'Region XIII', 9.0786, 126.1986],

            // ── BARMM ──
            ['Cotabato City', 'Maguindanao', 'BARMM', 7.2231, 124.2462],
            ['Marawi', 'Lanao del Sur', 'BARMM', 8.0000, 124.2833],
            ['Jolo', 'Sulu', 'BARMM', 6.0528, 121.0025],
            ['Lamitan', 'Basilan', 'BARMM', 6.6489, 122.0919],
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
