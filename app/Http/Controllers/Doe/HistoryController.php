<?php

namespace App\Http\Controllers\Doe;

use App\Http\Controllers\Controller;
use App\Models\AutoDetectedOutage;
use App\Models\Lgu;
use App\Models\OutageReport;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->hasRole('agency_staff', 'agency_head'), 403);

        $filters = $request->only(['region', 'province', 'city', 'status', 'from', 'to']);

        // Get unique regions for filter dropdown
        $regions = Lgu::whereNotNull('region')
            ->distinct()
            ->pluck('region')
            ->sort()
            ->values();

        // Get provinces (filtered by region if set)
        $provincesQuery = Lgu::whereNotNull('province')->distinct();
        if (!empty($filters['region'])) {
            $provincesQuery->where('region', $filters['region']);
        }
        $provinces = $provincesQuery->pluck('province')->sort()->values();

        // Get cities/municipalities (filtered by province if set)
        $citiesQuery = Lgu::whereNotNull('name')->distinct();
        if (!empty($filters['province'])) {
            $citiesQuery->where('province', $filters['province']);
        }
        $cities = $citiesQuery->pluck('name')->sort()->values();

        // ── Citizen Reports ──
        $reportsQuery = OutageReport::with('lgu:id,name,province,region');

        if (!empty($filters['region'])) {
            $reportsQuery->whereHas('lgu', fn ($q) => $q->where('region', $filters['region']));
        }
        if (!empty($filters['province'])) {
            $reportsQuery->whereHas('lgu', fn ($q) => $q->where('province', $filters['province']));
        }
        if (!empty($filters['city'])) {
            $reportsQuery->whereHas('lgu', fn ($q) => $q->where('name', $filters['city']));
        }
        if (!empty($filters['status'])) {
            $reportsQuery->where('status', $filters['status']);
        }
        if (!empty($filters['from'])) {
            $reportsQuery->where('created_at', '>=', $filters['from']);
        }
        if (!empty($filters['to'])) {
            $reportsQuery->where('created_at', '<=', $filters['to'] . ' 23:59:59');
        }

        $citizenReports = $reportsQuery->latest()->get()->map(fn ($r) => [
            'type' => 'reported',
            'id' => $r->id,
            'location' => $r->lgu?->name ?? 'Unknown',
            'province' => $r->lgu?->province ?? '',
            'region' => $r->lgu?->region ?? '',
            'status' => $r->status,
            'severity' => $r->ai_severity_score,
            'description' => $r->description,
            'source' => null,
            'source_url' => null,
            'confidence' => null,
            'outage_type' => $r->outage_type,
            'date' => $r->created_at,
            'formatted_date' => $r->created_at->format('M d, Y h:i A'),
            'duration' => $r->resolved_at
                ? $r->created_at->diffForHumans($r->resolved_at, true)
                : null,
        ]);

        // ── Auto-Detected (Web Scraping) ──
        $autoQuery = AutoDetectedOutage::where('status', '!=', 'dismissed')
            ->where('confidence_score', '>=', 50);

        if (!empty($filters['province'])) {
            $autoQuery->where('detected_province', $filters['province']);
        }
        if (!empty($filters['from'])) {
            $autoQuery->where('detected_at', '>=', $filters['from']);
        }
        if (!empty($filters['to'])) {
            $autoQuery->where('detected_at', '<=', $filters['to'] . ' 23:59:59');
        }

        $autoReports = $autoQuery->latest('detected_at')->get()->map(fn ($d) => [
            'type' => 'auto',
            'id' => $d->id,
            'location' => $d->detected_province ?? 'Unknown',
            'province' => $d->detected_province ?? '',
            'region' => '',
            'status' => 'auto-detected',
            'severity' => 0,
            'description' => $d->summary,
            'source' => AutoDetectedOutage::sourceLabel($d->source),
            'source_url' => $d->source_url,
            'confidence' => $d->confidence_score,
            'outage_type' => $d->outage_type,
            'date' => $d->detected_at,
            'formatted_date' => $d->detected_at->format('M d, Y h:i A'),
            'duration' => null,
        ]);

        // ── Merge & paginate ──
        $all = $citizenReports->concat($autoReports)->sortByDesc('date')->values();
        $perPage = 15;
        $page = max(1, (int) $request->get('page', 1));
        $total = $all->count();
        $lastPage = (int) ceil($total / $perPage);
        $page = min($page, max(1, $lastPage));
        $items = $all->slice(($page - 1) * $perPage, $perPage)->values();

        $paginated = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => '/doe/history', 'query' => array_filter($request->query(), fn ($v) => $v !== null && $v !== '')]
        );

        // ── Most Affected Areas (paginated) ──
        $hotspotPage = $request->get('hotspot_page', 1);
        $hotspotQuery = OutageReport::selectRaw('lgu_id, COUNT(*) as total, SUM(CASE WHEN status = "resolved" THEN 1 ELSE 0 END) as resolved')
            ->groupBy('lgu_id')
            ->orderByDesc('total')
            ->with('lgu:id,name,province');

        $hotspotTotal = (clone $hotspotQuery)->count();
        $hotspots = $hotspotQuery->forPage($hotspotPage, 10)
            ->get()
            ->map(fn ($h) => [
                'location' => $h->lgu?->name ?? 'Unknown',
                'province' => $h->lgu?->province ?? '',
                'total' => $h->total,
                'resolved' => $h->resolved,
                'active' => $h->total - $h->resolved,
            ]);

        $hotspotPaginator = new LengthAwarePaginator(
            $hotspots,
            $hotspotTotal,
            10,
            $hotspotPage,
            ['path' => '/doe/history', 'query' => array_filter($request->query(), fn ($v) => $v !== null && $v !== '')]
        );

        return inertia('Doe/History', [
            'incidents' => $paginated,
            'hotspots' => $hotspotPaginator,
            'regions' => $regions,
            'provinces' => $provinces,
            'cities' => $cities,
            'filters' => $filters,
        ]);
    }
}
