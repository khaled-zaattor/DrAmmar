<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Caching for the public read-only endpoints (services, categories, barbers,
 * business hours).
 *
 * These are hit by every visitor on page load and change only when an admin
 * edits them, so on shared hosting they are the cheapest large win available.
 *
 * Invalidation uses a monotonic version prefix rather than cache tags, because
 * the `file` and `database` stores don't support tagging. Bumping the version
 * orphans the old entries, which expire on their own TTL.
 */
class PublicCache
{
    /** Short enough that a missed invalidation self-heals quickly. */
    public const TTL = 300;

    private const VERSION_KEY = 'public_cache_version';

    public static function key(string $suffix): string
    {
        $version = Cache::get(self::VERSION_KEY, 1);

        return "public:v{$version}:{$suffix}";
    }

    /**
     * Remember a value under the current version prefix.
     */
    public static function remember(string $suffix, \Closure $callback): mixed
    {
        return Cache::remember(self::key($suffix), self::TTL, $callback);
    }

    /**
     * Invalidate every public cache entry at once.
     */
    public static function bump(): void
    {
        Cache::forever(self::VERSION_KEY, Cache::get(self::VERSION_KEY, 1) + 1);
    }
}
