<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyDeclaration extends Model
{
    protected $fillable = [
        'title',
        'description',
        'severity',
        'declared_by',
        'status',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function declarer()
    {
        return $this->belongsTo(User::class, 'declared_by');
    }
}
