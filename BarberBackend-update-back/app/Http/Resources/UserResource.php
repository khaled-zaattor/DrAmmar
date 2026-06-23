<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadMissing('barber:id,user_id,name');

        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'email'     => $this->email,
            'role'      => $this->role,
            'barber_id' => $this->barber?->id,
            'barber'    => $this->barber ? [
                'id'   => $this->barber->id,
                'name' => $this->barber->name,
            ] : null,
        ];
    }
}
