<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    /**
     * Statuses that count toward a customer's booking total — everything except
     * cancelled and no_show. A booking counts from the moment it is made, so
     * the total reads "this is their Nth booking".
     *
     * Single source of truth: anything counting visits must use this.
     */
    public const COUNTABLE_STATUSES = ['pending', 'confirmed', 'completed'];

    protected $fillable = [
        'name',
        'email',
        'phone',
        'first_booked_at',
        'last_booked_at',
    ];

    protected function casts(): array
    {
        return [
            'first_booked_at' => 'datetime',
            'last_booked_at'  => 'datetime',
        ];
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /** Every email address and phone number this customer has booked with. */
    public function contacts(): HasMany
    {
        return $this->hasMany(CustomerContact::class);
    }

    /**
     * How many bookings this customer has made, ignoring cancellations and
     * no-shows.
     */
    public function visitCount(): int
    {
        return $this->appointments()
                    ->whereIn('status', self::COUNTABLE_STATUSES)
                    ->count();
    }
}
