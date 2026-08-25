<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermitStatusHistory extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['permit_id', 'old_status', 'new_status', 'user_id', 'note'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function permit()
    {
        return $this->belongsTo(Permit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
