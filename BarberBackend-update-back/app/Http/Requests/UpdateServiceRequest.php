<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'             => ['sometimes', 'required', 'string', 'max:255'],
            'description'      => ['sometimes', 'nullable', 'string'],
            'price'            => ['sometimes', 'required', 'numeric', 'min:0'],
            'duration_minutes' => ['sometimes', 'required', 'integer', 'min:5', 'max:480'],
            'image'            => ['sometimes', 'nullable', 'image', 'max:2048'],
            'is_active'        => ['sometimes', 'boolean'],
            'booking_count'    => ['sometimes', 'integer', 'min:0'],
            'category_id'      => ['sometimes', 'nullable', 'integer', 'exists:service_categories,id'],
        ];
    }
}
