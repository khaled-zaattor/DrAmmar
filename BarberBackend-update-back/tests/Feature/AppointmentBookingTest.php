<?php

namespace Tests\Feature;

use App\Mail\BookingConfirmationMail;
use App\Mail\NewAppointmentBarberMail;
use App\Models\Appointment;
use App\Models\Barber;
use App\Models\BusinessHour;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AppointmentBookingTest extends TestCase
{
    use RefreshDatabase;

    protected function defineEnvironment($app): void
    {
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', ':memory:');
    }

    public function test_booking_queues_each_email_without_sending_during_the_request(): void
    {
        Mail::fake();

        $date = Carbon::today()->next(Carbon::TUESDAY);

        BusinessHour::create([
            'day_of_week' => $date->dayOfWeek,
            'open_time' => '08:00:00',
            'close_time' => '18:00:00',
            'is_closed' => false,
            'slot_duration' => 30,
        ]);

        $barber = Barber::create([
            'name' => 'Queue Test Barber',
            'email' => 'barber@example.com',
            'is_active' => true,
        ]);

        $service = Service::create([
            'name' => 'Queue Test Haircut',
            'price' => 30,
            'duration_minutes' => 30,
            'is_active' => true,
        ]);

        $barber->services()->attach($service);

        $response = $this->postJson('/api/appointments', [
            'service_ids' => [$service->id],
            'barber_id' => $barber->id,
            'appointment_date' => $date->format('Y-m-d'),
            'appointment_time' => '10:00',
            'customer_name' => 'Queue Test Customer',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '8135550100',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true);

        Mail::assertQueued(NewAppointmentBarberMail::class, function ($mail) use ($barber) {
            return $mail->hasTo($barber->email);
        });

        Mail::assertQueued(BookingConfirmationMail::class, function ($mail) {
            return $mail->hasTo('customer@example.com');
        });

        Mail::assertNothingSent();
    }

    public function test_barber_email_hides_customer_contact_for_non_main_barber(): void
    {
        $mail = new NewAppointmentBarberMail($this->makeAppointmentFor('other.barber@example.com'));

        $mail->assertSeeInHtml('Contact Test Customer');
        $mail->assertDontSeeInHtml('contact.customer@example.com');
        $mail->assertDontSeeInHtml('8135550199');
        $mail->assertDontSeeInText('contact.customer@example.com');
        $mail->assertDontSeeInText('8135550199');
    }

    public function test_barber_email_shows_customer_contact_for_main_barber(): void
    {
        config(['app.main_barber_email' => 'alisbarbershop2026@gmail.com']);

        $mail = new NewAppointmentBarberMail($this->makeAppointmentFor('AlisBarbershop2026@gmail.com'));

        $mail->assertSeeInHtml('contact.customer@example.com');
        $mail->assertSeeInHtml('8135550199');
        $mail->assertSeeInText('contact.customer@example.com');
        $mail->assertSeeInText('8135550199');
    }

    private function makeAppointmentFor(string $barberEmail): Appointment
    {
        $barber = Barber::create([
            'name' => 'Contact Test Barber',
            'email' => $barberEmail,
            'is_active' => true,
        ]);

        $service = Service::create([
            'name' => 'Contact Test Haircut',
            'price' => 30,
            'duration_minutes' => 30,
            'is_active' => true,
        ]);

        $appointment = Appointment::create([
            'customer_name' => 'Contact Test Customer',
            'customer_email' => 'contact.customer@example.com',
            'customer_phone' => '8135550199',
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'appointment_date' => Carbon::today()->addDay()->format('Y-m-d'),
            'appointment_time' => '10:00',
            'duration_minutes' => 30,
            'total_price' => 30,
            'status' => 'pending',
        ]);

        $appointment->services()->attach($service->id, [
            'price_snapshot' => 30,
            'duration_snapshot' => 30,
        ]);

        return $appointment->load(['barber', 'services']);
    }
}
