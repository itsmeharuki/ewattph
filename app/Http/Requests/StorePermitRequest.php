<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePermitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'permit_type' => ['required', 'in:solar_rooftop,transmission_line,generator_set,battery_storage,wind_turbine,other'],
            'description' => ['required', 'string', 'max:3000'],
            'lgu_id' => ['nullable', 'integer', 'exists:lgus,id', 'required_without:agency_id'],
            'agency_id' => ['nullable', 'integer', 'exists:agencies,id'],
            'documents.*' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
        ];
    }

    public function messages(): array
    {
        return [
            'lgu_id.required_without' => 'Select the city/municipality or the national agency for this permit.',
        ];
    }
}
