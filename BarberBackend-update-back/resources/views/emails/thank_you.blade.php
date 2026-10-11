<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your Visit</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: #d4a855; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .details { background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Thank You, {{ $appointment->customer_name }}!</h1>
    </div>
    <div class="content">
        <p>We hope you enjoyed your visit to <strong>{{ config('app.name') }}</strong>. It was a pleasure serving you!</p>

        <div class="details">
            <h3>Your Appointment Summary</h3>
            <p><strong>Booking Reference:</strong> {{ $appointment->booking_reference }}</p>
            <p><strong>Service:</strong> {{ $appointment->service->name ?? 'N/A' }}</p>
            <p><strong>Barber:</strong> {{ $appointment->barber->name ?? 'N/A' }}</p>
            <p><strong>Date:</strong> {{ $appointment->appointment_date->format('F j, Y') }}</p>
            <p><strong>Time:</strong> {{ $appointment->appointment_time }}</p>
        </div>

        <p>We look forward to seeing you again. If you have any questions, feel free to contact us.</p>
    </div>
    <div class="footer">
        <p>{{ config('app.name') }} &mdash; Thank you for choosing us!</p>
        <p>4201 62nd North Unit 9, Pinellas Park, FL 33781 &middot; 813-895-9229</p>
        <p>Don't want these emails? Reply with "unsubscribe" and we'll stop sending them.</p>
    </div>
</body>
</html>
