<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiAnalysis extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['type', 'region', 'province', 'data'];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
