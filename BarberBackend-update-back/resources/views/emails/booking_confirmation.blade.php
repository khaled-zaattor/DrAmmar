<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: #d4a855; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 22px; }
        .header p { margin: 6px 0 0; color: #ccc; font-size: 14px; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .section { background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px; margin: 16px 0; }
        .section h3 { margin: 0 0 12px; color: #1a1a1a; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
        .label { color: #666; }
        .value { font-weight: bold; color: #1a1a1a; }
        .service-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .service-item:last-child { border-bottom: none; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0 4px; font-size: 15px; font-weight: bold; border-top: 2px solid #d4a855; margin-top: 8px; }
        .badge { display: inline-block; background: #d4a855; color: #1a1a1a; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .notes { background: #fffdf4; border-left: 3px solid #d4a855; padding: 10px 14px; font-size: 14px; color: #555; border-radius: 0 4px 4px 0; }
        .location a { color: #1a1a1a; font-weight: bold; text-decoration: none; }
        .location a:hover { text-decoration: underline; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Appointment Confirmed</h1>
        <p>Ref: <strong>{{ $appointment->booking_reference }}</strong></p>
    </div>

    <div class="content">
        <p>Hi <strong>{{ $appointment->customer_name }}</strong>, your appointment is confirmed! Here are the details:</p>

        <div class="section">
            <h3>Appointment</h3>
            <div class="row"><span class="label">Date</span><span class="value">{{ \Carbon\Carbon::parse($appointment->appointment_date)->format('l, F j, Y') }}</span></div>
            <div class="row"><span class="label">Time</span><span class="value">{{ \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A') }}</span></div>
            <div class="row"><span class="label">Duration</span><span class="value">{{ $appointment->duration_minutes }} min</span></div>
            <div class="row"><span class="label">Barber</span><span class="value">{{ $appointment->barber->name ?? 'TBD' }}</span></div>
            <div class="row"><span class="label">Status</span><span class="value"><span class="badge">{{ ucfirst($appointment->status) }}</span></span></div>
        </div>

        <div class="section">
            <h3>Services</h3>
            @foreach ($appointment->services as $service)
                <div class="service-item">
                    <span>{{ $service->name }}</span>
                    <span>${{ number_format($service->pivot->price_snapshot, 2) }}</span>
                </div>
            @endforeach
            <div class="total-row">
                <span>Total</span>
                <span>${{ number_format($appointment->total_price, 2) }}</span>
            </div>
        </div>

        @if ($appointment->notes)
            <div class="notes">
                <strong>Your notes:</strong> {{ $appointment->notes }}
            </div>
        @endif

        <div class="section location">
            <h3>Location</h3>
            <p style="margin: 0 0 8px; font-size: 14px;">
                <a href="https://www.google.com/maps/place/Ali's+Barbershop/@27.8288039,-82.7676914,13z/data=!4m10!1m2!2m1!1sAli's+Barbershop,+4201+62nd+North+Unit+9,+Pinellas+Park,+FL+33781!3m6!1s0x88c2e5e61c59b849:0xd1899ae87c607955!8m2!3d27.8288039!4d-82.6914737!15sCkFBbGkncyBCYXJiZXJzaG9wLCA0MjAxIDYybmQgTm9ydGggVW5pdCA5LCBQaW5lbGxhcyBQYXJrLCBGTCAzMzc4MVpAIj5hbGkncyBiYXJiZXJzaG9wIDQyMDEgNjJuZCBub3J0aCB1bml0IDkgcGluZWxsYXMgcGFyayBmbCAzMzc4MZIBCmhhaXJfc2Fsb26aAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnQzTVZwSFduRlNlazVUVlZaV05sUjZhRTFOYkd4eVRqSnJlVlJzUlJBQuABAPoBBAgAEDE!16s%2Fg%2F11xkrdhb2h?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">
                    Ali's Barbershop, 4201 62nd North Unit 9, Pinellas Park, FL 33781
                </a>
            </p>
            <p style="margin: 0; font-size: 14px;">
                Call or text: <a href="tel:8138959229">813-895-9229</a>
            </p>
        </div>
    </div>

    <div class="footer">
        <p><strong>{{ config('app.name') }}</strong> &mdash; Booking Confirmation</p>
        <p>4201 62nd North Unit 9, Pinellas Park, FL 33781 &middot; 813-895-9229</p>
    </div>
</body>
</html>
