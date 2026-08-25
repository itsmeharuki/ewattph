<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    protected $fillable = ['name', 'abbreviation', 'type'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function permits()
    {
        return $this->hasMany(Permit::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }
}
