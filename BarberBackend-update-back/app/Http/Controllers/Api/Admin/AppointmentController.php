<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Admin\Concerns\ResolvesAuthBarber;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    use ResolvesAuthBarber;

    public function __construct(
        private readonly AppointmentService $appointmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with(['barber', 'service'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc');

        // Barber role: restrict to own appointments only
        $authBarber = $this->authBarber();
        if ($authBarber) {
            $query->where('barber_id', $authBarber->id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->filled('date')) {
            $query->where('appointment_date', $request->date);
        }

        // Filter by barber (admin/receptionist only — barber is already locked above)
        if (!$authBarber && $request->filled('barber_id')) {
            $query->where('barber_id', $request->barber_id);
        }

        // Filter by customer email
        if ($request->filled('email')) {
            $query->where('customer_email', 'like', '%' . $request->email . '%');
        }

        // Filter by service
        if ($request->filled('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        // Search by customer name or phone
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('customer_name', 'like', $term)
                  ->orWhere('customer_phone', 'like', $term);
            });
        }

        $appointments = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => AppointmentResource::collection($appointments)->response()->getData(true),
        ]);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        if ($this->isBarberRole()) {
            $authBarber = $this->authBarber();
            abort_if(!$authBarber || $appointment->barber_id !== $authBarber->id, 403, 'Forbidden.');
        }

        $appointment->load(['barber', 'service', 'followUps']);

        return response()->json([
            'success' => true,
            'data'    => new AppointmentResource($appointment),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        if ($this->isBarberRole()) {
            $authBarber = $this->authBarber();
            abort_if(!$authBarber || $appointment->barber_id !== $authBarber->id, 403, 'Forbidden.');
        }

        $data = $request->validated();

        // Handle status transitions
        if (isset($data['status'])) {
            if ($data['status'] === 'completed' && !$appointment->completed_at) {
                $data['completed_at'] = now();
            }

            if ($data['status'] === 'confirmed' && $request->boolean('check_in')) {
                $data['checked_in_at'] = now();
            }
        }

        $appointment->update($data);
        $appointment->load(['barber', 'service']);

        return response()->json([
            'success' => true,
            'message' => 'Appointment updated successfully.',
            'data'    => new AppointmentResource($appointment),
        ]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        if ($this->isBarberRole()) {
            $authBarber = $this->authBarber();
            abort_if(!$authBarber || $appointment->barber_id !== $authBarber->id, 403, 'Forbidden.');
        }

        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Appointment deleted successfully.',
        ]);
    }

    public function bulkDeleteOld(): JsonResponse
    {
        $count = Appointment::whereDate('appointment_date', '<', now()->toDateString())->delete();

        return response()->json([
            'success' => true,
            'message' => "Deleted {$count} past appointment(s).",
            'count'   => $count,
        ]);
    }
}
