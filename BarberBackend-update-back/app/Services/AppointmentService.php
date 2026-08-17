<?php

namespace App\Services;

use App\Jobs\ScheduleFollowUpEmails;
use App\Mail\BookingConfirmationMail;
use App\Mail\NewAppointmentBarberMail;
use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

use function Illuminate\Support\defer;

class AppointmentService
{
    public function __construct(
        private readonly AvailabilityService $availabilityService,
        private readonly CustomerResolver $customerResolver
    ) {}

    public function createAppointment(array $data): Appointment
    {
        $services = Service::whereIn('id', $data['service_ids'])->get()->keyBy('id');

        if ($services->count() !== count($data['service_ids'])) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'One or more services not found.',
            ], 422));
        }

        $totalDuration = $services->sum('duration_minutes');
        $totalPrice    = $services->sum('price');

        $available = $this->availabilityService->isSlotAvailable(
            (int) $data['barber_id'],
            $data['appointment_date'],
            $data['appointment_time'],
            $totalDuration
        );

        if (!$available) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'The selected time slot is not available. Please choose a different time.',
            ], 409));
        }

        // Recognise a returning customer before the row is written, so the
        // booking is linked from the start.
        $customer = $this->customerResolver->resolve($data);

        $appointment = Appointment::create([
            'customer_id'      => $customer->id,
            'customer_name'    => $data['customer_name'],
            'customer_email'   => $data['customer_email'],
            'customer_phone'   => $data['customer_phone'],
            'barber_id'        => $data['barber_id'],
            'appointment_date' => $data['appointment_date'],
            'appointment_time' => $data['appointment_time'],
            'duration_minutes' => $totalDuration,
            'total_price'      => $totalPrice,
            'status'           => 'pending',
            'notes'            => $data['notes'] ?? null,
        ]);

        // Set service_id to first service for backward compatibility
        $appointment->service_id = $data['service_ids'][0];
        $appointment->saveQuietly();

        $pivotData = [];
        foreach ($services as $service) {
            $pivotData[$service->id] = [
                'price_snapshot'    => $service->price,
                'duration_snapshot' => $service->duration_minutes,
            ];
        }
        $appointment->services()->attach($pivotData);

        Service::whereIn('id', $data['service_ids'])->increment('booking_count');

        ScheduleFollowUpEmails::dispatch($appointment);

        $appointment->load(['barber', 'service', 'services']);

        // Includes the booking just made, so 1 means first-ever.
        $visitCount = $customer->visitCount();

        $this->sendBookingMailsAfterResponse($appointment, $visitCount);

        return $appointment;
    }

    /**
     * Send the booking notifications *after* the HTTP response has been flushed.
     *
     * These used to be plain Mail::send() calls inside the request, so the
     * customer sat on a spinner while two SMTP round-trips completed — several
     * seconds on a slow connection — and an SMTP failure threw, turning a
     * booking that had already been written to the database into an error
     * response for the customer.
     *
     * defer() runs the work in the same process once the response is sent (the
     * framework's InvokeDeferredCallbacks middleware fires it on terminate), so
     * unlike a queued mail this needs no queue worker running — which matters on
     * shared hosting. Each mail is isolated so one failure cannot suppress the
     * other, and failures are logged rather than lost.
     */
    private function sendBookingMailsAfterResponse(Appointment $appointment, int $visitCount): void
    {
        defer(function () use ($appointment, $visitCount) {
            if ($appointment->barber && $appointment->barber->email) {
                try {
                    Mail::to($appointment->barber->email)
                        ->send(new NewAppointmentBarberMail($appointment, $visitCount));
                } catch (\Throwable $e) {
                    Log::error('Failed to send barber booking notification', [
                        'appointment' => $appointment->booking_reference,
                        'recipient'   => $appointment->barber->email,
                        'error'       => $e->getMessage(),
                    ]);
                }
            }

            if ($appointment->customer_email) {
                try {
                    Mail::to($appointment->customer_email)
                        ->send(new BookingConfirmationMail($appointment));
                } catch (\Throwable $e) {
                    Log::error('Failed to send customer booking confirmation', [
                        'appointment' => $appointment->booking_reference,
                        'recipient'   => $appointment->customer_email,
                        'error'       => $e->getMessage(),
                    ]);
                }
            }
        });
    }

    public function updateStatus(Appointment $appointment, string $status): Appointment
    {
        $updateData = ['status' => $status];

        if ($status === 'completed' && !$appointment->completed_at) {
            $updateData['completed_at'] = now();
        }

        $appointment->update($updateData);

        return $appointment->fresh(['barber', 'service', 'services']);
    }

    public function cancelAppointment(Appointment $appointment): Appointment
    {
        $appointment->update(['status' => 'cancelled']);

        return $appointment->fresh(['barber', 'service', 'services']);
    }
}
