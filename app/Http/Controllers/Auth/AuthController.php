<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailOtp;
use App\Models\Role;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    private const MAX_OTP_ATTEMPTS = 5;
    private const OTP_LOCKOUT_MINUTES = 15;

    public function showLogin()
    {
        return inertia('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->intended(route('home'));
        }

        return back()->withErrors(['email' => __('These credentials do not match our records.')])
            ->onlyInput('email');
    }

    public function showRegister()
    {
        return inertia('Auth/Register');
    }

    /**
     * Step 1: Validate registration data and send OTP
     */
    public function sendOtp(Request $request, EmailService $emailService)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // Create a signed token to bind session to this registration
        $token = Hash::make($validated['email'] . now()->timestamp);

        // Store registration data + security token in session
        $request->session()->put('registration', $validated);
        $request->session()->put('registration_token', $token);
        $request->session()->put('otp_attempts', 0);

        // Reset attempt counter for this email
        Cache::forget("otp_attempts:{$validated['email']}");

        $sent = $emailService->sendOtp($validated['email'], 'registration');

        if (!$sent) {
            $request->session()->forget(['registration', 'registration_token', 'otp_attempts']);
            return back()->withErrors(['email' => 'Failed to send verification code. Please try again.']);
        }

        return inertia('Auth/VerifyOtp', [
            'email' => $validated['email'],
        ]);
    }

    /**
     * Step 2: Verify OTP and complete registration
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'code' => ['required', 'string', 'size:6', 'digits:6'],
        ]);

        // 1. Check if session has registration data
        $registration = $request->session()->get('registration');
        $registrationToken = $request->session()->get('registration_token');

        if (!$registration || !$registrationToken) {
            return redirect()->route('register')->withErrors([
                'email' => 'Registration session expired. Please start over.',
            ]);
        }

        // 2. Verify email matches session
        if ($registration['email'] !== $request->email) {
            return back()->withErrors(['code' => 'Email mismatch. Please try again.']);
        }

        // 3. Check attempt lockout
        $lockoutKey = "otp_lockout:{$request->email}";
        if (Cache::has($lockoutKey)) {
            $ttl = Cache::get($lockoutKey);
            return back()->withErrors([
                'code' => "Too many failed attempts. Please wait {$ttl} minutes before trying again.",
            ]);
        }

        // 4. Check OTP attempt count
        $attempts = Cache::get("otp_attempts:{$request->email}", 0);
        if ($attempts >= self::MAX_OTP_ATTEMPTS) {
            Cache::put($lockoutKey, self::OTP_LOCKOUT_MINUTES, now()->addMinutes(self::OTP_LOCKOUT_MINUTES));
            Cache::forget("otp_attempts:{$request->email}");
            return back()->withErrors([
                'code' => 'Too many failed attempts. Please wait 15 minutes or request a new code.',
            ]);
        }

        // 5. Find and verify OTP
        $otp = EmailOtp::where('email', $request->email)
            ->where('type', 'registration')
            ->where('verified', false)
            ->latest()
            ->first();

        if (!$otp) {
            return back()->withErrors(['code' => 'No verification code found. Please request a new one.']);
        }

        if ($otp->isExpired()) {
            return back()->withErrors(['code' => 'Verification code has expired. Please request a new one.']);
        }

        if (!hash_equals($otp->code, $request->code)) {
            // Increment attempt counter
            Cache::increment("otp_attempts:{$request->email}");
            $remaining = self::MAX_OTP_ATTEMPTS - ($attempts + 1);

            if ($remaining <= 0) {
                Cache::put($lockoutKey, self::OTP_LOCKOUT_MINUTES, now()->addMinutes(self::OTP_LOCKOUT_MINUTES));
                return back()->withErrors([
                    'code' => 'Too many failed attempts. Please wait 15 minutes or request a new code.',
                ]);
            }

            return back()->withErrors([
                'code' => "Invalid verification code. {$remaining} attempts remaining.",
            ]);
        }

        // 6. OTP verified — create user
        $otp->update(['verified' => true]);
        Cache::forget("otp_attempts:{$request->email}");

        $user = User::create([
            'name' => $registration['name'],
            'email' => $registration['email'],
            'password' => $registration['password'],
            'role_id' => Role::where('name', Role::CITIZEN)->value('id'),
        ]);

        $user->markEmailAsVerified();

        // Clean up session
        $request->session()->forget(['registration', 'registration_token', 'otp_attempts']);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('home');
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request, EmailService $emailService)
    {
        $email = $request->validate([
            'email' => ['required', 'string', 'email'],
        ])['email'];

        // Verify session still has registration data
        $registration = $request->session()->get('registration');
        if (!$registration || $registration['email'] !== $email) {
            return redirect()->route('register')->withErrors([
                'email' => 'Registration session expired. Please start over.',
            ]);
        }

        // Reset attempt counter
        Cache::forget("otp_attempts:{$email}");

        $sent = $emailService->sendOtp($email, 'registration');

        if (!$sent) {
            return back()->withErrors(['email' => 'Failed to send verification code. Please try again.']);
        }

        return back()->with('status', 'Verification code sent!');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('welcome');
    }
}
