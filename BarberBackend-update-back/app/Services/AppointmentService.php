<?php

namespace App\Services;

use App\Jobs\ScheduleFollowUpEmails;
use App\Mail\BookingConfirmationMail;
use App\Mail\NewAppointmentBarberMail;
use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Mail;

class AppointmentService
{
    public function __construct(
        private readonly AvailabilityService $availabilityService
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

        $appointment = Appointment::create([
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

        if ($appointment->barber && $appointment->barber->email) {
            Mail::to($appointment->barber->email)
                ->send(new NewAppointmentBarberMail($appointment));
        }

        if ($appointment->customer_email) {
            Mail::to($appointment->customer_email)
                ->send(new BookingConfirmationMail($appointment));
        }

        return $appointment;
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
