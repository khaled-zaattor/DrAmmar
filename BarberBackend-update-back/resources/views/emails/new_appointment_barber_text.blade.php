New Appointment Booked
Ref: {{ $appointment->booking_reference }}

Hi {{ $appointment->barber->name ?? 'there' }}, you have a new appointment. Here are the details:

CUSTOMER
- Name: {{ $appointment->customer_name }}
@if ($showCustomerContact)
- Email: {{ $appointment->customer_email }}
- Phone: {{ $appointment->customer_phone }}
@endif

APPOINTMENT
- Date: {{ \Carbon\Carbon::parse($appointment->appointment_date)->format('l, F j, Y') }}
- Time: {{ \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A') }}
- Duration: {{ $appointment->duration_minutes }} min
- Status: {{ ucfirst($appointment->status) }}

SERVICES
@foreach ($appointment->services as $service)
- {{ $service->name }}: ${{ number_format($service->pivot->price_snapshot, 2) }}
@endforeach
Total: ${{ number_format($appointment->total_price, 2) }}
@if ($appointment->notes)

CUSTOMER NOTES
{{ $appointment->notes }}
@endif

--
{{ config('app.name') }} — Booking notification
