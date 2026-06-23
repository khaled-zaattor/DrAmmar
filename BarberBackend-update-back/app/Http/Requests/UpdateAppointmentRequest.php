<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'barber_id'    => ['sometimes', 'required', 'exists:barbers,id'],
            'status'       => ['sometimes', 'required', 'in:pending,confirmed,completed,cancelled,no_show'],
            'notes'        => ['sometimes', 'nullable', 'string', 'max:1000'],
            'checked_in_at'=> ['sometimes', 'nullable', 'date'],
            'completed_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
