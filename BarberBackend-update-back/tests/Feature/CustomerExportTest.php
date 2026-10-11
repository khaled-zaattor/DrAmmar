<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerExportTest extends TestCase
{
    use RefreshDatabase;

    private Barber $barber;

    private Service $service;

    protected function defineEnvironment($app): void
    {
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', ':memory:');
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->barber = Barber::create(['name' => 'Export Barber', 'is_active' => true]);
        $this->service = Service::create([
            'name' => 'Export Service',
            'price' => 30,
            'duration_minutes' => 30,
            'is_active' => true,
        ]);
    }

    public function test_admin_exports_unique_normalized_customers_for_customer_match(): void
    {
        $this->appointment('John Smith', ' JOHN@example.com ', '(727) 555-1234', 'completed');
        $this->appointment('John Smith', 'john@example.com', '727-555-1234', 'pending');
        $this->appointment('Jane Doe', 'jane@example.com', '8135550100', 'confirmed');
        $this->appointment('Gone Guy', 'gone@example.com', '8135550199', 'cancelled');

        Sanctum::actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));

        $response = $this->get('/api/admin/customers/export');

        $response->assertOk();
        $rows = array_map('str_getcsv', explode("\n", trim($response->streamedContent())));

        $this->assertSame(['Email', 'Phone', 'First Name', 'Last Name', 'Country'], $rows[0]);
        $this->assertCount(3, $rows);
        $this->assertContains(['john@example.com', '+17275551234', 'John', 'Smith', 'US'], $rows);
        $this->assertContains(['jane@example.com', '+18135550100', 'Jane', 'Doe', 'US'], $rows);
    }

    public function test_non_admin_cannot_export_customers(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'receptionist', 'is_active' => true]));

        $this->getJson('/api/admin/customers/export')->assertForbidden();
    }

    private function appointment(string $name, string $email, string $phone, string $status): void
    {
        $sequence = Appointment::count() + 1;
        $appointment = new Appointment([
            'customer_name' => $name,
            'customer_email' => $email,
            'customer_phone' => $phone,
            'barber_id' => $this->barber->id,
            'appointment_date' => now()->addDays($sequence)->toDateString(),
            'appointment_time' => sprintf('%02d:00', 8 + $sequence),
            'duration_minutes' => 30,
            'total_price' => 30,
            'status' => $status,
        ]);
        $appointment->service_id = $this->service->id;
        $appointment->save();
    }
}
