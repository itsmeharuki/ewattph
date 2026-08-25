# eWattPH ⚡🇵🇭

**Empowering Governance with Intelligent Energy** — national-scale digital platform providing real-time power-outage intelligence for the Philippine government during the energy emergency.

Built from `overview.md` (`flow.md`, `databaseRules.md`, `security.md`, `uiux.md`).

## Stack

| Layer | Tech |
|---|---|
| Backend | Laravel (PHP 8.4) |
| Frontend | React 18 + Inertia.js v2 + Tailwind CSS v4 (eGovPH-style design tokens) |
| Database | SQLite out of the box — switch to MySQL 8.0 in `.env` for production |
| AI | OpenRouter API (`OPENROUTER_MODEL`, default `openai/o1-mini`) with built-in **mock fallback** when no key is set |
| Maps | MapLibre GL JS (OSM tiles, no API key needed) |
| Realtime | Laravel Echo + Reverb/Pusher-compatible broadcasting (`OutageReportUpdated` event on `outages` / `lgu.{id}` channels) |
| Auth | Session auth + Sanctum installed; role-based access control (8 roles) |

## Quick start

```bash
composer install          # or: php composer.phar install
npm install && npm run build
touch database/database.sqlite
php artisan migrate:fresh --seed
php artisan serve         # http://127.0.0.1:8000
```

### Demo accounts (password: `password`)

| Role | Email |
|---|---|
| Super Admin | admin@ewattph.gov |
| LGU Staff (Quezon City) | lgu.staff@quezoncity.gov.ph |
| LGU Admin (Quezon City) | lgu.admin@quezoncity.gov.ph |
| Provincial Admin (CALABARZON) | provincial@calabarzon.gov.ph |
| Agency Staff (DOE) | staff@doe.gov.ph |
| Agency Head (DOE) | head@doe.gov.ph |
| National Council (NDRRMC) | council@ndrrmc.gov.ph |
| Citizens | juan@example.com, pedro@example.com |

### Enabling real AI

Set in `.env`:

```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/o1-mini
```

Without a key, every AI feature (outage severity analysis, permit pre-screening, daily risk forecast) runs deterministic heuristic mocks — perfect for demos.

### MySQL 8.0

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=ewattph
...
```

## Feature map

- **Citizen**: report outages w/ GPS auto-detect, photo upload, outage type; track own tickets; live national map (`/map`); public permit tracker.
- **AI**: instant severity score (0–100) + probable cause per report; permit compliance pre-screening; scheduled 48-hour risk-zone forecast (`php artisan ai:analyze-risk`, runs daily at 06:00 via scheduler).
- **LGU dashboard** (`/lgu/dashboard`): scoped queue of reports, verify → dispatch → resolve workflow, response-time stats.
- **Permits**: application w/ document uploads, status timeline visible publicly, department review actions, notification on decision.
- **Notifications**: in-app history w/ unread dots, categories (Alerts/Updates/System), mark-all-read.
- **Admin** (`/admin/users`): role/LGU/agency assignment + audit log trail.
- **Security**: form-request validation, policies + scoped queries (IDOR), login throttling 5/min, public API throttled 60/min & report submissions 10/min, prompt-injection sanitisation before AI calls, audit logging of critical actions, GDPR-like data export at `/profile/export`.

## Deviations from overview.md

- **Laravel 12/13 instead of Laravel 11** — all 11.x releases are blocked by known security advisories (CVEs); same framework API surface.
- **Spatie Permission replaced by first-party roles table + policy/middleware layer**, exactly matching the schema in `databaseRules.md`.
- **SQLite default** for zero-config demo; production-ready MySQL config documented above.

## Broadcast setup (optional)

Realtime pushes degrade gracefully when disabled. To enable, configure Reverb (`laravel/echo-server` or `laravel/reverb`) and set `BROADCAST_CONNECTION=reverb` plus the `VITE_PUSHER_*` vars, then rebuild assets.
