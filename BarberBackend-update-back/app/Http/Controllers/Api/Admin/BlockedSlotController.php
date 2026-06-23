<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Admin\Concerns\ResolvesAuthBarber;
use App\Models\BlockedSlot;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockedSlotController extends Controller
{
    use ResolvesAuthBarber;

    /**
     * GET /api/admin/blocked-slots
     * List blocked slots. Optional filters: barber_id, from_date, to_date.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BlockedSlot::with('barber:id,name')
            ->orderBy('blocked_date')
            ->orderBy('start_time');

        // Barber role: restrict to own blocked slots only
        $authBarber = $this->authBarber();
        if ($authBarber) {
            $query->where('barber_id', $authBarber->id);
        } elseif ($request->filled('barber_id')) {
            $query->where('barber_id', $request->barber_id);
        }

        if ($request->filled('from_date')) {
            $query->where('blocked_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->where('blocked_date', '<=', $request->to_date);
        }

        $slots = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $slots,
        ]);
    }

    /**
     * POST /api/admin/blocked-slots
     */
    public function store(Request $request): JsonResponse
    {
        // Barber role: barber_id is optional in request (will be forced to own id)
        $isBarber = $this->isBarberRole();
        $validated = $request->validate([
            'barber_id'    => $isBarber ? 'nullable|integer|exists:barbers,id' : 'required|integer|exists:barbers,id',
            'blocked_date' => 'required|date|date_format:Y-m-d',
            'start_time'   => 'required|date_format:H:i',
            'end_time'     => 'required|date_format:H:i|after:start_time',
            'reason'       => 'nullable|string|max:255',
        ]);

        if ($isBarber) {
            $authBarber = $this->authBarber();
            abort_if(!$authBarber, 403, 'Your account is not linked to a barber profile.');
            $validated['barber_id'] = $authBarber->id;
        }

        $slot = BlockedSlot::create($validated);
        $slot->load('barber:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Blocked slot created successfully.',
            'data'    => $slot,
        ], 201);
    }

    /**
     * PUT /api/admin/blocked-slots/{blockedSlot}
     */
    public function update(Request $request, BlockedSlot $blockedSlot): JsonResponse
    {
        if ($this->isBarberRole()) {
            $authBarber = $this->authBarber();
            abort_if(!$authBarber || $blockedSlot->barber_id !== $authBarber->id, 403, 'Forbidden.');
        }

        $validated = $request->validate([
            'barber_id'    => 'sometimes|integer|exists:barbers,id',
            'blocked_date' => 'sometimes|date|date_format:Y-m-d',
            'start_time'   => 'sometimes|date_format:H:i',
            'end_time'     => 'sometimes|date_format:H:i',
            'reason'       => 'nullable|string|max:255',
        ]);

        $blockedSlot->update($validated);
        $blockedSlot->load('barber:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Blocked slot updated successfully.',
            'data'    => $blockedSlot,
        ]);
    }

    /**
     * DELETE /api/admin/blocked-slots/{blockedSlot}
     */
    public function destroy(BlockedSlot $blockedSlot): JsonResponse
    {
        if ($this->isBarberRole()) {
            $authBarber = $this->authBarber();
            abort_if(!$authBarber || $blockedSlot->barber_id !== $authBarber->id, 403, 'Forbidden.');
        }

        $blockedSlot->delete();

        return response()->json([
            'success' => true,
            'message' => 'Blocked slot deleted successfully.',
        ]);
    }

    /**
     * GET /api/admin/blocked-slots/monthly-report?month=YYYY-MM
     * Admin only. Returns per-barber blocked slot count and total hours for the given month.
     */
    public function monthlyReport(Request $request): JsonResponse
    {
        $request->validate(['month' => 'required|date_format:Y-m']);

        $start = Carbon::parse($request->month . '-01')->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        $slots = BlockedSlot::with('barber:id,name')
            ->whereBetween('blocked_date', [$start->toDateString(), $end->toDateString()])
            ->get();

        $report = $slots->groupBy('barber_id')->map(function ($group) {
            $minutes = $group->sum(fn ($s) =>
                Carbon::parse($s->end_time)->diffInMinutes(Carbon::parse($s->start_time))
            );
            return [
                'barber_id'          => $group->first()->barber_id,
                'barber_name'        => $group->first()->barber?->name ?? 'Unknown',
                'blocked_slot_count' => $group->count(),
                'total_minutes'      => $minutes,
                'total_hours'        => round($minutes / 60, 2),
            ];
        })->values();

        return response()->json(['success' => true, 'data' => $report]);
    }

    /**
     * DELETE /api/admin/blocked-slots/bulk-delete-old
     * Admin only. Hard-deletes all blocked slots before the start of the current month.
     */
    public function bulkDeleteOld(): JsonResponse
    {
        $cutoff = Carbon::now()->startOfMonth()->toDateString();
        $count  = BlockedSlot::whereDate('blocked_date', '<', $cutoff)->delete();

        return response()->json([
            'success' => true,
            'message' => "Deleted {$count} old blocked slot(s).",
            'count'   => $count,
        ]);
    }
}
