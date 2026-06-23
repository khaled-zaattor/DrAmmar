<?php

namespace App\Jobs;

use App\Mail\RebookingReminderMail;
use App\Mail\ReviewRequestMail;
use App\Mail\ThankYouMail;
use App\Models\EmailFollowUp;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendFollowUpEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        private readonly EmailFollowUp $followUp
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        // Reload to get the latest status
        $followUp = $this->followUp->fresh(['appointment.barber', 'appointment.service']);

        if (!$followUp || $followUp->status !== 'pending') {
            return;
        }

        $appointment = $followUp->appointment;

        // Don't send if appointment is cancelled or no-show
        if (!$appointment || in_array($appointment->status, ['cancelled', 'no_show'])) {
            $followUp->update(['status' => 'failed']);
            return;
        }

        $mailable = match ($followUp->template_type) {
            'thank_you'           => new ThankYouMail($appointment),
            'review_request'      => new ReviewRequestMail($appointment),
            'rebooking_reminder'  => new RebookingReminderMail($appointment),
            default               => null,
        };

        if (!$mailable) {
            $followUp->update(['status' => 'failed']);
            return;
        }

        Mail::to($followUp->customer_email)->send($mailable);

        $followUp->update([
            'status'  => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function failed(Throwable $exception): void
    {
        $this->followUp->update(['status' => 'failed']);
    }
}
