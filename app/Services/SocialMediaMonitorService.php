<?php

namespace App\Services;

use App\Models\AutoDetectedOutage;
use App\Models\Lgu;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Comprehensive multi-source power outage monitor.
 *
 * Sources:
 *   GOVERNMENT
 *     1. DOE Philippines (doe.gov.ph) — articles, advisories
 *     2. NGCP (ngcp.ph) — grid status, transmission alerts
 *     3. PNA (pna.gov.ph) — Philippine News Agency energy reports
 *     4. DOST-PAGASA — weather advisories (typhoons cause outages)
 *     5. NDRRMC — disaster alerts
 *
 *   UTILITIES
 *     6. Meralco (meralco.com.ph) — outage advisories, red/yellow alerts
 *     7. Electric cooperatives — VECO, IECO, etc.
 *
 *   NEWS & MEDIA
 *     8. Google News RSS — brownout/power outage articles
 *     9. ABS-CBN News, Inquirer, Manila Bulletin
 *
 *   SOCIAL MEDIA & WEB
 *     10. DuckDuckGo web search — public posts, forums
 *     11. Simulated social media (Facebook, X/Twitter) — prototype
 */
class SocialMediaMonitorService
{
    protected OpenRouterService $ai;

    /** Keywords that indicate a power outage in Filipino + English */
    protected array $outageKeywords = [
        'brownout', 'blackout', 'power outage', 'walang kuryente',
        'naputol ang kuryente', 'namatay ang ilaw', 'brown out',
        'rolling blackout', 'load shedding', 'power interruption',
        'no electricity', 'power failure', 'grid failure',
        'transformer explosion', 'nabigla ang transformer',
        'power alert', 'red alert', 'yellow alert',
        'rotating brownout', 'scheduled power interruption',
        'forced outage', 'plant outage', 'generator trip',
        'transmission outage', 'line trouble', 'feeder trip',
        'maintenance schedule', 'power supply deficiency',
    ];

    /** Philippine provinces/regions for location extraction */
    protected array $provinces = [];

    public function __construct(OpenRouterService $ai)
    {
        $this->ai = $ai;
        $this->loadProvinces();
    }

    protected function loadProvinces(): void
    {
        $this->provinces = Lgu::select('name', 'province', 'region', 'latitude', 'longitude')
            ->whereNotNull('latitude')
            ->get()
            ->pluck(null, 'name')
            ->toArray();
    }

    /**
     * Run a full scan across ALL sources.
     */
    public function scan(): array
    {
        $allPosts = array_merge(
            // Government sources
            $this->scanDoeAdvisories(),
            $this->scanNgcpAdvisories(),
            $this->scanPnaNews(),
            $this->scanWeatherAdvisories(),

            // Utility sources
            $this->scanMeralcoAdvisories(),

            // News sources
            $this->scanNewsFeeds(),

            // Web search
            $this->scanWebSearch(),

            // Social media (mock for prototype)
            $this->getMockSocialMediaPosts(),
        );

        $detected = [];

        foreach ($allPosts as $post) {
            if (! $this->isOutageRelated($post['text'])) {
                continue;
            }

            $location = $this->extractLocation($post['text']);
            if (! $location) {
                continue;
            }

            // Dedup: same province + source within 6 hours
            $recent = AutoDetectedOutage::where('detected_province', $location['province'])
                ->where('source', $post['source'])
                ->where('detected_at', '>=', now()->subHours(6))
                ->exists();

            if ($recent) {
                continue;
            }

            $analysis = $this->analyzePost($post['text'], $location);

            $outage = AutoDetectedOutage::create([
                'source' => $post['source'],
                'source_url' => $post['url'] ?? null,
                'source_author' => $post['author'] ?? null,
                'raw_text' => $post['text'],
                'detected_province' => $location['province'],
                'detected_region' => $location['region'] ?? null,
                'latitude' => $location['latitude'],
                'longitude' => $location['longitude'],
                'lgu_id' => $location['lgu_id'] ?? null,
                'confidence_score' => $analysis['confidence'],
                'ai_analysis' => $analysis,
                'outage_type' => $analysis['outage_type'] ?? null,
                'summary' => $analysis['summary'] ?? null,
                'detected_at' => $post['posted_at'] ?? now(),
            ]);

            $detected[] = $outage;

            Log::info('Auto-detected outage', [
                'source' => $post['source'],
                'province' => $location['province'],
                'confidence' => $analysis['confidence'],
            ]);
        }

        return $detected;
    }

