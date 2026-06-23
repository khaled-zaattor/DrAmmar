<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Time for Your Next Visit</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: #d4a855; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .cta { text-align: center; margin: 25px 0; }
        .btn { background: #d4a855; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>It's Been 30 Days — Time for a Fresh Look!</h1>
    </div>
    <div class="content">
        <p>Hi {{ $appointment->customer_name }},</p>
        <p>It's been about a month since your last visit with us. Your style deserves the best — why not book your next appointment today?</p>

        <p>Your barber <strong>{{ $appointment->barber->name ?? 'our team' }}</strong> is ready to take great care of you again!</p>

        <div class="cta">
            <a href="{{ env('FRONTEND_URL', 'http://localhost:8080') }}/booking" class="btn">Book Your Next Appointment</a>
        </div>

        <p>We miss you and hope to see you soon!</p>
    </div>
    <div class="footer">
        <p>{{ config('app.name') }} &mdash; Looking forward to your next visit!</p>
        <p>If you no longer wish to receive these reminders, please contact us.</p>
    </div>
</body>
</html>
