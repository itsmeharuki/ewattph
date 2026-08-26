<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lgu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PlacesController extends Controller
{
    /**
     * GET /api/public/places?q=manila&limit=15
     *
     * Search LGUs by name or province. Returns cached results when no query
     * (full list for the dropdown). Throttled at 30/min per IP in routes/api.php.
     */
    public function index(Request $request): JsonResponse
    {
        $q = $request->input('q', '');
        $limit = min((int) $request->input('limit', 20), 50);

        $places = Cache::remember("places.{$q}.{$limit}", 120, function () use ($q, $limit) {
            $query = Lgu::query()->select('id', 'name', 'province', 'region', 'latitude', 'longitude');

            if ($q) {
                $query->where(function ($w) use ($q) {
                    $w->where('name', 'LIKE', "%{$q}%")
                      ->orWhere('province', 'LIKE', "%{$q}%")
                      ->orWhere('region', 'LIKE', "%{$q}%");
                });
            }

            return $query->orderBy('name')->limit($limit)->get();
        });

        return response()->json($places);
    }
}
