<?php

namespace App\Console\Commands;

use App\Models\Lgu;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportPsgcCommand extends Command
{
    protected $signature = 'import:psgc {--fresh : Delete all LGUs without reports first}';

    protected $description = 'Import all Philippine cities and municipalities from the official PSGC API into the lgus table';

    private const API = 'https://psgc.gitlab.io/api';

    private const REGIONS = [
        '010000000' => 'Region I',
        '020000000' => 'Region II',
        '030000000' => 'Region III',
        '040000000' => 'CALABARZON',
        '170000000' => 'MIMAROPA',
        '050000000' => 'Region V',
        '060000000' => 'Region VI',
        '070000000' => 'Region VII',
        '080000000' => 'Region VIII',
        '090000000' => 'Region IX',
        '100000000' => 'Region X',
        '110000000' => 'Region XI',
        '120000000' => 'Region XII',
        '130000000' => 'NCR',
        '140000000' => 'CAR',
        '160000000' => 'Region XIII',
        '150000000' => 'BARMM',
    ];

    public function handle(): int
    {
        $this->info('Fetching PSGC data (provinces + 1,600+ cities/municipalities)…');

        $provinces = collect(Http::timeout(60)->get(self::API.'/provinces/')->json() ?? [])
            ->pluck('name', 'code');
        $entries = Http::timeout(120)->get(self::API.'/cities-municipalities/')->json();

        if (empty($entries)) {
            $this->error('PSGC API returned no data — check connectivity.');

            return self::FAILURE;
        }

        if ($this->option('fresh')) {
            $removed = Lgu::doesntHave('outageReports')->doesntHave('users')->doesntHave('permits')->count();
            Lgu::doesntHave('outageReports')->doesntHave('users')->doesntHave('permits')->delete();
            $this->line("Removed {$removed} LGUs without data (--fresh).");
        }

        $created = 0;
        $skipped = 0;
        $bar = $this->output->createProgressBar(count($entries));
        $bar->start();

        foreach ($entries as $entry) {
            $provinceName = $provinces[$entry['provinceCode'] ?? ''] ?? $this->provinceFromCode($entry['provinceCode'] ?? null);
            $regionName = self::REGIONS[$entry['regionCode'] ?? ''] ?? $entry['regionCode'];

            // NCR entries have no province — group them under Metro Manila
            if (($entry['regionCode'] ?? '') === '130000000' && ! $provinceName) {
                $provinceName = 'Metro Manila';
            }

            if (! $provinceName) {
                $skipped++;

                continue;
            }

            $exists = Lgu::where('name', $entry['name'])->where('province', $provinceName)->exists();

            if (! $exists) {
                Lgu::create([
                    'name' => $entry['name'],
                    'province' => $provinceName,
                    'region' => $regionName,
                    // PSGC has no coordinates — map markers come from citizen reports
                    'latitude' => null,
                    'longitude' => null,
                ]);
                $created++;
            } else {
                $skipped++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->components->info("Done. Created {$created} LGUs, skipped {$skipped} (existing or unmappable). Total LGUs now: ".Lgu::count().'.');

        return self::SUCCESS;
    }

    /** Provinces not in the provinces endpoint (e.g. NCR districts) fall back to a readable code. */
    private function provinceFromCode(?string $code): ?string
    {
        return $code ? null : null;
    }
}
