<?php

namespace App\Services;

use App\Models\EmailOtp;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    public function sendOtp(string $email, string $type = 'registration'): bool
    {
        $otp = EmailOtp::generate($email, $type);

        $resendKey = config('services.resend.key');

        if ($resendKey) {
            return $this->sendViaResend($email, $otp->code, $type);
        }

        // Fallback: log the OTP (for local development)
        return $this->sendViaLog($email, $otp->code, $type);
    }

    protected function sendViaResend(string $email, string $code, string $type): bool
    {
        $subject = match ($type) {
            'registration' => 'eWattPH — Your Verification Code',
            'login' => 'eWattPH — Your Login Code',
            'password_reset' => 'eWattPH — Password Reset Code',
            default => 'eWattPH — Your Verification Code',
        };

        $response = Http::withToken(config('services.resend.key'))
            ->post('https://api.resend.com/emails', [
                'from' => config('services.resend.from', 'eWattPH <onboarding@resend.dev>'),
                'to' => [$email],
                'subject' => $subject,
                'html' => $this->buildOtpEmail($code, $type),
            ]);

        if ($response->failed()) {
            Log::error('Resend API Error: ' . $response->body());
            return false;
        }

        return true;
    }

    protected function sendViaLog(string $email, string $code, string $type): bool
    {
        Log::info("OTP for {$email} ({$type}): {$code}");

        // Also try Laravel mail for local testing
        try {
            Mail::raw("Your verification code is: {$code}", function ($message) use ($email, $type) {
                $message->to($email)
                    ->subject(match ($type) {
                        'registration' => 'eWattPH — Your Verification Code',
                        'login' => 'eWattPH — Your Login Code',
                        'password_reset' => 'eWattPH — Password Reset Code',
                        default => 'eWattPH — Your Verification Code',
                    });
            });
        } catch (\Throwable $e) {
            Log::warning('Mail send failed, OTP logged instead: ' . $e->getMessage());
        }

        return true;
    }

    protected function buildOtpEmail(string $code, string $type): string
    {
        $label = match ($type) {
            'registration' => 'account verification',
            'login' => 'login',
            'password_reset' => 'password reset',
            default => 'verification',
        };

        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
    <h2 style="color: #1E3A8A; font-size: 20px; margin: 0 0 8px;">eWattPH</h2>
    <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px;">National Energy Intelligence Platform</p>
    <p style="color: #1F2937; font-size: 15px; margin: 0 0 16px;">Your {$label} code:</p>
    <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin: 0 0 24px;">
      <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1E3A8A;">{$code}</span>
    </div>
    <p style="color: #6B7280; font-size: 13px; margin: 0 0 8px;">This code expires in <strong>10 minutes</strong>.</p>
    <p style="color: #6B7280; font-size: 13px; margin: 0;">If you did not request this, you can safely ignore this email.</p>
  </div>
  <p style="color: #9CA3AF; font-size: 11px; text-align: center; margin-top: 24px;">eWattPH — Empowering Governance with Intelligent Energy</p>
</body>
</html>
HTML;
    }
}
