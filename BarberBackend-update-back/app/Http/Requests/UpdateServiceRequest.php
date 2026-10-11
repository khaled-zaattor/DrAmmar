<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->boolean('is_addon', (bool) $this->route('service')?->is_addon)) {
            $this->merge(['duration_minutes' => 0]);
        } elseif ($this->has('is_addon') && !$this->has('duration_minutes')) {
            $this->merge(['duration_minutes' => $this->route('service')?->duration_minutes]);
        }
    }

    public function rules(): array
    {
        return [
            'name'             => ['sometimes', 'required', 'string', 'max:255'],
            'description'      => ['sometimes', 'nullable', 'string'],
            'price'            => ['sometimes', 'required', 'numeric', 'min:0'],
            'duration_minutes' => ['sometimes', 'required', 'integer', $this->boolean('is_addon', (bool) $this->route('service')?->is_addon) ? 'min:0' : 'min:5', 'max:480'],
            'is_addon'         => ['sometimes', 'boolean'],
            'image'            => ['sometimes', 'nullable', 'image', 'max:2048'],
            'is_active'        => ['sometimes', 'boolean'],
            'booking_count'    => ['sometimes', 'integer', 'min:0'],
            'category_id'      => ['sometimes', 'nullable', 'integer', 'exists:service_categories,id'],
        ];
    }
}