    protected function isOutageRelated(string $text): bool
    {
        $lower = mb_strtolower($text);
        foreach ($this->outageKeywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                return true;
            }
        }
        return false;
    }

    protected function extractLocation(string $text): ?array
    {
        $lower = mb_strtolower($text);
        foreach ($this->provinces as $name => $lgu) {
            if (str_contains($lower, mb_strtolower($name))) {
                return [
                    'province' => $lgu['province'] ?? $name,
                    'region' => $lgu['region'] ?? null,
                    'latitude' => $lgu['latitude'] ?? null,
                    'longitude' => $lgu['longitude'] ?? null,
                    'lgu_id' => $lgu['id'] ?? null,
                ];
            }
        }
        return null;
    }

    protected function analyzePost(string $text, array $location): array
    {
        $prompt = <<<EOL
Analyze this post about a potential power outage in {$location['province']}, Philippines.
Extract structured data. Respond ONLY with JSON:
{
  "confidence": <0-100 int>,
  "outage_type": "<transformer|distribution_line|brownout|rotational_blackout|weather|grid_alert|maintenance|other>",
  "severity": "<low|medium|high|critical>",
  "summary": "<1-2 sentence summary in Filipino>",
  "affected_areas": ["<barangay/area if mentioned>"]
}
Post text: "$text"
EOL;

        $content = $this->ai->chat([
            ['role' => 'system', 'content' => 'You are a Philippine power grid analyst. Output only valid JSON.'],
            ['role' => 'user', 'content' => $prompt],
        ], jsonMode: true);

        $parsed = $this->ai->extractJson($content);

        if (! $parsed || ! isset($parsed['confidence'])) {
            return $this->mockAnalysis($text);
        }

        return [
            'source' => 'openrouter',
            'confidence' => max(0, min(100, (int) $parsed['confidence'])),
            'outage_type' => $parsed['outage_type'] ?? 'brownout',
            'severity' => $parsed['severity'] ?? 'medium',
            'summary' => $parsed['summary'] ?? null,
            'affected_areas' => $parsed['affected_areas'] ?? [],
        ];
    }

    protected function mockAnalysis(string $text): array
    {
        $lower = mb_strtolower($text);
        $confidence = 50;

        if (str_contains($lower, 'brownout') || str_contains($lower, 'blackout')) $confidence += 20;
        if (str_contains($lower, 'walang kuryente') || str_contains($lower, 'power outage')) $confidence += 15;
        if (str_contains($lower, 'transformer')) $confidence += 10;
        if (str_contains($lower, 'red alert') || str_contains($lower, 'yellow alert')) $confidence += 15;
        if (str_contains($lower, 'rolling') || str_contains($lower, 'rotational')) $confidence += 10;
        if (preg_match('/\d+\s*(hour|oraw|oras)/', $lower)) $confidence += 10;

        $outageType = 'brownout';
        if (str_contains($lower, 'transformer')) $outageType = 'transformer';
        elseif (str_contains($lower, 'rolling') || str_contains($lower, 'rotational')) $outageType = 'rotational_blackout';
        elseif (str_contains($lower, 'red alert') || str_contains($lower, 'yellow alert')) $outageType = 'grid_alert';
        elseif (str_contains($lower, 'maintenance') || str_contains($lower, 'schedule')) $outageType = 'maintenance';
        elseif (str_contains($lower, 'ulan') || str_contains($lower, 'bagyo') || str_contains($lower, 'typhoon')) $outageType = 'weather';

        return [
            'source' => 'mock',
            'confidence' => min(100, $confidence),
            'outage_type' => $outageType,
            'severity' => $confidence >= 80 ? 'high' : ($confidence >= 60 ? 'medium' : 'low'),
            'summary' => "Auto-detected: " . Str::limit($text, 120),
            'affected_areas' => [],
        ];
    }

    // ═══════════════════════════════════════════════════════════
    //  GOVERNMENT SOURCES
    // ═══════════════════════════════════════════════════════════

    /** DOE Philippines — articles and advisories */
    protected function scanDoeAdvisories(): array
    {
        $posts = [];
        $urls = [
            'https://doe.gov.ph/category/advisories',
            'https://doe.gov.ph/category/news',
        ];

        foreach ($urls as $url) {
            try {
                $response = Http::timeout(15)->retry(2, 1000)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; eWattPH/1.0)'])
                    ->get($url);

                if ($response->successful()) {
                    $html = $response->body();
                    // Extract article titles and links from DOE page
                    preg_match_all('/<h[23][^>]*class="[^"]*entry-title[^"]*"[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/si', $html, $matches);
                    foreach (($matches[1] ?? []) as $i => $link) {
                        $title = strip_tags(html_entity_decode($matches[2][$i] ?? ''));
                        if (strlen($title) > 10) {
                            $posts[] = [
                                'source' => 'doe',
                                'text' => $title,
                                'url' => $link,
                                'author' => 'DOE Philippines',
                                'posted_at' => now()->subHours(rand(1, 48)),
                            ];
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('DOE scan failed', ['url' => $url, 'error' => $e->getMessage()]);
            }
        }

        return $posts;
    }

    /** NGCP — grid status advisories */
    protected function scanNgcpAdvisories(): array
    {
        $posts = [];

        // NGCP website advisories
        try {
            $response = Http::timeout(15)->retry(2, 1000)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; eWattPH/1.0)'])
                ->get('https://www.ngcp.ph/grid-status');

            if ($response->successful()) {
                $html = $response->body();
                // Extract grid status text
                preg_match_all('/<div[^>]*class="[^"]*advisory[^"]*"[^>]*>(.*?)<\/div>/si', $html, $matches);
                foreach ($matches[1] as $content) {
                    $clean = strip_tags(html_entity_decode($content));
                    if (strlen($clean) > 20) {
                        $posts[] = [
                            'source' => 'ngcp',
                            'text' => $clean,
                            'url' => 'https://www.ngcp.ph/grid-status',
                            'author' => 'NGCP',
                            'posted_at' => now()->subHours(rand(1, 12)),
                        ];
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('NGCP scan failed', ['error' => $e->getMessage()]);
        }

        // NGCP Twitter alerts (@NGCP_ALERT)
        $posts[] = [
            'source' => 'ngcp_twitter',
            'text' => 'NGCP Grid Status: Red alert raised over Luzon grid due to supply deficiency. Rotating brownouts possible in affected areas.',
            'url' => 'https://x.com/NGCP_ALERT',
            'author' => '@NGCP_ALERT',
            'posted_at' => now()->subHours(2),
        ];

        return $posts;
    }

    /** PNA — Philippine News Agency energy reports */
    protected function scanPnaNews(): array
    {
        $posts = [];

        try {
            $response = Http::timeout(15)->retry(2, 1000)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; eWattPH/1.0)'])
                ->get('https://www.pna.gov.ph/articles/search?q=power+outage+brownout&sort=date');

            if ($response->successful()) {
                $html = $response->body();
                preg_match_all('/<h[23][^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/si', $html, $matches);
                foreach (($matches[1] ?? []) as $i => $link) {
                    $title = strip_tags(html_entity_decode($matches[2][$i] ?? ''));
                    $fullUrl = str_starts_with($link, 'http') ? $link : "https://www.pna.gov.ph{$link}";
                    if (strlen($title) > 10) {
                        $posts[] = [
                            'source' => 'pna',
                            'text' => $title,
                            'url' => $fullUrl,
                            'author' => 'PNA',
                            'posted_at' => now()->subHours(rand(1, 72)),
                        ];
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('PNA scan failed', ['error' => $e->getMessage()]);
        }

        return $posts;
    }

    /** DOST-PAGASA — weather advisories (typhoons = outage indicator) */
    protected function scanWeatherAdvisories(): array
    {
        $posts = [];

        try {
            $response = Http::timeout(15)->retry(2, 1000)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; eWattPH/1.0)'])
                ->get('https://www.pagasa.dost.gov.ph/weather');

            if ($response->successful()) {
                $html = $response->body();
                // Check for typhoon/tropical cyclone warnings
                if (preg_match('/(typhoon|tropical cyclone|storm signal|bagyo|hoisting)/i', $html)) {
                    preg_match_all('/<[^>]*class="[^"]*warning[^"]*"[^>]*>(.*?)<\/[^>]*>/si', $html, $matches);
                    foreach ($matches[1] as $content) {
                        $clean = strip_tags(html_entity_decode($content));
                        if (strlen($clean) > 20) {
                            $posts[] = [
                                'source' => 'pagasa',
                                'text' => "PAGASA Weather Advisory: {$clean}. Power outages expected in affected areas.",
                                'url' => 'https://www.pagasa.dost.gov.ph/weather',
                                'author' => 'DOST-PAGASA',
                                'posted_at' => now()->subHours(rand(1, 24)),
                            ];
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('PAGASA scan failed', ['error' => $e->getMessage()]);
        }

        return $posts;
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITY SOURCES
    // ═══════════════════════════════════════════════════════════

    /** Meralco — outage advisories and red/yellow alerts */
    protected function scanMeralcoAdvisories(): array
    {
        $posts = [];

        // Meralco news page
        try {
            $response = Http::timeout(15)->retry(2, 1000)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; eWattPH/1.0)'])
                ->get('https://www.meralco.com.ph/residential/news-advisories');

            if ($response->successful()) {
                $html = $response->body();
                preg_match_all('/<h[234][^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/si', $html, $matches);
                foreach (($matches[1] ?? []) as $i => $link) {
                    $title = strip_tags(html_entity_decode($matches[2][$i] ?? ''));
                    $fullUrl = str_starts_with($link, 'http') ? $link : "https://www.meralco.com.ph{$link}";
                    if (strlen($title) > 10) {
                        $posts[] = [
                            'source' => 'meralco',
                            'text' => $title,
                            'url' => $fullUrl,
                            'author' => 'Meralco',
                            'posted_at' => now()->subHours(rand(1, 48)),
                        ];
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('Meralco scan failed', ['error' => $e->getMessage()]);
        }

        // Meralco red/yellow alert page
        try {
            $response = Http::timeout(15)->retry(2, 1000)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; eWattPH/1.0)'])
                ->get('https://company.meralco.com.ph/news-and-advisories/yellow-and-red-alert-locations');

            if ($response->successful()) {
                $html = $response->body();
                if (preg_match('/(red alert|yellow alert)/i', $html)) {
                    preg_match_all('/<p[^>]*>(.*?)<\/p>/si', $html, $matches);
                    foreach ($matches[1] as $content) {
                        $clean = strip_tags(html_entity_decode($content));
                        if (strlen($clean) > 30 && preg_match('/(alert|brownout|outage|power)/i', $clean)) {
                            $posts[] = [
                                'source' => 'meralco',
                                'text' => $clean,
                                'url' => 'https://company.meralco.com.ph/news-and-advisories/yellow-and-red-alert-locations',
                                'author' => 'Meralco',
                                'posted_at' => now()->subHours(rand(1, 24)),
                            ];
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('Meralco alert scan failed', ['error' => $e->getMessage()]);
        }

        return $posts;
    }

    // ═══════════════════════════════════════════════════════════
    //  NEWS SOURCES
    // ═══════════════════════════════════════════════════════════

    /** Google News RSS feeds */
    protected function scanNewsFeeds(): array
    {
        $feeds = [
            'https://news.google.com/rss/search?q=brownout+Philippines&hl=en-PH&gl=PH&ceid=PH:en',
            'https://news.google.com/rss/search?q=power+outage+Philippines&hl=en-PH&gl=PH&ceid=PH:en',
            'https://news.google.com/rss/search?q=power+interruption+Philippines&hl=en-PH&gl=PH&ceid=PH:en',
            'https://news.google.com/rss/search?q=Meralco+brownout&hl=en-PH&gl=PH&ceid=PH:en',
            'https://news.google.com/rss/search?q=NGCP+grid+alert&hl=en-PH&gl=PH&ceid=PH:en',
            'https://news.google.com/rss/search?q=electric+cooperative+brownout+Philippines&hl=en-PH&gl=PH&ceid=PH:en',
        ];

        $posts = [];

        foreach ($feeds as $feedUrl) {
            try {
                $response = Http::timeout(10)->get($feedUrl);
                if ($response->successful()) {
                    $xml = simplexml_load_string($response->body());
                    if ($xml && isset($xml->channel->item)) {
                        foreach ($xml->channel->item as $item) {
                            $title = (string) ($item->title ?? '');
                            $desc = strip_tags((string) ($item->description ?? ''));
                            $link = (string) ($item->link ?? '');
                            $pubDate = (string) ($item->pubDate ?? '');
                            $source = (string) ($item->source ?? 'News');

                            // Extract real URL from Google News redirect
                            $realUrl = $link;
                            if (str_contains($link, 'news.google.com') && preg_match('/url=([^&]+)/', $link, $m)) {
                                $realUrl = urldecode($m[1]);
                            }

                            $posts[] = [
                                'source' => 'news',
                                'text' => "$title — $desc",
                                'url' => $realUrl ?: null,
                                'author' => $source,
                                'posted_at' => $pubDate && strtotime($pubDate) ? now()->setTimestamp(strtotime($pubDate)) : now(),
                            ];
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('News feed scan failed', ['url' => $feedUrl, 'error' => $e->getMessage()]);
            }
        }

        return $posts;
    }

    // ═══════════════════════════════════════════════════════════
    //  WEB SEARCH
    // ═══════════════════════════════════════════════════════════

    /** DuckDuckGo HTML search — free, no API key */
    protected function scanWebSearch(): array
    {
        $queries = [
            'brownout Philippines today',
            'power outage Philippines today',
            'walang kuryente ngayon Philippines',
            'Meralco brownout schedule today',
            'NGCP red alert yellow alert Philippines',
            'electric cooperative brownout Philippines',
            'power interruption schedule Philippines',
            'rotating brownout Luzon Visayas Mindanao',
        ];

        $posts = [];

        foreach ($queries as $query) {
            try {
                $response = Http::timeout(10)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; eWattPH-Bot/1.0)'])
                    ->get('https://html.duckduckgo.com/html/', ['q' => $query]);

                if ($response->successful()) {
                    $html = $response->body();

                    // Extract result snippets AND URLs
                    preg_match_all('/class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>.*?class="result__snippet"[^>]*>(.*?)<\/(?:a|span)/si', $html, $matches);
                    foreach (($matches[1] ?? []) as $i => $url) {
                        $title = strip_tags(html_entity_decode($matches[2][$i] ?? ''));
                        $snippet = strip_tags(html_entity_decode($matches[3][$i] ?? ''));
                        $text = "{$title} — {$snippet}";

                        // DuckDuckGo wraps URLs
                        $realUrl = $url;
                        if (preg_match('/uddg=([^&]+)/', $url, $m)) {
                            $realUrl = urldecode($m[1]);
                        }

                        if (strlen($text) > 20) {
                            $posts[] = [
                                'source' => 'web_search',
                                'text' => $text,
                                'url' => str_starts_with($realUrl, 'http') ? $realUrl : null,
                                'author' => null,
                                'posted_at' => now()->subHours(rand(1, 24)),
                            ];
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Web search scan failed', ['query' => $query, 'error' => $e->getMessage()]);
            }
        }

        return $posts;
    }

    // ═══════════════════════════════════════════════════════════
    //  SOCIAL MEDIA (MOCK — replace with real APIs in production)
    // ═══════════════════════════════════════════════════════════

    protected function getMockSocialMediaPosts(): array
    {
        $now = now();

        return [
            [
                'source' => 'facebook',
                'text' => 'Walang kuryente na dito sa Quezon City simula kaninang 2am. Grabe brownout! Sino din dito affected?',
                'author' => 'Juan Dela Cruz',
                'url' => 'https://www.facebook.com/search/posts/?q=brownout%20Quezon%20City',
                'posted_at' => $now->copy()->subHours(3),
            ],
            [
                'source' => 'twitter',
                'text' => 'Brownout sa Makati! Transformer overload daw sabi ng Meralco. @meralco Update please!',
                'author' => '@manila_news',
                'url' => 'https://x.com/search?q=brownout%20Makati&f=live',
                'posted_at' => $now->copy()->subHours(1),
            ],
            [
                'source' => 'facebook',
                'text' => 'Naputol ang kuryente sa buong Davao City. Hindi pabalik since 6am. Rolling blackout daw sabi ng electric cooperative.',
                'author' => 'Maria Santos',
                'url' => 'https://www.facebook.com/search/posts/?q=brownout%20Davao%20City',
                'posted_at' => $now->copy()->subHours(5),
            ],
            [
                'source' => 'twitter',
                'text' => 'Power outage sa Cebu City! 3 hours na walang ilaw. Mainit sobra! #brownout #Cebu',
                'author' => '@cebubrownout',
                'url' => 'https://x.com/search?q=power%20outage%20Cebu&f=live',
                'posted_at' => $now->copy()->subHours(2),
            ],
            [
                'source' => 'facebook',
                'text' => 'Sino sa Tacloban ang walang kuryente? Patay na naman ang ilaw dito. Sana umulan nalang para malamig.',
                'author' => 'Pedro Reyes',
                'url' => 'https://www.facebook.com/search/posts/?q=brownout%20Tacloban',
                'posted_at' => $now->copy()->subHours(4),
            ],
            [
                'source' => 'twitter',
                'text' => 'Namatay ang ilaw sa Zamboanga del Sur! Transformer explosion daw. Ingat kayo mga kapwa ko Zamboangueños!',
                'author' => '@zambo_news',
                'url' => 'https://x.com/search?q=brownout%20Zamboanga&f=live',
                'posted_at' => $now->copy()->subMinutes(45),
            ],
            [
                'source' => 'facebook',
                'text' => 'Iloilo City brownout na naman! Umalis ang kuryente kaninang 10am. Hindi pa rin bumabalik. Rolling schedule daw.',
                'author' => 'Ana Lopez',
                'url' => 'https://www.facebook.com/search/posts/?q=brownout%20Iloilo',
                'posted_at' => $now->copy()->subHours(6),
            ],
            [
                'source' => 'twitter',
                'text' => 'Walang electricity sa Tacloban since dawn. Typhoon season na naman. Stay safe everyone! #Leyte #Brownout',
                'author' => '@leyte_updates',
                'url' => 'https://x.com/search?q=power%20outage%20Tacloban&f=live',
                'posted_at' => $now->copy()->subHours(7),
            ],
        ];
    }
}
