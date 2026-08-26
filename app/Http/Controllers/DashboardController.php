<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Public landing page — system overview (no live data; that lives on /monitoring).
     */
    public function home(Request $request)
    {
        $user = $request->user();

        return inertia('Home', [
            'greeting' => $this->greeting($user?->name),
            'myReportsCount' => $user ? $user->outageReports()->count() : 0,
            'myActivePermits' => $user ? $user->permits()->whereIn('status', ['submitted', 'in_review'])->count() : 0,
        ]);
    }

    protected function greeting(?string $name): string
    {
        $hour = (int) now('Asia/Manila')->format('G');

        $salutation = match (true) {
            $hour < 12 => __('Magandang Umaga'),
            $hour < 18 => __('Magandang Hapon'),
            default => __('Magandang Gabi'),
        };

        return $name ? "{$salutation}, {$name}!" : "{$salutation}!";
    }
}
