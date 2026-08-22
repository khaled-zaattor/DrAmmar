<?php

namespace App\Services;

class ClientIdentifierNormalizer
{
    public function email(?string $email): ?string
    {
        $normalized = mb_strtolower(trim((string) $email));

        if ($normalized === '' || ! filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        return $normalized;
    }

    public function phone(?string $phone): ?string
    {
        $phone = trim((string) $phone);

        if ($phone === '') {
            return null;
        }

        if (str_starts_with($phone, '+')) {
            if (! preg_match('/^\+[\d\s().-]+$/', $phone)) {
                return null;
            }

            $digits = preg_replace('/\D/', '', $phone);

            return preg_match('/^[1-9]\d{6,14}$/', $digits) ? '+'.$digits : null;
        }

        if (! preg_match('/^[\d\s().-]+$/', $phone)) {
            return null;
        }

        $digits = preg_replace('/\D/', '', $phone);

        if (strlen($digits) === 10) {
            return '+1'.$digits;
        }

        if (strlen($digits) === 11 && str_starts_with($digits, '1')) {
            return '+'.$digits;
        }

        // Keep non-US local/international values useful for identity grouping even
        // when customers omit the leading +. Booking accepts 7-15 digits, so the
        // visit-count normalizer follows the same boundary.
        return preg_match('/^[1-9]\d{6,14}$/', $digits) ? '+'.$digits : null;
    }
}
