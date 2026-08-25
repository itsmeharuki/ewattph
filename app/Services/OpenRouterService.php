<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterService
{
    protected ?string $apiKey;

    protected string $model;

    protected string $baseUrl = 'https://openrouter.ai/api/v1';

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.key');
        $this->model = config('services.openrouter.model', 'openai/o1-mini');
    }

    public function enabled(): bool
    {
        return ! empty($this->apiKey);
    }

    /**
     * Send a chat completion request to OpenRouter and return the assistant message.
     * Falls back to null when disabled or on failure (callers must handle mocks).
     */
    public function chat(array $messages, bool $jsonMode = false, ?float $temperature = 0.3): ?string
    {
        if (! $this->enabled()) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
            ])->timeout(60)->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => $messages,
                'temperature' => $temperature,
                ...($jsonMode ? ['response_format' => ['type' => 'json_object']] : []),
            ]);

            if ($response->failed()) {
                Log::warning('OpenRouter request failed', ['status' => $response->status()]);

                return null;
            }

            return data_get($response->json(), 'choices.0.message.content');
        } catch (\Throwable $e) {
            Log::error('OpenRouter exception: '.$e->getMessage());

            return null;
        }
    }

    public function extractJson(?string $text): ?array
    {
        if (! $text) {
            return null;
        }

        if (preg_match('/\{.*\}|\[.*\]/s', $text, $m)) {
            $decoded = json_decode($m[0], true);

            return is_array($decoded) ? $decoded : null;
        }

        return null;
    }

    /** Strip user content that could inject instructions into prompts. */
    public static function sanitize(string $input): string
    {
        $input = strip_tags($input);

        return mb_substr(preg_replace('/(ignore|disregard|override)\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts)/i', '[redacted]', $input), 0, 2000);
    }
}
