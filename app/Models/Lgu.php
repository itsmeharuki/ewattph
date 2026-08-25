<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lgu extends Model
{
    protected $fillable = ['name', 'province', 'region', 'latitude', 'longitude', 'parent_id'];

    public function parent()
    {
        return $this->belongsTo(Lgu::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Lgu::class, 'parent_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function outageReports()
    {
        return $this->hasMany(OutageReport::class);
    }

    public function permits()
    {
        return $this->hasMany(Permit::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    public function fullName(): string
    {
        return "{$this->name}, {$this->province}";
    }

    public static function nearest(float $latitude, float $longitude): ?self
    {
        return self::query()
            ->get()
            ->sortBy(fn (self $lgu) => ($lgu->latitude - $latitude) ** 2 + ($lgu->longitude - $longitude) ** 2)
            ->first();
    }
}
