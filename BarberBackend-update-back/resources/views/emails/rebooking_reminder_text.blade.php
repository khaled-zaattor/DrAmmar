Hi {{ $appointment->customer_name }},

It's been about a month since your last visit with us. Your style deserves the best — why not book your next appointment today?

Your barber {{ $appointment->barber->name ?? 'our team' }} is ready to take great care of you again!

Book your next appointment: {{ rtrim(config('app.frontend_url'), '/') }}/#booking

We miss you and hope to see you soon!

--
{{ config('app.name') }} — Looking forward to your next visit!
4201 62nd North Unit 9, Pinellas Park, FL 33781 · 813-895-9229
Don't want these reminders? Reply with "unsubscribe" and we'll stop sending them.
