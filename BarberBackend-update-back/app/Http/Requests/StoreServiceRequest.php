<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'             => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'price'            => ['required', 'numeric', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:480'],
            'image'            => ['nullable', 'image', 'max:2048'],
            'is_active'        => ['boolean'],
            'booking_count'    => ['sometimes', 'integer', 'min:0'],
            'category_id'      => ['nullable', 'integer', 'exists:service_categories,id'],
        ];
    }
}
