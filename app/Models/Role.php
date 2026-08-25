<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    public const CITIZEN = 'citizen';
    public const LGU_STAFF = 'lgu_staff';
    public const LGU_ADMIN = 'lgu_admin';
    public const PROVINCIAL_ADMIN = 'provincial_admin';
    public const AGENCY_STAFF = 'agency_staff';
    public const AGENCY_HEAD = 'agency_head';
    public const NATIONAL_COUNCIL = 'national_council';
    public const SUPER_ADMIN = 'super_admin';

    protected $fillable = ['name', 'description'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
