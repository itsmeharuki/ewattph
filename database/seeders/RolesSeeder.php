<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    protected array $roles = [
        [Role::CITIZEN, 'General public — view live map, report outages, track own reports'],
        [Role::COMPANY, 'Registered company — apply for business permits'],
        [Role::LGU_STAFF, 'Barangay/City/Municipal employees — verify reports, dispatch teams, process local permits'],
        [Role::LGU_ADMIN, "Mayor's Office / City Administrator — approve dispatches, allocate local resources"],
        [Role::PROVINCIAL_ADMIN, "Governor's Office — coordinate cross-LGU responses"],
        [Role::AGENCY_STAFF, 'National agencies (DOE, DOLE, NGCP…) — monitor domain data, approve permits'],
        [Role::AGENCY_HEAD, 'Secretary / Director — approve policy, issue directives'],
        [Role::NATIONAL_COUNCIL, 'NDRRMC / Office of the President — declare emergencies, oversee all data'],
        [Role::SUPER_ADMIN, 'System administrator — users, roles, AI configuration, logs'],
    ];

    public function run(): void
    {
        foreach ($this->roles as [$name, $description]) {
            Role::firstOrCreate(['name' => $name], ['description' => $description]);
        }
    }
}
