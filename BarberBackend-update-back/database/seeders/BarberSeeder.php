<?php

namespace Database\Seeders;

use App\Models\Barber;
use App\Models\Service;
use Illuminate\Database\Seeder;

class BarberSeeder extends Seeder
{
    public function run(): void
    {
        $allServiceIds    = Service::pluck('id')->toArray();
        $hairServiceIds   = Service::whereIn('name', ['Classic Haircut', 'Haircut & Beard', 'Kids Haircut'])->pluck('id')->toArray();
        $beardServiceIds  = Service::whereIn('name', ['Beard Trim', 'Haircut & Beard', 'Hot Towel Shave'])->pluck('id')->toArray();

        $barbers = [
            [
                'name'      => 'Marcus Johnson',
                'title'     => 'Master Barber',
                'bio'       => 'Marcus has over 15 years of experience in the industry. Specializing in classic cuts and fades, he brings precision and passion to every client.',
                'phone'     => '+1-555-0101',
                'email'     => 'marcus@barbershop.com',
                'is_active' => true,
                'services'  => $allServiceIds,
            ],
            [
                'name'      => 'Alex Rivera',
                'title'     => 'Senior Barber',
                'bio'       => 'Alex is known for his creative cuts and trendy styles. With 8 years of experience, he keeps up with the latest trends while honoring classic techniques.',
                'phone'     => '+1-555-0102',
                'email'     => 'alex@barbershop.com',
                'is_active' => true,
                'services'  => $hairServiceIds,
            ],
            [
                'name'      => 'James Thompson',
                'title'     => 'Grooming Specialist',
                'bio'       => 'James is our beard and grooming expert. He takes pride in helping clients find their perfect beard style and maintaining it with precision.',
                'phone'     => '+1-555-0103',
                'email'     => 'james@barbershop.com',
                'is_active' => true,
                'services'  => $beardServiceIds,
            ],
        ];

        foreach ($barbers as $barberData) {
            $serviceIds = $barberData['services'];
            unset($barberData['services']);

            $barber = Barber::updateOrCreate(['email' => $barberData['email']], $barberData);
            $barber->services()->sync($serviceIds);
        }
    }
}
