<?php

namespace App\Http\Controllers\Api\Admin\Concerns;

use App\Models\Barber;

trait ResolvesAuthBarber
{
    /**
     * Returns the Barber record linked to the logged-in user,
     * or null if the logged-in user is not a barber role.
     */
    protected function authBarber(): ?Barber
    {
        $user = auth()->user();

        if (!$user->isBarber()) {
            return null;
        }

        return $user->barber;
    }

    protected function isBarberRole(): bool
    {
        return auth()->user()->isBarber();
    }
}
