<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFollowUpSettingsRequest;
use App\Jobs\SendFollowUpEmail;
use App\Models\Appointment;
use App\Models\EmailFollowUp;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class FollowUpController extends Controller
{
    public function store(StoreFollowUpSettingsRequest $request): JsonResponse
    {
        $data = $request->validated();

        $appointment = Appointment::findOrFail($data['appointment_id']);

        $appointmentDatetime = Carbon::parse(
            $appointment->appointment_date->format('Y-m-d') . ' ' . $appointment->appointment_time
        );

        $scheduledAt = $appointmentDatetime->copy()->addHours($data['send_after_hours']);

        $followUp = EmailFollowUp::create([
            'appointment_id'   => $appointment->id,
            'customer_email'   => $appointment->customer_email,
            'template_type'    => $data['template_type'],
            'send_after_hours' => $data['send_after_hours'],
            'scheduled_at'     => $scheduledAt,
            'status'           => 'pending',
        ]);

        // If already due, dispatch immediately
        if ($scheduledAt->isPast()) {
            SendFollowUpEmail::dispatch($followUp);
        }

        return response()->json([
            'success' => true,
            'message' => 'Follow-up email scheduled successfully.',
            'data'    => [
                'id'           => $followUp->id,
                'template_type'=> $followUp->template_type,
                'scheduled_at' => $followUp->scheduled_at->toISOString(),
                'status'       => $followUp->status,
            ],
        ], 201);
    }
}
