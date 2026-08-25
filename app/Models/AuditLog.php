<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['user_id', 'action', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address'];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public static function record(string $action, Model $entity, ?array $old = null, ?array $new = null): void
    {
        if (! auth()->check()) {
            return;
        }

        self::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'entity_type' => $entity::class,
            'entity_id' => $entity->getKey(),
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => Request::ip(),
        ]);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
