<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBarberRequest;
use App\Http\Requests\UpdateBarberRequest;
use App\Http\Resources\BarberResource;
use App\Models\Appointment;
use App\Models\Barber;
use App\Services\ImageUploadService;
use App\Support\PublicCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarberController extends Controller
{
    public function __construct(
        private readonly ImageUploadService $imageService
    ) {}

    public function index(): JsonResponse
    {
        $barbers = Barber::withCount('services')
            ->with('services')
            ->orderBy('name')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => BarberResource::collection($barbers)->response()->getData(true),
        ]);
    }

    public function availableForReassignment(Request $request): JsonResponse
    {
        $request->validate([
            'appointment_id' => 'required|integer|exists:appointments,id',
            'date'           => 'required|date_format:Y-m-d',
            'start_time'     => 'required|date_format:H:i',
            'end_time'       => 'required|date_format:H:i',
        ]);

        $appointment    = Appointment::findOrFail($request->appointment_id);
        $serviceId      = $appointment->service_id;
        $date           = $request->date;
        $startTime      = $request->start_time;
        $endTime        = $request->end_time;

        // The appointment's own time window (may be a subset of the block slot range)
        $apptStart = $appointment->appointment_time; // HH:MM:SS
        $apptEnd   = date('H:i:s', strtotime($appointment->appointment_time) + $appointment->duration_minutes * 60);
        $apptDate  = $appointment->appointment_date;

        $candidates = Barber::where('is_active', true)
            ->where('id', '!=', $appointment->barber_id)
            ->whereHas('services', fn($q) => $q->where('services.id', $serviceId))
            ->get();

        $available = $candidates->filter(function (Barber $b) use ($date, $startTime, $endTime, $apptDate, $apptStart, $apptEnd) {
            // Exclude if barber already has an overlapping appointment during the block slot window
            $hasApptConflict = Appointment::where('barber_id', $b->id)
                ->where('appointment_date', $date)
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->where('appointment_time', '<', $endTime . ':00')
                ->whereRaw("ADDTIME(appointment_time, SEC_TO_TIME(duration_minutes * 60)) > ?", [$startTime . ':00'])
                ->exists();

            if ($hasApptConflict) return false;

            // Exclude if barber has a blocked slot overlapping the appointment's specific time
            $hasBlockConflict = \App\Models\BlockedSlot::where('barber_id', $b->id)
                ->where('blocked_date', $apptDate)
                ->where('start_time', '<', $apptEnd)
                ->where('end_time', '>', $apptStart)
                ->exists();

            return !$hasBlockConflict;
        });

        return response()->json([
            'available_barbers' => $available->values()->map(fn($b) => [
                'id'     => $b->id,
                'name'   => $b->name,
                'avatar' => $b->image ? asset('storage/' . $b->image) : null,
            ]),
        ]);
    }

    public function store(StoreBarberRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->upload($request->file('image'), 'barbers');
        }

        $serviceIds = $data['service_ids'] ?? [];
        unset($data['service_ids']);

        $barber = Barber::create($data);

        if (!empty($serviceIds)) {
            $barber->services()->sync($serviceIds);
            // sync() bypasses model events, so bump the public cache by hand.
            PublicCache::bump();
        }

        $barber->load('services');

        return response()->json([
            'success' => true,
            'message' => 'Barber created successfully.',
            'data'    => new BarberResource($barber),
        ], 201);
    }

    public function update(UpdateBarberRequest $request, Barber $barber): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->replace($barber->image, $request->file('image'), 'barbers');
        } else {
            unset($data['image']);
        }

        $serviceIds = $data['service_ids'] ?? null;
        unset($data['service_ids']);

        $barber->update($data);

        if ($serviceIds !== null) {
            $barber->services()->sync($serviceIds);
            // sync() bypasses model events, so bump the public cache by hand.
            PublicCache::bump();
        }

        $barber->load('services');

        return response()->json([
            'success' => true,
            'message' => 'Barber updated successfully.',
            'data'    => new BarberResource($barber->fresh()->load('services')),
        ]);
    }

    public function destroy(Barber $barber): JsonResponse
    {
        $this->imageService->delete($barber->image);
        $barber->delete();

        return response()->json([
            'success' => true,
            'message' => 'Barber deleted successfully.',
        ]);
    }
}
