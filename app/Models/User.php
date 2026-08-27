<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'lgu_id',
        'agency_id',
        'push_enabled',
        'locale',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'push_enabled' => 'boolean',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function lgu()
    {
        return $this->belongsTo(Lgu::class);
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function outageReports()
    {
        return $this->hasMany(OutageReport::class);
    }

    public function permits()
    {
        return $this->hasMany(Permit::class, 'applicant_id');
    }

    public function notifications()
    {
        return $this->hasMany(AppNotification::class, 'user_id');
    }

    public function hasRole(string ...$names): bool
    {
        return in_array($this->role?->name, $names, true);
    }

    public function isCitizen(): bool
    {
        return $this->hasRole(Role::CITIZEN);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(Role::SUPER_ADMIN);
    }

    public function isGovernmentStaff(): bool
    {
        return ! $this->isCitizen() && ! $this->hasRole('pending');
    }

    public function canManageLgu(): bool
    {
        return $this->hasRole(Role::LGU_STAFF, Role::LGU_ADMIN, Role::PROVINCIAL_ADMIN) && (bool) $this->lgu_id;
    }

    public function canReviewPermits(): bool
    {
        return $this->hasRole(Role::AGENCY_STAFF, Role::AGENCY_HEAD, Role::LGU_STAFF, Role::LGU_ADMIN, Role::PROVINCIAL_ADMIN);
    }

    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->whereNull('read_at')->count();
    }
}
