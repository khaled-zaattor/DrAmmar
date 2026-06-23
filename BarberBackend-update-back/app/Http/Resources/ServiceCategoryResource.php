<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'description'    => $this->description,
            'sort_order'     => (int) $this->sort_order,
            'is_active'      => $this->is_active,
            'services_count' => $this->whenCounted('services'),
            'services'       => ServiceResource::collection($this->whenLoaded('services')),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
