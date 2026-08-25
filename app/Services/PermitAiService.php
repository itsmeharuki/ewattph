<?php

namespace App\Services;

use App\Models\Permit;
use Illuminate\Support\Facades\Log;

class PermitAiService
{
    public function __construct(protected OpenRouterService $ai)
    {
    }

    /**
     * Pre-screen a permit application: compliance score (0-100), completeness
     * checklist, routing suggestion. Falls back to heuristic mock.
     */
    public function preScreen(Permit $permit): array
    {
        $docCount = count((array) $permit->documents);
        $context = [
            'permit_type' => $permit->permit_type,
            'description' => OpenRouterService::sanitize((string) $permit->description),
            'documents_uploaded' => $docCount,
            'has_location' => (bool) $permit->lgu_id || (bool) $permit->agency_id,
            'applicant_verified' => (bool) $permit->applicant?->email_verified_at,
        ];

        $prompt = 'You are a government permit compliance reviewer for the Philippine energy sector.'
            .' Pre-screen this application and respond ONLY with JSON:'
            .' {"compliance_score": <0-100 int>, "issues": ["<issue>", "..."], "missing_requirements": ["<requirement>", "..."], "summary": "<2 sentence summary>"}'
            ."\n\nApplication data:\n".json_encode($context);

        $content = $this->ai->chat([
            ['role' => 'system', 'content' => 'You are a precise JSON-only compliance screener. Never output prose.'],
            ['role' => 'user', 'content' => $prompt],
        ], jsonMode: true);

        $parsed = $this->ai->extractJson($content);

        if (! $parsed || ! isset($parsed['compliance_score'])) {
            return $this->mockPreScreen($context);
        }

        return [
            'source' => 'openrouter',
            'model' => config('services.openrouter.model'),
            'compliance_score' => max(0, min(100, (int) $parsed['compliance_score'])),
            'issues' => array_values((array) ($parsed['issues'] ?? [])),
            'missing_requirements' => array_values((array) ($parsed['missing_requirements'] ?? [])),
            'summary' => (string) ($parsed['summary'] ?? ''),
        ];
    }

    protected function mockPreScreen(array $context): array
    {
        Log::info('Using mock AI pre-screening', ['type' => $context['permit_type']]);

        $score = 60 + min(20, $context['documents_uploaded'] * 5) + ($context['has_location'] ? 10 : 0) + ($context['applicant_verified'] ? 10 : 0);

        return [
            'source' => 'mock',
            'compliance_score' => min(100, $score),
            'issues' => $docCount = ($context['documents_uploaded'] < 2 ? ['Only '.$context['documents_uploaded'].' document(s) uploaded — typical applications require at least two supporting documents.'] : []),
            'missing_requirements' => $context['applicant_verified'] ? [] : ['Applicant email is not verified'],
            'summary' => 'Automated pre-screening complete. Application routed to the appropriate reviewing department.',
        ];
    }
}
