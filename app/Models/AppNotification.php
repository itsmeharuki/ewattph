<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppNotification extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'notifications';

    protected $fillable = ['user_id', 'title', 'message', 'type', 'category', 'link', 'read_at'];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
