<?php

namespace Database\Seeders;

use App\Models\BusinessHour;
use Illuminate\Database\Seeder;

class BusinessHourSeeder extends Seeder
{
    public function run(): void
    {
        $hours = [
            // day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
            ['day_of_week' => 0, 'open_time' => null,    'close_time' => null,    'is_closed' => true],  // Sunday
            ['day_of_week' => 1, 'open_time' => null,    'close_time' => null,    'is_closed' => true],  // Monday
            ['day_of_week' => 2, 'open_time' => '08:30', 'close_time' => '17:30', 'is_closed' => false], // Tuesday
            ['day_of_week' => 3, 'open_time' => '08:30', 'close_time' => '17:30', 'is_closed' => false], // Wednesday
            ['day_of_week' => 4, 'open_time' => '08:30', 'close_time' => '17:30', 'is_closed' => false], // Thursday
            ['day_of_week' => 5, 'open_time' => '08:30', 'close_time' => '17:30', 'is_closed' => false], // Friday
            ['day_of_week' => 6, 'open_time' => '09:00', 'close_time' => '16:00', 'is_closed' => false], // Saturday
        ];

        foreach ($hours as $hour) {
            BusinessHour::updateOrCreate(
                ['day_of_week' => $hour['day_of_week']],
                $hour
            );
        }
    }
}
