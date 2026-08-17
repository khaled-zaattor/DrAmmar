<?php

namespace Tests\Feature;

use App\Jobs\ScheduleFollowUpEmails;
use App\Mail\BookingConfirmationMail;
use App\Mail\NewAppointmentBarberMail;
use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use App\Services\AppointmentService;
use App\Services\AvailabilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Defer\DeferredCallbackCollection;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Mail;
use Mockery;
use Tests\TestCase;

class BookingRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_booking_totals_are_scoped_to_each_customer(): void
    {
        [$barber, $service] = $this->createBookablePair();
        $alice = $this->createCustomer('Alice', 'alice@example.com', '1111111111');
        $bob = $this->createCustomer('Bob', 'bob@example.com', '2222222222');

        $aliceFirst = $this->createAppointment($alice, $barber, $service, 'pending', 1);
        $this->createAppointment($alice, $barber, $service, 'completed', 2);
        $this->createAppointment($alice, $barber, $service, 'cancelled', 3);
        $bobOnly = $this->createAppointment($bob, $barber, $service, 'confirmed', 4);

        $appointments = Appointment::query()
            ->withCustomerVisitCount()
            ->whereKey([$aliceFirst->id, $bobOnly->id])
            ->get()
            ->keyBy('id');

        $this->assertSame(2, $appointments[$aliceFirst->id]->countableVisitCount());
        $this->assertSame(1, $appointments[$bobOnly->id]->countableVisitCount());
    }

    public function test_legacy_appointments_without_a_customer_return_no_booking_total(): void
    {
        [$barber, $service] = $this->createBookablePair();

        $legacy = Appointment::create([
            'customer_name' => 'Legacy Client',
            'customer_email' => 'legacy@example.com',
            'customer_phone' => '3333333333',
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'appointment_date' => now()->addDays(5)->toDateString(),
            'appointment_time' => '10:00',
            'duration_minutes' => 30,
            'total_price' => 25,
            'status' => 'pending',
        ]);

        $legacy = Appointment::query()->withCustomerVisitCount()->findOrFail($legacy->id);

        $this->assertNull($legacy->countableVisitCount());
    }

    public function test_booking_emails_are_deferred_until_after_the_response(): void
    {
        Mail::fake();
        Bus::fake([ScheduleFollowUpEmails::class]);

        [$barber, $service] = $this->createBookablePair('barber@example.com');

        $availability = Mockery::mock(AvailabilityService::class);
        $availability->shouldReceive('isSlotAvailable')->once()->andReturnTrue();
        $this->app->instance(AvailabilityService::class, $availability);

        $appointment = $this->app->make(AppointmentService::class)->createAppointment([
            'customer_name' => 'Fast Booking',
            'customer_email' => 'client@example.com',
            'customer_phone' => '4444444444',
            'barber_id' => $barber->id,
            'service_ids' => [$service->id],
            'appointment_date' => now()->addWeek()->toDateString(),
            'appointment_time' => '11:00',
        ]);

        $this->assertDatabaseHas('appointments', ['id' => $appointment->id]);
        Mail::assertNothingSent();

        $this->app->make(DeferredCallbackCollection::class)->invoke();

        Mail::assertSent(NewAppointmentBarberMail::class, 1);
        Mail::assertSent(BookingConfirmationMail::class, 1);
    }

    private function createBookablePair(?string $barberEmail = null): array
    {
        $barber = Barber::create([
            'name' => 'Test Barber',
            'email' => $barberEmail,
            'is_active' => true,
        ]);

        $service = Service::create([
            'name' => 'Haircut',
            'price' => 25,
            'duration_minutes' => 30,
            'is_active' => true,
        ]);

        return [$barber, $service];
    }

    private function createCustomer(string $name, string $email, string $phone): Customer
    {
        return Customer::create([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'first_booked_at' => now(),
            'last_booked_at' => now(),
        ]);
    }

    private function createAppointment(
        Customer $customer,
        Barber $barber,
        Service $service,
        string $status,
        int $dayOffset
    ): Appointment {
        return Appointment::create([
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => $customer->phone,
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'appointment_date' => now()->addDays($dayOffset)->toDateString(),
            'appointment_time' => '09:00',
            'duration_minutes' => 30,
            'total_price' => 25,
            'status' => $status,
        ]);
    }
}
