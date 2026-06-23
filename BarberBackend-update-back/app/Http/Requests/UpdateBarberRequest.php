<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBarberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => ['sometimes', 'required', 'string', 'max:255'],
            'title'         => ['sometimes', 'nullable', 'string', 'max:255'],
            'bio'           => ['sometimes', 'nullable', 'string'],
            'image'         => ['sometimes', 'nullable', 'image', 'max:2048'],
            'phone'         => ['sometimes', 'nullable', 'string', 'max:20'],
            'email'         => ['sometimes', 'nullable', 'email', 'max:255'],
            'is_active'     => ['sometimes', 'boolean'],
            'service_ids'   => ['sometimes', 'nullable', 'array'],
            'service_ids.*' => ['integer', 'exists:services,id'],
        ];
    }
}
