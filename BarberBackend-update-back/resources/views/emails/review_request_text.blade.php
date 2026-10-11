Hi {{ $appointment->customer_name }},

We hope your recent visit to {{ config('app.name') }} was everything you expected. Your feedback means the world to us!

Could you spare a moment to share your experience? It helps us serve you better and helps others find us.

Leave a review: {{ config('app.review_url') }}

Your appointment details:
- Service: {{ $appointment->service->name ?? 'N/A' }}
- Barber: {{ $appointment->barber->name ?? 'N/A' }}
- Date: {{ $appointment->appointment_date->format('F j, Y') }}

Thank you for being our valued customer!

--
{{ config('app.name') }} — We appreciate your feedback!
4201 62nd North Unit 9, Pinellas Park, FL 33781 · 813-895-9229
Don't want these emails? Reply with "unsubscribe" and we'll stop sending them.
