<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewAppointmentBarberMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Appointment $appointment,
        /** Bookings this customer has made, including this one. 1 = first ever. */
        public readonly int $visitCount = 1
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Appointment Booked — ' . $this->appointment->booking_reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new_appointment_barber',
            with: [
                'appointment'   => $this->appointment,
                'visitCount'    => $this->visitCount,
                'isNewCustomer' => $this->visitCount <= 1,
                'ordinal'       => $this->ordinal($this->visitCount),
            ],
        );
    }

    /** 1 => "1st", 2 => "2nd", 11 => "11th", 23 => "23rd". */
    private function ordinal(int $number): string
    {
        // 11th/12th/13th are the exceptions to the last-digit rule.
        if (in_array($number % 100, [11, 12, 13], true)) {
            return $number . 'th';
        }

        $suffix = match ($number % 10) {
            1       => 'st',
            2       => 'nd',
            3       => 'rd',
            default => 'th',
        };

        return $number . $suffix;
    }
}
