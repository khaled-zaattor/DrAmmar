<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Senior Citizens (65+)',
                'description' => 'Special discounted haircut for senior citizens aged 65 and above.',
                'price' => 25.00,
                'booking_count' => 106,
                'duration_minutes' => 30,
                'is_active' => true,
                'category' => 'Haircuts',
            ],
            [
                'name' => 'Kids Hair Cut (Under 12)',
                'description' => 'Gentle and fun haircut for children under 12. We make it a great experience!',
                'price' => 25.00,
                'booking_count' => 105,
                'duration_minutes' => 25,
                'is_active' => true,
                'category' => 'Haircuts',
            ],
            [
                'name' => 'Mens Hair Cut',
                'description' => 'A timeless haircut tailored to your style. Includes consultation, cut, and styling.',
                'price' => 30.00,
                'booking_count' => 104,
                'duration_minutes' => 30,
                'is_active' => true,
                'category' => 'Haircuts',
            ],
            [
                'name' => 'Hair Cut & Beard',
                'description' => 'Complete grooming package — haircut and beard trim for the full look.',
                'price' => 45.00,
                'booking_count' => 103,
                'duration_minutes' => 45,
                'is_active' => true,
                'category' => 'Beard & Grooming',
            ],
            [
                'name' => 'Beard Line Up & Shave',
                'description' => 'Professional beard line up and traditional shave for a clean, sharp look.',
                'price' => 20.00,
                'booking_count' => 102,
                'duration_minutes' => 20,
                'is_active' => true,
                'category' => 'Beard & Grooming',
            ],
            [
                'name' => 'Full Edge',
                'description' => 'Precise edge-up and full perimeter clean up for a sharp finish.',
                'price' => 20.00,
                'booking_count' => 101,
                'duration_minutes' => 20,
                'is_active' => true,
                'category' => 'Haircuts',
            ],
        ];

        foreach ($services as $service) {
            $category = $service['category'];
            unset($service['category']);
            $service['category_id'] = ServiceCategory::where('name', $category)->value('id');

            Service::updateOrCreate(['name' => $service['name']], $service);
        }
    }
}
