<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFollowUpSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appointment_id' => ['required', 'integer', 'exists:appointments,id'],
            'template_type'  => ['required', 'in:thank_you,review_request,rebooking_reminder'],
            'send_after_hours'=> ['required', 'integer', 'min:1', 'max:8760'],
        ];
    }
}
