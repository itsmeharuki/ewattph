<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutoDetectedOutage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'source',
        'source_url',
        'source_author',
        'raw_text',
        'detected_province',
        'detected_region',
        'latitude',
        'longitude',
        'lgu_id',
        'confidence_score',
        'ai_analysis',
        'status',
        'outage_type',
        'summary',
        'detected_at',
    ];

    protected function casts(): array
    {
        return [
            'ai_analysis' => 'array',
            'latitude' => 'float',
            'longitude' => 'float',
            'confidence_score' => 'integer',
            'detected_at' => 'datetime',
        ];
    }

    public function lgu(): BelongsTo
    {
        return $this->belongsTo(Lgu::class);
    }

    /**
     * Source display names
     */
    public static function sourceLabel(string $source): string
    {
        return match ($source) {
            'twitter' => 'X (Twitter)',
            'facebook' => 'Facebook',
            'instagram' => 'Instagram',
            'news' => 'News Media',
            'web_search' => 'Web Search',
            'doe' => 'DOE Philippines',
            'ngcp' => 'NGCP',
            'ngcp_twitter' => 'NGCP (X)',
            'meralco' => 'Meralco',
            'pna' => 'PNA',
            'pagasa' => 'DOST-PAGASA',
            'ndrrmc' => 'NDRRMC',
            default => ucfirst($source),
        };
    }

    public function sourceIcon(): string
    {
        return match ($this->source) {
            'twitter' => 'X',
            'facebook' => 'FB',
            'instagram' => 'IG',
            'news' => 'NEWS',
            'web_search' => 'WEB',
            'doe' => 'DOE',
            'ngcp' => 'NGCP',
            'ngcp_twitter' => 'NGCP',
            'meralco' => 'MER',
            'pna' => 'PNA',
            'pagasa' => 'PAG',
            'ndrrmc' => 'NDRR',
            default => strtoupper(substr($this->source, 0, 4)),
        };
    }
}
