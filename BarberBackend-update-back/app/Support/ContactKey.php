<?php

namespace App\Support;

/**
 * Normalises the contact details a customer types at booking time into stable
 * match keys.
 *
 * Bookings are anonymous — there is no login, so the only way to recognise a
 * returning customer is by what they typed. People are inconsistent about
 * casing and phone formatting between visits, so both fields are reduced to a
 * canonical form before comparison.
 */
class ContactKey
{
    /**
     * The shop is US-based (see the address in the booking templates), so a
     * local number is 10 digits. Anything longer is assumed to carry a country
     * code and is trimmed from the left.
     */
    private const LOCAL_DIGITS = 10;

    public static function email(?string $value): string
    {
        return mb_strtolower(trim((string) $value));
    }

    /**
     * "+1 (813) 895-9229", "1-813-895-9229" and "8138959229" all collapse to
     * "8138959229".
     */
    public static function phone(?string $value): string
    {
        $digits = preg_replace('/\D+/', '', (string) $value) ?? '';

        // International prefix dialled as 00…
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        if (strlen($digits) > self::LOCAL_DIGITS) {
            $digits = substr($digits, -self::LOCAL_DIGITS);
        }

        return $digits;
    }
}
