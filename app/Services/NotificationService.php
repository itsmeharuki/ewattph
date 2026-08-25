<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\User;

class NotificationService
{
    public static function send(User|int $user, string $title, string $message, string $category = 'updates', string $type = 'in_app', ?string $link = null): AppNotification
    {
        return AppNotification::create([
            'user_id' => $user instanceof User ? $user->id : $user,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'category' => $category,
            'link' => $link,
        ]);
    }
}
