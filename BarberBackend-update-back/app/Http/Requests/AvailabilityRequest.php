<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'barber_id' => ['required', 'integer', 'exists:barbers,id'],
            'date'      => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:today'],
            'duration'  => ['sometimes', 'nullable', 'integer', 'min:1', 'max:480'],
        ];
    }
}
