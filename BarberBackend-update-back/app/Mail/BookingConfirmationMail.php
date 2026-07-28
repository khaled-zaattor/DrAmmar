<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

class BookingConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Appointment $appointment
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Appointment is Confirmed — ' . $this->appointment->booking_reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking_confirmation',
            text: 'emails.booking_confirmation_text',
            with: [
                'appointment' => $this->appointment,
            ],
        );
    }

    public function headers(): Headers
    {
        return new Headers(
            text: [
                'List-Unsubscribe' => '<mailto:' . config('mail.from.address') . '?subject=Unsubscribe>',
            ],
        );
    }
}
