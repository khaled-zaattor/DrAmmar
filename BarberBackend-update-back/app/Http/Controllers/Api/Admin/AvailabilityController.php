<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Admin\Concerns\ResolvesAuthBarber;
use App\Models\Barber;
use App\Models\BlockedSlot;
use App\Models\BusinessHour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AvailabilityController extends Controller
{
    use ResolvesAuthBarber;

    /**
     * GET /api/admin/availability
     * Returns full availability configuration: business hours, all barbers with their
     * weekly schedules, and upcoming blocked slots.
     */
    public function index(): JsonResponse
    {
        $businessHours = BusinessHour::orderBy('day_of_week')->get();

        $authBarber = $this->authBarber();

        if ($authBarber) {
            // Barber role: only see own profile and own blocked slots
            $barbers = Barber::where('id', $authBarber->id)
                ->with('schedules')
                ->get(['id', 'name', 'is_active']);

            $blockedSlots = BlockedSlot::with('barber:id,name')
                ->where('barber_id', $authBarber->id)
                ->where('blocked_date', '>=', now()->toDateString())
                ->orderBy('blocked_date')
                ->orderBy('start_time')
                ->get();
        } else {
            // Admin / receptionist: full view
            $barbers = Barber::active()
                ->with('schedules')
                ->orderBy('name')
                ->get(['id', 'name', 'is_active']);

            $blockedSlots = BlockedSlot::with('barber:id,name')
                ->where('blocked_date', '>=', now()->toDateString())
                ->orderBy('blocked_date')
                ->orderBy('start_time')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'business_hours' => $businessHours,
                'barbers'        => $barbers,
                'blocked_slots'  => $blockedSlots,
            ],
        ]);
    }

    /**
     * POST /api/admin/business-hours
     * Upsert business hours. Accepts an array of day configurations.
     *
     * Body: { "days": [ { "day_of_week": 0, "is_closed": true, ... }, ... ] }
     * OR a single day: { "day_of_week": 1, "open_time": "08:30", ... }
     */
    public function updateBusinessHours(Request $request): JsonResponse
    {
        // Accept either a single day object or an array of days
        $isBulk = $request->has('days');

        if ($isBulk) {
            $validated = $request->validate([
                'days'                    => 'required|array|min:1',
                'days.*.day_of_week'      => 'required|integer|between:0,6',
                'days.*.is_closed'        => 'required|boolean',
                'days.*.open_time'        => 'nullable|date_format:H:i',
                'days.*.close_time'       => 'nullable|date_format:H:i',
                'days.*.slot_duration'    => 'nullable|integer|in:15,20,30,45,60',
            ]);

            $updated = [];
            foreach ($validated['days'] as $day) {
                $record = BusinessHour::updateOrCreate(
                    ['day_of_week' => $day['day_of_week']],
                    [
                        'is_closed'     => $day['is_closed'],
                        'open_time'     => $day['is_closed'] ? null : ($day['open_time'] ?? null),
                        'close_time'    => $day['is_closed'] ? null : ($day['close_time'] ?? null),
                        'slot_duration' => $day['slot_duration'] ?? 30,
                    ]
                );
                $updated[] = $record;
            }
        } else {
            $validated = $request->validate([
                'day_of_week'   => 'required|integer|between:0,6',
                'is_closed'     => 'required|boolean',
                'open_time'     => 'nullable|date_format:H:i',
                'close_time'    => 'nullable|date_format:H:i',
                'slot_duration' => 'nullable|integer|in:15,20,30,45,60',
            ]);

            $record = BusinessHour::updateOrCreate(
                ['day_of_week' => $validated['day_of_week']],
                [
                    'is_closed'     => $validated['is_closed'],
                    'open_time'     => $validated['is_closed'] ? null : ($validated['open_time'] ?? null),
                    'close_time'    => $validated['is_closed'] ? null : ($validated['close_time'] ?? null),
                    'slot_duration' => $validated['slot_duration'] ?? 30,
                ]
            );

            $updated = [$record];
        }

        return response()->json([
            'success' => true,
            'message' => 'Business hours updated successfully.',
            'data'    => $updated,
        ]);
    }
}
