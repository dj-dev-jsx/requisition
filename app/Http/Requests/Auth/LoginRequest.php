<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string'],
            'password' => ['nullable', 'string'],
        ];
    }

public function authenticate(): void
{
    $user = \App\Models\User::where('username', $this->username)->first();

    if (! $user) {
        throw \Illuminate\Validation\ValidationException::withMessages([
            'username' => __('This username does not exist.'),
        ]);
    }

    // If password provided, check it (admin or user with password)
    if ($this->password) {
        if (! \Illuminate\Support\Facades\Hash::check($this->password, $user->password)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'password' => __('Invalid password.'),
            ]);
        }
    }

    // Log in the user
    \Illuminate\Support\Facades\Auth::login($user);
}


    public function sessionAuthentication(): void
    {
        $this->session()->regenerate();
    }
}
