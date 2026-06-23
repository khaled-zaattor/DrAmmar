<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\EmailFollowUp;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ScheduleFollowUpEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly Appointment $appointment
    ) {}

    public function handle(): void
    {
        $appointmentDatetime = Carbon::parse(
            $this->appointment->appointment_date->format('Y-m-d') . ' ' . $this->appointment->appointment_time
        );

        $followUps = [
            [
                'template_type'   => 'thank_you',
                'send_after_hours'=> 2,
                'scheduled_at'    => $appointmentDatetime->copy()->addMinutes($this->appointment->duration_minutes)->addHours(2),
            ],
            [
                'template_type'   => 'review_request',
                'send_after_hours'=> 24,
                'scheduled_at'    => $appointmentDatetime->copy()->addHours(24),
            ],
            [
                'template_type'   => 'rebooking_reminder',
                'send_after_hours'=> 720, // 30 days
                'scheduled_at'    => $appointmentDatetime->copy()->addHours(720),
            ],
        ];

        foreach ($followUps as $followUp) {
            // Avoid duplicate scheduling
            $exists = EmailFollowUp::where('appointment_id', $this->appointment->id)
                ->where('template_type', $followUp['template_type'])
                ->exists();

            if (!$exists) {
                EmailFollowUp::create([
                    'appointment_id'  => $this->appointment->id,
                    'customer_email'  => $this->appointment->customer_email,
                    'template_type'   => $followUp['template_type'],
                    'send_after_hours'=> $followUp['send_after_hours'],
                    'scheduled_at'    => $followUp['scheduled_at'],
                    'status'          => 'pending',
                ]);
            }
        }
    }
}
