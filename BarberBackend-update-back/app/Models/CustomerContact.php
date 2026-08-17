<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One email address or phone number a customer has booked with.
 *
 * A customer accumulates these over time: someone who books once with a work
 * email and later with a personal one stays matchable by both.
 */
class CustomerContact extends Model
{
    public $timestamps = false;

    protected $fillable = ['customer_id', 'kind', 'value'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
