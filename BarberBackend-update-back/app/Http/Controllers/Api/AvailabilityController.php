<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AvailabilityRequest;
use App\Models\BusinessHour;
use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;

class AvailabilityController extends Controller
{
    public function __construct(
        private readonly AvailabilityService $availabilityService
    ) {}

    /**
     * GET /api/availability?barber_id=1&date=YYYY-MM-DD
     * Returns available time slots for a barber on a given date.
     */
    public function index(AvailabilityRequest $request): JsonResponse
    {
        $duration = $request->filled('duration') ? (int) $request->input('duration') : null;

        $slots = $this->availabilityService->getAvailableSlots(
            (int) $request->barber_id,
            $request->date,
            $duration
        );

        return response()->json([
            'success' => true,
            'data'    => [
                'date'            => $request->date,
                'barber_id'       => (int) $request->barber_id,
                'available_slots' => $slots,
            ],
        ]);
    }

    /**
     * GET /api/business-hours
     * Public endpoint — returns salon opening hours for all 7 days.
     * Used by the booking site to disable closed days on the calendar.
     */
    public function businessHours(): JsonResponse
    {
        $hours = BusinessHour::orderBy('day_of_week')->get([
            'day_of_week',
            'open_time',
            'close_time',
            'is_closed',
            'slot_duration',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $hours,
        ]);
    }
}
