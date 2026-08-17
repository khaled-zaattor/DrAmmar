<?php

use App\Models\BusinessHour;
use App\Support\PublicCache;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $hours = [
            // day_of_week: 0=Sunday … 6=Saturday
            ['day_of_week' => 0, 'open_time' => '09:00', 'close_time' => '15:00', 'is_closed' => false],
            ['day_of_week' => 1, 'open_time' => '09:00', 'close_time' => '21:00', 'is_closed' => false],
            ['day_of_week' => 2, 'open_time' => '09:00', 'close_time' => '21:00', 'is_closed' => false],
            ['day_of_week' => 3, 'open_time' => '09:00', 'close_time' => '21:00', 'is_closed' => false],
            ['day_of_week' => 4, 'open_time' => '09:00', 'close_time' => '21:00', 'is_closed' => false],
            ['day_of_week' => 5, 'open_time' => '09:00', 'close_time' => '21:00', 'is_closed' => false],
            ['day_of_week' => 6, 'open_time' => '09:00', 'close_time' => '19:00', 'is_closed' => false],
        ];

        foreach ($hours as $hour) {
            BusinessHour::updateOrCreate(
                ['day_of_week' => $hour['day_of_week']],
                $hour
            );
        }

        PublicCache::bump();
    }

    public function down(): void
    {
        $hours = [
            ['day_of_week' => 0, 'open_time' => null,    'close_time' => null,    'is_closed' => true],
            ['day_of_week' => 1, 'open_time' => null,    'close_time' => null,    'is_closed' => true],
            ['day_of_week' => 2, 'open_time' => '08:30', 'close_time' => '17:30', 'is_closed' => false],
            ['day_of_week' => 3, 'open_time' => '08:30', 'close_time' => '17:30', 'is_closed' => false],
            ['day_of_week' => 4, 'open_time' => '08:30', 'close_time' => '17:30', 'is_closed' => false],
            ['day_of_week' => 5, 'open_time' => '08:30', 'close_time' => '17:30', 'is_closed' => false],
            ['day_of_week' => 6, 'open_time' => '09:00', 'close_time' => '16:00', 'is_closed' => false],
        ];

        foreach ($hours as $hour) {
            BusinessHour::updateOrCreate(
                ['day_of_week' => $hour['day_of_week']],
                $hour
            );
        }

        PublicCache::bump();
    }
};
