<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_reference',
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'barber_id',
        'appointment_date',
        'appointment_time',
        'duration_minutes',
        'total_price',
        'status',
        'notes',
        'checked_in_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'total_price'      => 'decimal:2',
            'checked_in_at'    => 'datetime',
            'completed_at'     => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Appointment $appointment) {
            if (empty($appointment->booking_reference)) {
                $appointment->booking_reference = static::generateBookingReference();
            }
        });
    }

    private static function generateBookingReference(): string
    {
        do {
            $reference = strtoupper(Str::random(3)) . '-' . date('Ymd') . '-' . strtoupper(Str::random(4));
        } while (static::where('booking_reference', $reference)->exists());

        return $reference;
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(Barber::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Per-row visit total for the admin list (same customer, countable statuses).
     *
     * Do not use withCount() on a self-referential hasMany here: both sides of
     * the join resolve to `appointments.customer_id`, so every row got the
     * shop-wide total instead of that customer's count.
     */
    public function scopeWithCustomerVisitCount(Builder $query): Builder
    {
        $visits = static::query()
            ->from('appointments as customer_visits')
            ->selectRaw('count(*)')
            ->whereColumn('customer_visits.customer_id', 'appointments.customer_id')
            ->whereIn('customer_visits.status', Customer::COUNTABLE_STATUSES);

        return $query->addSelect(['customer_visits_count' => $visits]);
    }

    /** Countable bookings for this row's customer, including this one. */
    public function countableVisitCount(): ?int
    {
        if ($this->customer_id === null) {
            return null;
        }

        if (array_key_exists('customer_visits_count', $this->getAttributes())) {
            return (int) $this->getAttribute('customer_visits_count');
        }

        return static::query()
            ->where('customer_id', $this->customer_id)
            ->whereIn('status', Customer::COUNTABLE_STATUSES)
            ->count();
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'appointment_service')
                    ->withPivot(['price_snapshot', 'duration_snapshot']);
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(EmailFollowUp::class);
    }
}
