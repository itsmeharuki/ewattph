<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Permit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'applicant_id',
        'lgu_id',
        'agency_id',
        'permit_type',
        'description',
        'documents',
        'status',
        'ai_compliance_score',
        'ai_metadata',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'decision_note',
    ];

    protected function casts(): array
    {
        return [
            'documents' => 'array',
            'ai_metadata' => 'array',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function applicant()
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }

    public function lgu()
    {
        return $this->belongsTo(Lgu::class);
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function statusHistories()
    {
        return $this->hasMany(PermitStatusHistory::class)->orderBy('created_at');
    }
}
