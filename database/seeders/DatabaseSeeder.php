<?php

namespace Database\Seeders;

use App\Models\Lgu;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            LgusAgenciesSeeder::class,
        ]);

        // Demo dataset (pilot: Metro Manila + CALABARZON)
        $this->call(DemoSeeder::class);

        // Extra citizens via factory
        User::factory(10)->create(['lgu_id' => Lgu::inRandomOrder()->value('id')]);
    }
}
