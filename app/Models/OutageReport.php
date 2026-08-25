<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OutageReport extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'lgu_id',
        'latitude',
        'longitude',
        'description',
        'photo_path',
        'outage_type',
        'status',
        'ai_severity_score',
        'ai_metadata',
        'dispatch_notes',
        'verified_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'ai_metadata' => 'array',
            'latitude' => 'float',
            'longitude' => 'float',
            'resolved_at' => 'datetime',
        ];
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lgu()
    {
        return $this->belongsTo(Lgu::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /** Reports visible to a given user: own reports for citizens, LGU-scoped for staff. */
    public function scopeVisibleTo($query, User $user)
    {
        if ($user->canManageLgu()) {
            return $query->where('lgu_id', $user->lgu_id);
        }

        return $query->where('user_id', $user->id);
    }

    public function severityColor(): string
    {
        return match (true) {
            $this->status === 'resolved' => '#10B981',
            $this->status === 'pending' => '#F59E0B',
            $this->ai_severity_score >= 70 => '#EF4444',
            default => '#F97316',
        };
    }
}
