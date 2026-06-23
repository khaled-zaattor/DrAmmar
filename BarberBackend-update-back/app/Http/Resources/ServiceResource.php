<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'description'      => $this->description,
            'price'            => (float) $this->price,
            'duration_minutes' => $this->duration_minutes,
            'booking_count'    => (int) ($this->booking_count ?? 0),
            'image_url'        => $this->image
                                    ? Storage::disk('public')->url($this->image)
                                    : null,
            'category_id'      => $this->category_id,
            'category'         => $this->category_id ? [
                'id'   => $this->category?->id,
                'name' => $this->category?->name,
            ] : null,
            'is_active'        => $this->is_active,
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}
