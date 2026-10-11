<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->boolean('is_addon')) {
            $this->merge(['duration_minutes' => 0]);
        }
    }

    public function rules(): array
    {
        return [
            'name'             => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'price'            => ['required', 'numeric', 'min:0'],
            'duration_minutes' => ['required', 'integer', $this->boolean('is_addon') ? 'min:0' : 'min:5', 'max:480'],
            'is_addon'         => ['sometimes', 'boolean'],
            'image'            => ['nullable', 'image', 'max:2048'],
            'is_active'        => ['boolean'],
            'booking_count'    => ['sometimes', 'integer', 'min:0'],
            'category_id'      => ['nullable', 'integer', 'exists:service_categories,id'],
        ];
    }
}
