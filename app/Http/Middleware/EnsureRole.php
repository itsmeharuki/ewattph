<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Restrict a route to the given role name(s).
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        abort_unless((bool) $request->user(), 401);

        $allowed = array_map('trim', explode(',', implode(',', $roles)));
        abort_unless(in_array($request->user()->role?->name, $allowed, true), 403);

        return $next($request);
    }
}
