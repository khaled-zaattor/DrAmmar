<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\BarberSchedule;
use App\Models\BlockedSlot;
use App\Models\BusinessHour;
use Carbon\Carbon;

class AvailabilityService
{
    public function getAvailableSlots(int $barberId, string $date, int $requiredDuration = 0): array
    {
        $carbon = Carbon::parse($date);
        $dayOfWeek = (int) $carbon->dayOfWeek; // 0=Sunday, 6=Saturday

        // Check business hours
        $businessHour = BusinessHour::forDay($dayOfWeek);
        if (!$businessHour || $businessHour->is_closed) {
            return [];
        }

        // Determine the effective open/close window:
        // If barber has a personal schedule for this day, use it instead of shop hours.
        $schedule = BarberSchedule::where('barber_id', $barberId)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if ($schedule) {
            if ($schedule->is_off) {
                return [];
            }
            // Null times mean "inherit from shop hours"
            $openTime  = $schedule->start_time ?? $businessHour->open_time;
            $closeTime = $schedule->end_time   ?? $businessHour->close_time;
        } else {
            $openTime  = $businessHour->open_time;
            $closeTime = $businessHour->close_time;
        }

        // Final guard — if hours are still null the day is effectively closed
        if ($openTime === null || $closeTime === null) {
            return [];
        }

        $slotDuration = max(15, (int) ($businessHour->slot_duration ?? 30));

        // Generate all possible slots
        $slots = $this->generateSlots($carbon, $openTime, $closeTime, $slotDuration);

        if (empty($slots)) {
            return [];
        }

        // Remove blocked slots
        $blockedSlots = BlockedSlot::where('barber_id', $barberId)
            ->where('blocked_date', $date)
            ->get();

        foreach ($blockedSlots as $blocked) {
            $blockStart = Carbon::parse($date . ' ' . $blocked->start_time);
            $blockEnd   = Carbon::parse($date . ' ' . $blocked->end_time);

            $slots = array_filter($slots, function (Carbon $slot) use ($blockStart, $blockEnd) {
                return !($slot >= $blockStart && $slot < $blockEnd);
            });
        }

        // Remove slots occupied by existing appointments
        $appointments = Appointment::where('barber_id', $barberId)
            ->where('appointment_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->get(['appointment_time', 'duration_minutes']);

        foreach ($appointments as $appointment) {
            $apptStart = Carbon::parse($date . ' ' . $appointment->appointment_time);
            $apptEnd   = $apptStart->copy()->addMinutes($appointment->duration_minutes);

            $slots = array_filter($slots, function (Carbon $slot) use ($apptStart, $apptEnd) {
                return !($slot >= $apptStart && $slot < $apptEnd);
            });
        }

        // Filter out slots where combined service duration wouldn't fit before closing
        if ($requiredDuration > 0) {
            $closeAt = Carbon::parse($date . ' ' . $closeTime);
            $slots   = array_filter($slots, function (Carbon $slot) use ($closeAt, $requiredDuration) {
                return $slot->copy()->addMinutes($requiredDuration) <= $closeAt;
            });
        }

        return array_values(array_map(
            fn (Carbon $slot) => $slot->format('H:i'),
            $slots
        ));
    }

    public function isSlotAvailable(int $barberId, string $date, string $time, int $durationMinutes): bool
    {
        $carbon = Carbon::parse($date);
        $dayOfWeek = (int) $carbon->dayOfWeek;

        // Check business hours
        $businessHour = BusinessHour::forDay($dayOfWeek);
        if (!$businessHour || $businessHour->is_closed) {
            return false;
        }

        // Check barber's personal schedule
        $schedule = BarberSchedule::where('barber_id', $barberId)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if ($schedule) {
            if ($schedule->is_off) {
                return false;
            }
            $openTime  = $schedule->start_time ?? $businessHour->open_time;
            $closeTime = $schedule->end_time   ?? $businessHour->close_time;
        } else {
            $openTime  = $businessHour->open_time;
            $closeTime = $businessHour->close_time;
        }

        if ($openTime === null || $closeTime === null) {
            return false;
        }

        $slotStart = Carbon::parse($date . ' ' . $time);
        $slotEnd   = $slotStart->copy()->addMinutes($durationMinutes);

        $openAt  = Carbon::parse($date . ' ' . $openTime);
        $closeAt = Carbon::parse($date . ' ' . $closeTime);

        // Slot must be within working hours
        if ($slotStart < $openAt || $slotEnd > $closeAt) {
            return false;
        }

        // Check blocked slots
        $isBlocked = BlockedSlot::where('barber_id', $barberId)
            ->where('blocked_date', $date)
            ->where(function ($query) use ($slotStart, $slotEnd, $date) {
                $query->whereRaw('TIMESTAMP(?, start_time) < ?', [$date, $slotEnd->format('H:i:s')])
                      ->whereRaw('TIMESTAMP(?, end_time) > ?', [$date, $slotStart->format('H:i:s')]);
            })
            ->exists();

        if ($isBlocked) {
            return false;
        }

        // Check existing appointments
        $isBooked = Appointment::where('barber_id', $barberId)
            ->where('appointment_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->where(function ($query) use ($slotStart, $slotEnd) {
                $query->whereRaw(
                    "ADDTIME(appointment_time, SEC_TO_TIME(duration_minutes * 60)) > ? AND appointment_time < ?",
                    [$slotStart->format('H:i:s'), $slotEnd->format('H:i:s')]
                );
            })
            ->exists();

        return !$isBooked;
    }

    private function generateSlots(Carbon $date, string $openTime, string $closeTime, int $slotDuration): array
    {
        $slots = [];
        $current = Carbon::parse($date->format('Y-m-d') . ' ' . $openTime);
        $closeAt = Carbon::parse($date->format('Y-m-d') . ' ' . $closeTime);

        while ($current < $closeAt) {
            $slots[] = $current->copy();
            $current->addMinutes($slotDuration);
        }

        return $slots;
    }
}
