Thank You, {{ $appointment->customer_name }}!

We hope you enjoyed your visit to {{ config('app.name') }}. It was a pleasure serving you!

YOUR APPOINTMENT SUMMARY
- Booking Reference: {{ $appointment->booking_reference }}
- Service: {{ $appointment->service->name ?? 'N/A' }}
- Barber: {{ $appointment->barber->name ?? 'N/A' }}
- Date: {{ $appointment->appointment_date->format('F j, Y') }}
- Time: {{ $appointment->appointment_time }}

We look forward to seeing you again. If you have any questions, feel free to contact us.

--
{{ config('app.name') }} — Thank you for choosing us!
4201 62nd North Unit 9, Pinellas Park, FL 33781 · 813-895-9229
Don't want these emails? Reply with "unsubscribe" and we'll stop sending them.
