<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReviewRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Appointment $appointment
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'How Was Your Visit? Leave Us a Review!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.review_request',
            with: [
                'appointment' => $this->appointment,
            ],
        );
    }
}
