<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'booking_reference' => $this->booking_reference,
            'customer_name'     => $this->customer_name,
            'customer_email'    => $this->customer_email,
            'customer_phone'    => $this->customer_phone,
            // null (not 0) for rows predating `customers:backfill`, so the admin
            // UI can show "—" rather than a misleading zero.
            'customer_visits_count' => $this->customer_id
                ? $this->whenCounted('customerVisits')
                : null,
            'barber'            => new BarberResource($this->whenLoaded('barber')),
            'service'           => new ServiceResource($this->whenLoaded('service')),
            'services'          => ServiceResource::collection($this->whenLoaded('services')),
            'appointment_date'  => $this->appointment_date?->format('Y-m-d'),
            'appointment_time'  => $this->appointment_time,
            'duration_minutes'  => $this->duration_minutes,
            'total_price'       => (float) $this->total_price,
            'status'            => $this->status,
            'notes'             => $this->notes,
            'checked_in_at'     => $this->checked_in_at?->toISOString(),
            'completed_at'      => $this->completed_at?->toISOString(),
            'created_at'        => $this->created_at?->toISOString(),
        ];
    }
}
