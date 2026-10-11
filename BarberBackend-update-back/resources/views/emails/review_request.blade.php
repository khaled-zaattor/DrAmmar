<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leave Us a Review</title>
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
        <h1>How Was Your Experience?</h1>
    </div>
    <div class="content">
        <p>Hi {{ $appointment->customer_name }},</p>
        <p>We hope your recent visit to <strong>{{ config('app.name') }}</strong> was everything you expected. Your feedback means the world to us!</p>

        <p>Could you spare a moment to share your experience? It helps us serve you better and helps others find us.</p>

        <div class="cta">
            <a href="{{ config('app.review_url') }}" class="btn">Leave a Review</a>
        </div>

        <p>Your appointment details:</p>
        <ul>
            <li><strong>Service:</strong> {{ $appointment->service->name ?? 'N/A' }}</li>
            <li><strong>Barber:</strong> {{ $appointment->barber->name ?? 'N/A' }}</li>
            <li><strong>Date:</strong> {{ $appointment->appointment_date->format('F j, Y') }}</li>
        </ul>

        <p>Thank you for being our valued customer!</p>
    </div>
    <div class="footer">
        <p>{{ config('app.name') }} &mdash; We appreciate your feedback!</p>
        <p>4201 62nd North Unit 9, Pinellas Park, FL 33781 &middot; 813-895-9229</p>
        <p>Don't want these emails? Reply with "unsubscribe" and we'll stop sending them.</p>
    </div>
</body>
</html>
