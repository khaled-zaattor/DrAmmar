<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\ClientVisitCount;
use App\Models\CountedAppointmentVisit;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClientVisitCountTest extends TestCase
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

        $this->barber = Barber::create([
            'name' => 'Visit Test Barber',
            'email' => 'visit-barber@example.com',
            'is_active' => true,
        ]);
        $this->service = Service::create([
            'name' => 'Visit Test Service',
            'price' => 30,
            'duration_minutes' => 30,
            'is_active' => true,
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_initial_sync_counts_pending_confirmed_and_completed_appointments(): void
    {
        $this->appointment('completed', '8135550100', 'client@example.com');
        foreach (['pending', 'confirmed', 'cancelled', 'no_show'] as $status) {
            $this->appointment($status, '8135550100', 'client@example.com');
        }

        $response = $this->syncAs('admin');

        $response
            ->assertOk()
            ->assertJsonPath('data.processed_new_phone', 3)
            ->assertJsonPath('data.processed_new_email', 3)
            ->assertJsonPath('data.skipped_invalid', 0);
        $this->assertSummary('phone', '+18135550100', 3);
        $this->assertSummary('email', 'client@example.com', 3);
        $this->assertDatabaseCount('counted_appointment_visits', 6);
    }

    public function test_equivalent_identifiers_group_and_phone_and_email_totals_can_differ(): void
    {
        $this->appointment('completed', '(813) 555-0100', ' SAME@example.com ');
        $this->appointment('completed', '813-555-0100', 'same@EXAMPLE.com');
        $this->appointment('completed', '1 813 555 0100', 'different@example.com');

        $this->syncAs('receptionist')->assertOk();

        $this->assertSummary('phone', '+18135550100', 3);
        $this->assertSummary('email', 'same@example.com', 2);
        $this->assertSummary('email', 'different@example.com', 1);
    }

    public function test_repeated_sync_is_idempotent_and_preserves_summary_update_time(): void
    {
        $this->appointment('completed', '8135550100', 'client@example.com');
        Carbon::setTestNow('2026-08-20 10:00:00');
        $this->syncAs('admin')->assertOk();
        $updatedAt = ClientVisitCount::where('identifier_type', 'phone')->firstOrFail()->last_calculated_at;

        Carbon::setTestNow('2026-08-20 12:00:00');
        $this->syncAs('admin')
            ->assertOk()
            ->assertJsonPath('data.processed_new_phone', 0)
            ->assertJsonPath('data.processed_new_email', 0);

        $summary = ClientVisitCount::where('identifier_type', 'phone')->firstOrFail();
        $this->assertSame(1, $summary->visit_count);
        $this->assertTrue($summary->last_calculated_at->equalTo($updatedAt));
        $this->assertDatabaseCount('counted_appointment_visits', 2);
    }

    public function test_older_excluded_appointment_confirmed_after_first_sync_is_counted_next_time(): void
    {
        $older = $this->appointment('cancelled', '8135550100', 'client@example.com');
        $this->appointment('completed', '8135550100', 'client@example.com');

        $this->syncAs('admin')->assertJsonPath('data.processed_new_phone', 1);
        $older->update(['status' => 'confirmed']);

        $this->syncAs('admin')
            ->assertJsonPath('data.processed_new_phone', 1)
            ->assertJsonPath('data.processed_new_email', 1);
        $this->assertSummary('phone', '+18135550100', 2);
        $this->assertSummary('email', 'client@example.com', 2);
    }

    public function test_status_changes_between_counted_states_do_not_increment_twice(): void
    {
        $appointment = $this->appointment('pending', '8135550100', 'client@example.com');

        $this->syncAs('admin')->assertJsonPath('data.processed_new_phone', 1);
        $appointment->update(['status' => 'confirmed']);
        $this->syncAs('admin')->assertJsonPath('data.processed_new_phone', 0);
        $appointment->update(['status' => 'completed', 'completed_at' => now()]);
        $this->syncAs('admin')->assertJsonPath('data.processed_new_phone', 0);

        $this->assertSummary('phone', '+18135550100', 1);
        $this->assertSummary('email', 'client@example.com', 1);
        $this->assertDatabaseCount('counted_appointment_visits', 2);
    }

    public function test_invalid_identifiers_are_skipped(): void
    {
        $this->appointment('completed', '555-010', 'not-an-email');

        $this->syncAs('admin')
            ->assertJsonPath('data.processed_new_phone', 0)
            ->assertJsonPath('data.processed_new_email', 0)
            ->assertJsonPath('data.skipped_invalid', 2);
        $this->assertDatabaseCount('client_visit_counts', 0);
    }

    public function test_barber_cannot_sync_but_can_see_counts_on_scoped_index(): void
    {
        $barberUser = User::factory()->create(['role' => 'barber', 'is_active' => true]);
        $this->barber->update(['user_id' => $barberUser->id]);
        $own = $this->appointment('completed', '8135550100', 'own@example.com', $this->barber);

        $otherBarber = Barber::create(['name' => 'Other Barber', 'is_active' => true]);
        $this->appointment('completed', '7275550100', 'other@example.com', $otherBarber);

        $this->syncAs('admin')->assertOk();
        Sanctum::actingAs($barberUser);

        $this->postJson('/api/admin/appointments/sync-visit-counts')->assertForbidden();
        $this->getJson('/api/admin/appointments')
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $own->id)
            ->assertJsonPath('data.data.0.phone_visit_count', 1)
            ->assertJsonPath('data.data.0.email_visit_count', 1)
            ->assertJsonStructure([
                'data' => [
                    'data' => [[
                        'phone_visit_count_updated_at',
                        'email_visit_count_updated_at',
                    ]],
                    'links',
                    'meta',
                ],
            ]);
    }

    public function test_historical_ledger_survives_source_appointment_deletion(): void
    {
        $appointment = $this->appointment('completed', '8135550100', 'client@example.com');
        $this->syncAs('admin')->assertOk();

        $appointment->delete();

        $this->assertSame(2, CountedAppointmentVisit::count());
        $this->syncAs('admin')->assertJsonPath('data.processed_new_phone', 0);
        $this->assertSummary('phone', '+18135550100', 1);
        $this->assertSummary('email', 'client@example.com', 1);
    }

    private function appointment(
        string $status,
        string $phone,
        string $email,
        ?Barber $barber = null
    ): Appointment {
        $sequence = Appointment::count() + 1;
        $appointment = new Appointment([
            'customer_name' => 'Client '.$sequence,
            'customer_email' => $email,
            'customer_phone' => $phone,
            'barber_id' => ($barber ?? $this->barber)->id,
            'appointment_date' => now()->addDays($sequence)->toDateString(),
            'appointment_time' => sprintf('%02d:00', 8 + ($sequence % 10)),
            'duration_minutes' => 30,
            'total_price' => 30,
            'status' => $status,
            'completed_at' => $status === 'completed' ? now() : null,
        ]);
        $appointment->service_id = $this->service->id;
        $appointment->save();

        return $appointment;
    }

    private function syncAs(string $role)
    {
        Sanctum::actingAs(User::factory()->create(['role' => $role, 'is_active' => true]));

        return $this->postJson('/api/admin/appointments/sync-visit-counts');
    }

    private function assertSummary(string $type, string $identifier, int $count): void
    {
        $this->assertDatabaseHas('client_visit_counts', [
            'identifier_type' => $type,
            'normalized_identifier' => $identifier,
            'visit_count' => $count,
        ]);
    }
}
