<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BarberSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarberScheduleController extends Controller
{
    /**
     * POST /api/admin/barber-schedules
     * Upsert a barber's schedule for a specific day.
     * Use is_off=true to mark the barber as unavailable that day.
     *
     * Accepts a single entry or bulk array:
     * { "barber_id": 1, "day_of_week": 1, "start_time": "09:00", "end_time": "17:00", "is_off": false }
     * OR
     * { "schedules": [ { "barber_id":1, "day_of_week":0, "is_off":true }, ... ] }
     */
    public function store(Request $request): JsonResponse
    {
        $isBulk = $request->has('schedules');

        if ($isBulk) {
            $validated = $request->validate([
                'schedules'                  => 'required|array|min:1',
                'schedules.*.barber_id'      => 'required|integer|exists:barbers,id',
                'schedules.*.day_of_week'    => 'required|integer|between:0,6',
                'schedules.*.is_off'         => 'required|boolean',
                'schedules.*.start_time'     => 'nullable|date_format:H:i',
                'schedules.*.end_time'       => 'nullable|date_format:H:i',
            ]);

            $results = [];
            foreach ($validated['schedules'] as $entry) {
                $record = BarberSchedule::updateOrCreate(
                    [
                        'barber_id'   => $entry['barber_id'],
                        'day_of_week' => $entry['day_of_week'],
                    ],
                    [
                        'is_off'     => $entry['is_off'],
                        'start_time' => $entry['is_off'] ? null : ($entry['start_time'] ?? null),
                        'end_time'   => $entry['is_off'] ? null : ($entry['end_time'] ?? null),
                    ]
                );
                $results[] = $record;
            }
        } else {
            $validated = $request->validate([
                'barber_id'   => 'required|integer|exists:barbers,id',
                'day_of_week' => 'required|integer|between:0,6',
                'is_off'      => 'required|boolean',
                'start_time'  => 'nullable|date_format:H:i',
                'end_time'    => 'nullable|date_format:H:i',
            ]);

            $results = [BarberSchedule::updateOrCreate(
                [
                    'barber_id'   => $validated['barber_id'],
                    'day_of_week' => $validated['day_of_week'],
                ],
                [
                    'is_off'     => $validated['is_off'],
                    'start_time' => $validated['is_off'] ? null : ($validated['start_time'] ?? null),
                    'end_time'   => $validated['is_off'] ? null : ($validated['end_time'] ?? null),
                ]
            )];
        }

        return response()->json([
            'success' => true,
            'message' => 'Barber schedule updated successfully.',
            'data'    => $results,
        ]);
    }
}
