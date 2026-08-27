<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EmailOtp extends Model
{
    protected $fillable = ['email', 'code', 'type', 'verified', 'expires_at'];
    protected $casts = [
        'verified' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public static function generate(string $email, string $type = 'registration'): self
    {
        // Invalidate any previous unverified OTPs for this email+type
        static::where('email', $email)
            ->where('type', $type)
            ->where('verified', false)
            ->delete();

        return static::create([
            'email' => $email,
            'code' => str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
            'type' => $type,
            'expires_at' => now()->addMinutes(10),
        ]);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function verify(string $code): bool
    {
        if ($this->isExpired() || $this->verified) {
            return false;
        }

        if (!hash_equals($this->code, $code)) {
            return false;
        }

        $this->update(['verified' => true]);
        return true;
    }
}
