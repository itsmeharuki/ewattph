<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['agency_id', 'lgu_id', 'author_id', 'title', 'body', 'severity'];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function lgu()
    {
        return $this->belongsTo(Lgu::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
