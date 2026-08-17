<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds Cache-Control to the public read-only endpoints so repeat visits and
 * back-navigation are served from the browser cache instead of booting PHP.
 *
 * Usage: Route::middleware('public.cache:300')
 */
class CachePublicResponse
{
    public function handle(Request $request, Closure $next, int $maxAge = 300): Response
    {
        $response = $next($request);

        // Only successful reads. Never cache an error or a write.
        if (!$request->isMethodCacheable() || $response->getStatusCode() !== 200) {
            return $response;
        }

        $response->headers->set('Cache-Control', "public, max-age={$maxAge}");

        // The CORS layer varies Access-Control-Allow-Origin by request Origin,
        // so a shared cache must not serve one origin's response to another.
        $response->headers->set('Vary', 'Origin', false);

        return $response;
    }
}
