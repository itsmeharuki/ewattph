<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = AppNotification::where('user_id', $request->user()->id)
            ->latest('created_at')
            ->paginate(15);

        return inertia('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function read(Request $request, AppNotification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        if (is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        return back();
    }

    public function readAll(Request $request)
    {
        AppNotification::where('user_id', $request->user()->id)->unread()->update(['read_at' => now()]);

        return back();
    }
}
