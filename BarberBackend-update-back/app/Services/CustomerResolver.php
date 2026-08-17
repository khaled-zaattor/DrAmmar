<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\CustomerContact;
use App\Support\ContactKey;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Links a booking to the person who made it.
 *
 * Bookings are anonymous, so identity is inferred from the contact details:
 * a booking belongs to an existing customer if EITHER the email OR the phone
 * has been seen before. Details accumulate on the customer rather than
 * replacing each other, so booking once with a work email and later with a
 * personal one keeps both matchable.
 *
 * That "or" means a single booking can match two different existing customers
 * (email hits A, phone hits B) — when it does, they were always the same
 * person and are merged.
 */
class CustomerResolver
{
    /**
     * Find or create the customer behind a booking, record any new contact
     * details, and keep their display fields current.
     *
     * @param  array  $data          Booking payload: customer_name/email/phone.
     * @param  Carbon|null $bookedAt When the booking was made. Defaults to now;
     *                               the backfill passes the historical value so
     *                               first/last_booked_at land correctly.
     */
    public function resolve(array $data, ?Carbon $bookedAt = null): Customer
    {
        $bookedAt = $bookedAt ?? now();

        $name  = $data['customer_name'];
        $email = $data['customer_email'];
        $phone = $data['customer_phone'];

        // Empty keys are dropped so a blank phone doesn't match every other
        // customer who also left it blank.
        $keys = array_filter([
            'email' => ContactKey::email($email),
            'phone' => ContactKey::phone($phone),
        ], fn ($value) => $value !== '');

        return DB::transaction(function () use ($name, $email, $phone, $keys, $bookedAt) {
            $matches = $this->findMatches($keys);

            $customer = match (true) {
                $matches->isEmpty()   => Customer::create([
                    'name'            => $name,
                    'email'           => $email,
                    'phone'           => $phone,
                    'first_booked_at' => $bookedAt,
                    'last_booked_at'  => $bookedAt,
                ]),
                $matches->count() === 1 => $matches->first(),
                default                 => $this->merge($matches),
            };

            // Display fields track the latest booking — the newest spelling of
            // a name or current phone number is the useful one to show.
            $customer->fill(['name' => $name, 'email' => $email, 'phone' => $phone]);

            if (!$customer->first_booked_at || $bookedAt->lt($customer->first_booked_at)) {
                $customer->first_booked_at = $bookedAt;
            }

            if (!$customer->last_booked_at || $bookedAt->gt($customer->last_booked_at)) {
                $customer->last_booked_at = $bookedAt;
            }

            $customer->save();

            $this->rememberContacts($customer, $keys);

            return $customer;
        });
    }

    /**
     * Existing customers reachable from any of this booking's contact details,
     * oldest first.
     */
    private function findMatches(array $keys): Collection
    {
        if ($keys === []) {
            return collect();
        }

        $customerIds = CustomerContact::where(function ($query) use ($keys) {
                foreach ($keys as $kind => $value) {
                    $query->orWhere(fn ($q) => $q->where('kind', $kind)->where('value', $value));
                }
            })
            ->pluck('customer_id')
            ->unique();

        if ($customerIds->isEmpty()) {
            return collect();
        }

        return Customer::whereIn('id', $customerIds)
            ->orderBy('id')
            // Two concurrent first-time bookings from the same person would
            // otherwise each create a customer.
            ->lockForUpdate()
            ->get();
    }

    /**
     * Collapse several customer rows into the oldest one, moving their
     * appointments and contact details across.
     */
    private function merge(Collection $matches): Customer
    {
        $primary = $matches->first();

        foreach ($matches->slice(1) as $dupe) {
            Appointment::where('customer_id', $dupe->id)
                       ->update(['customer_id' => $primary->id]);

            CustomerContact::where('customer_id', $dupe->id)
                           ->update(['customer_id' => $primary->id]);

            if ($dupe->first_booked_at && (!$primary->first_booked_at || $dupe->first_booked_at->lt($primary->first_booked_at))) {
                $primary->first_booked_at = $dupe->first_booked_at;
            }

            if ($dupe->last_booked_at && (!$primary->last_booked_at || $dupe->last_booked_at->gt($primary->last_booked_at))) {
                $primary->last_booked_at = $dupe->last_booked_at;
            }

            $dupe->delete();
        }

        return $primary;
    }

    /**
     * Record any contact detail we haven't seen for this customer before.
     */
    private function rememberContacts(Customer $customer, array $keys): void
    {
        foreach ($keys as $kind => $value) {
            CustomerContact::firstOrCreate(
                ['kind' => $kind, 'value' => $value],
                ['customer_id' => $customer->id],
            );
        }
    }
}
