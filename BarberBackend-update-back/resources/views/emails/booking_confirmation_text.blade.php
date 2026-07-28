Appointment Confirmed
Ref: {{ $appointment->booking_reference }}

Hi {{ $appointment->customer_name }}, your appointment is confirmed! Here are the details:

APPOINTMENT
- Date: {{ \Carbon\Carbon::parse($appointment->appointment_date)->format('l, F j, Y') }}
- Time: {{ \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A') }}
- Duration: {{ $appointment->duration_minutes }} min
- Barber: {{ $appointment->barber->name ?? 'TBD' }}
- Status: {{ ucfirst($appointment->status) }}

SERVICES
@foreach ($appointment->services as $service)
- {{ $service->name }}: ${{ number_format($service->pivot->price_snapshot, 2) }}
@endforeach
Total: ${{ number_format($appointment->total_price, 2) }}
@if ($appointment->notes)

YOUR NOTES
{{ $appointment->notes }}
@endif

LOCATION
Ali's Barbershop, 4201 62nd North Unit 9, Pinellas Park, FL 33781
Call or text: 813-895-9229

--
Ali's Barbershop — Booking Confirmation
4201 62nd North Unit 9, Pinellas Park, FL 33781 · 813-895-9229
