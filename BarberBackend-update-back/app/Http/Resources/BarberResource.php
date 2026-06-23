<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class BarberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'user_id'   => $this->user_id,
            'name'      => $this->name,
            'title'     => $this->title,
            'bio'       => $this->bio,
            'image_url' => $this->image
                            ? Storage::disk('public')->url($this->image)
                            : null,
            'phone'     => $this->phone,
            'email'     => $this->email,
            'is_active' => $this->is_active,
            'services'  => ServiceResource::collection($this->whenLoaded('services')),
            'created_at'=> $this->created_at?->toISOString(),
        ];
    }
}
