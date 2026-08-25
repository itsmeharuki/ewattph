<?php

namespace App\Http\Requests;

use App\Models\Lgu;
use Illuminate\Foundation\Http\FormRequest;

class StoreOutageReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'latitude' => ['required', 'numeric', 'between:4,21'],
            'longitude' => ['required', 'numeric', 'between:115,127'],
            'description' => ['nullable', 'string', 'max:2000'],
            'photo' => ['nullable', 'image', 'max:5120'],
            'outage_type' => ['required', 'in:transformer,distribution_line,transmission_line,brownout,rotational_blackout,other'],
            'lgu_id' => ['required', 'integer', 'exists:lgus,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Snap the chosen LGU to the nearest one when the reporter only has coordinates.
        if (! $this->filled('lgu_id') && $this->filled(['latitude', 'longitude'])) {
            $this->merge(['lgu_id' => Lgu::nearest($this->float('latitude'), $this->float('longitude'))?->id]);
        }
    }

    public function messages(): array
    {
        return [
            'latitude.between' => 'Location must be within the Philippines.',
            'longitude.between' => 'Location must be within the Philippines.',
        ];
    }
}
