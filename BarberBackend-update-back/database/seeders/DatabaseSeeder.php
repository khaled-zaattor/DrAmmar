<?php

namespace Database\Seeders;

use App\Support\PublicCache;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ServiceCategorySeeder::class,
            ServiceSeeder::class,
            BarberSeeder::class,
            BusinessHourSeeder::class,
        ]);

        // Seeding may replace data that public endpoints cached before the
        // local database was populated. Make the new catalogue visible now.
        PublicCache::bump();
    }
}
