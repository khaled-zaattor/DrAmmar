<?php

namespace App\Providers;

use App\Models\Barber;
use App\Models\BusinessHour;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Support\PublicCache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        // Keep the public endpoint cache honest: any write to the data behind
        // /api/services, /api/categories, /api/barbers or /api/business-hours
        // invalidates all of it. Cheap — these models are edited rarely.
        // Note: pivot sync() does not fire model events, so Admin\BarberController
        // bumps explicitly after syncing a barber's services.
        foreach ([Service::class, ServiceCategory::class, Barber::class, BusinessHour::class] as $model) {
            $model::saved(fn () => PublicCache::bump());
            $model::deleted(fn () => PublicCache::bump());
        }
    }
}
