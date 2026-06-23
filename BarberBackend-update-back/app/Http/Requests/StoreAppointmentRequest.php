<?php

namespace App\Http\Requests;

use App\Models\Barber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name'    => ['required', 'string', 'max:255'],
            'customer_email'   => ['required', 'email', 'max:255'],
            'customer_phone'   => ['required', 'string', 'max:20'],
            'barber_id'        => ['required', 'integer', 'exists:barbers,id'],
            'service_ids'      => ['required', 'array', 'min:1'],
            'service_ids.*'    => ['integer', 'exists:services,id', 'distinct'],
            'appointment_date' => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'notes'            => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $barberId   = $this->input('barber_id');
            $serviceIds = $this->input('service_ids', []);

            if (!$barberId || empty($serviceIds)) {
                return;
            }

            $barber = Barber::find($barberId);
            if (!$barber) {
                return;
            }

            $offeredIds = $barber->services()->pluck('services.id')->toArray();
            $missing    = array_diff($serviceIds, $offeredIds);

            if (!empty($missing)) {
                $v->errors()->add('service_ids', 'The selected barber does not offer all requested services.');
            }
        });
    }
}
