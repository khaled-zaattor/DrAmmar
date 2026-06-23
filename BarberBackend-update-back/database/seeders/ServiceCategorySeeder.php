<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Haircuts',
                'description' => 'Classic and modern haircut styles for every preference.',
                'sort_order'  => 1,
                'is_active'   => true,
            ],
            [
                'name'        => 'Beard & Grooming',
                'description' => 'Professional beard trims, shaping, and grooming services.',
                'sort_order'  => 2,
                'is_active'   => true,
            ],
            [
                'name'        => 'Hot Towel Treatments',
                'description' => 'Traditional hot towel shaves and relaxing facial treatments.',
                'sort_order'  => 3,
                'is_active'   => true,
            ],
            [
                'name'        => 'Waxing & Additional Services',
                'description' => 'Waxing, eyebrow shaping, and other add-on services.',
                'sort_order'  => 4,
                'is_active'   => true,
            ],
        ];

        foreach ($categories as $category) {
            ServiceCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
