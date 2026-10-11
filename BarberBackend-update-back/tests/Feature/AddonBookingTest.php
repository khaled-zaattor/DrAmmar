<?php

namespace Tests\Feature;

use App\Models\Barber;
use App\Models\BlockedSlot;
use App\Models\BusinessHour;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AddonBookingTest extends TestCase
{
    use RefreshDatabase;

    private Barber $barber;
    private Service $haircut;
    private Service $shampoo;
    private string $date;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Bus::fake();
        $day = Carbon::today()->next(Carbon::TUESDAY);
        $this->date = $day->format('Y-m-d');
        BusinessHour::create([
            'day_of_week' => $day->dayOfWeek, 'open_time' => '08:00:00',
            'close_time' => '18:00:00', 'is_closed' => false, 'slot_duration' => 30,
        ]);
        $this->barber = Barber::create(['name' => 'Ali', 'is_active' => true]);
        $this->haircut = Service::create([
            'name' => 'Haircut', 'price' => 30, 'duration_minutes' => 30, 'is_active' => true,
        ]);
        $this->shampoo = Service::create([
            'name' => 'Shampoo', 'price' => 5, 'duration_minutes' => 0,
            'is_addon' => true, 'is_active' => true,
        ]);
        $this->barber->services()->attach([$this->haircut->id, $this->shampoo->id]);
    }

    private function book(array $services, string $time = '10:00')
    {
        return $this->postJson('/api/appointments', [
            'service_ids' => $services, 'barber_id' => $this->barber->id,
            'appointment_date' => $this->date, 'appointment_time' => $time,
            'customer_name' => 'Customer', 'customer_email' => 'client@example.com',
            'customer_phone' => '8135550100',
        ]);
    }

    private function slots(?int $duration = null): array
    {
        $query = ['barber_id' => $this->barber->id, 'date' => $this->date];
        if ($duration !== null) $query['duration'] = $duration;
        return $this->getJson('/api/availability?' . http_build_query($query))
            ->assertOk()->json('data.available_slots');
    }

    private function admin(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    }

    public function test_standalone_addons_leave_availability_unchanged_and_can_share_a_time(): void
    {
        $before = $this->slots(30);
        $this->book([$this->shampoo->id])->assertCreated()
            ->assertJsonPath('data.duration_minutes', 0)->assertJsonPath('data.total_price', 5);
        $this->book([$this->shampoo->id])->assertCreated();
        $this->assertSame($before, $this->slots(30));
        $this->book([$this->haircut->id])->assertCreated();
        $this->assertNotContains('10:00', $this->slots(30));
    }

    public function test_addon_can_be_booked_during_an_existing_haircut(): void
    {
        $this->book([$this->haircut->id])->assertCreated();
        $this->assertContains('10:00', $this->slots(0));
        $this->assertNotContains('10:00', $this->slots());
        $this->book([$this->shampoo->id])->assertCreated();
        $this->book([$this->shampoo->id], '10:15')->assertCreated();
        $this->book([$this->haircut->id])->assertStatus(409);
    }

    public function test_haircut_can_span_an_existing_addon_time(): void
    {
        $this->book([$this->shampoo->id], '10:15')->assertCreated();
        $this->assertContains('10:00', $this->slots(30));
        $this->book([$this->haircut->id])->assertCreated();
    }

    public function test_mixed_booking_reserves_only_timed_services_and_keeps_both_prices(): void
    {
        // The add-on flag remains authoritative even if stale data contains a duration.
        $this->shampoo->update(['duration_minutes' => 20]);
        $response = $this->book([$this->shampoo->id, $this->haircut->id])->assertCreated()
            ->assertJsonPath('data.duration_minutes', 30)->assertJsonPath('data.total_price', 35)
            ->assertJsonCount(2, 'data.services');
        $this->assertDatabaseHas('appointment_service', [
            'appointment_id' => $response->json('data.id'),
            'service_id' => $this->shampoo->id, 'duration_snapshot' => 0, 'price_snapshot' => 5,
        ]);
        $this->assertNotContains('10:00', $this->slots(30));
        $this->assertContains('10:30', $this->slots(30));
        $this->book([$this->shampoo->id, $this->haircut->id])->assertStatus(409);
    }

    public function test_addons_respect_working_hours_and_manual_blocks(): void
    {
        BlockedSlot::create([
            'barber_id' => $this->barber->id, 'blocked_date' => $this->date,
            'start_time' => '10:00:00', 'end_time' => '11:00:00',
        ]);
        $this->assertNotContains('10:00', $this->slots(0));
        $this->assertNotContains('10:30', $this->slots(0));
        $this->book([$this->shampoo->id], '10:00')->assertStatus(409);
        $this->book([$this->shampoo->id], '10:30')->assertStatus(409);
        $this->book([$this->shampoo->id], '07:30')->assertStatus(409);
        $this->book([$this->shampoo->id], '18:00')->assertStatus(409);
        $this->book([$this->shampoo->id], '11:00')->assertCreated();
        BusinessHour::query()->update(['is_closed' => true]);
        $this->assertSame([], $this->slots(0));
        $this->book([$this->shampoo->id], '12:00')->assertStatus(409);
    }

    public function test_timed_availability_checks_full_duration_and_closing_time(): void
    {
        $this->book([$this->haircut->id], '10:30')->assertCreated();
        $this->assertNotContains('10:00', $this->slots(60));
        $this->assertContains('10:00', $this->slots(30));
        $this->assertNotContains('17:30', $this->slots(60));
        $this->assertContains('17:30', $this->slots(0));
    }

    public function test_admin_can_create_and_edit_addons_but_timed_services_require_duration(): void
    {
        $this->admin();
        $this->postJson('/api/admin/services', [
            'name' => 'Conditioner', 'price' => 4, 'is_addon' => true,
        ])->assertCreated()->assertJsonPath('data.is_addon', true)->assertJsonPath('data.duration_minutes', 0);
        $this->postJson('/api/admin/services', [
            'name' => 'Invalid haircut', 'price' => 20, 'duration_minutes' => 0,
        ])->assertUnprocessable()->assertJsonValidationErrors('duration_minutes');
        $url = '/api/admin/services/' . $this->haircut->id;
        $this->putJson($url, ['is_addon' => '1'])->assertOk()->assertJsonPath('data.duration_minutes', 0);
        $this->putJson($url, ['name' => 'Renamed add-on'])->assertOk()->assertJsonPath('data.is_addon', true);
        $this->putJson($url, ['is_addon' => false])->assertUnprocessable()->assertJsonValidationErrors('duration_minutes');
        $this->putJson($url, ['is_addon' => false, 'duration_minutes' => 30])
            ->assertOk()->assertJsonPath('data.is_addon', false)->assertJsonPath('data.duration_minutes', 30);
    }

    public function test_dashboard_lists_details_and_updates_include_every_service_and_filter_secondary_services(): void
    {
        $id = $this->book([$this->haircut->id, $this->shampoo->id])->assertCreated()->json('data.id');
        $this->admin();
        $this->getJson('/api/admin/appointments?service_id=' . $this->shampoo->id)->assertOk()
            ->assertJsonCount(1, 'data.data')->assertJsonCount(2, 'data.data.0.services');
        $this->getJson('/api/admin/appointments/' . $id)->assertOk()->assertJsonCount(2, 'data.services');
        $this->putJson('/api/admin/appointments/' . $id, ['status' => 'confirmed'])
            ->assertOk()->assertJsonCount(2, 'data.services');
    }

    public function test_reactivating_a_cancelled_timed_booking_cannot_overlap_but_addons_can(): void
    {
        $haircutId = $this->book([$this->haircut->id])->assertCreated()->json('data.id');
        $addonId = $this->book([$this->shampoo->id])->assertCreated()->json('data.id');
        $this->admin();
        $this->putJson('/api/admin/appointments/' . $haircutId, ['status' => 'cancelled'])->assertOk();
        $this->putJson('/api/admin/appointments/' . $addonId, ['status' => 'cancelled'])->assertOk();
        $this->book([$this->haircut->id])->assertCreated();
        $this->putJson('/api/admin/appointments/' . $haircutId, ['status' => 'confirmed'])->assertStatus(409);
        $this->putJson('/api/admin/appointments/' . $addonId, ['status' => 'confirmed'])->assertOk();
    }

    public function test_reassignment_rejects_timed_overlap_but_allows_addons(): void
    {
        $target = Barber::create(['name' => 'Other barber', 'is_active' => true]);
        $target->services()->attach([$this->haircut->id, $this->shampoo->id]);
        $busyId = $this->book([$this->haircut->id])->assertCreated()->json('data.id');
        $this->admin();
        $this->putJson('/api/admin/appointments/' . $busyId, ['barber_id' => $target->id])->assertOk();
        $haircutId = $this->book([$this->haircut->id])->assertCreated()->json('data.id');
        $addonId = $this->book([$this->shampoo->id])->assertCreated()->json('data.id');
        $this->putJson('/api/admin/appointments/' . $haircutId, ['barber_id' => $target->id])->assertStatus(409);
        $this->putJson('/api/admin/appointments/' . $addonId, ['barber_id' => $target->id])->assertOk();
    }
}
