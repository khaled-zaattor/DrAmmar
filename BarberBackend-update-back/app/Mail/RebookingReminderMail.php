<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

class RebookingReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Appointment $appointment
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "It's Time for Your Next Visit — Book Now!",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rebooking_reminder',
            text: 'emails.rebooking_reminder_text',
            with: [
                'appointment' => $this->appointment,
            ],
        );
    }

    public function headers(): Headers
    {
        return new Headers(
            text: [
                'List-Unsubscribe' => '<mailto:' . config('mail.reply_to.address') . '?subject=Unsubscribe>',
            ],
        );
    }
}
