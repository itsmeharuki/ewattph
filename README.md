<div align="center">

<img src="public/images/ewattph-mark.svg" alt="eWattPH" width="140" />

# eWattPH

**National Energy Intelligence Platform for the Philippine Government**

*Empowering Governance with Intelligent Energy*

NextGenPH 2026 Entry

</div>

---

## 1. Overview

eWattPH is a national-scale digital platform that provides real-time power outage intelligence to the Philippine government during the national energy emergency. It connects citizens, local government units (LGUs), national agencies, and the National Emergency Council into a single, transparent ecosystem built around one live national map of the power grid.

The platform answers the question: **"How might the government deliver essential services and improve its effectiveness amidst the national energy emergency situation?"**

---

## 2. The Problem

The Philippines currently faces an energy emergency characterized by thin power reserves, rotational brownouts, and an aging distribution grid. Government response is hampered by four structural gaps:

| Gap | Description |
|---|---|
| **No shared situational awareness** | Outage information is scattered across electric cooperative hotlines, social media posts, and word of mouth. No agency operates a single, nationwide, real-time picture of the grid. |
| **Slow, unverified reporting** | By the time an outage is formally confirmed, hours have passed. Response teams are dispatched blind, without severity estimates or location clustering. |
| **Opaque permitting** | Energy-related permits (solar, transmission, generation) move through fragmented agency processes with no public visibility. Applicants cannot track status; government cannot measure bottlenecks. |
| **Siloed agencies** | LGUs, DOE, DOLE, NGCP, and NDRRMC each hold partial data. Cross-agency coordination during a crisis happens through phone calls and ad-hoc meetings, not shared systems. |

The cost is measured in lost productivity, unserved households, and delayed emergency response.

---

## 3. The Solution

eWattPH closes each gap with one integrated platform:

| Capability | How it solves the gap |
|---|---|
| **Crowdsourced outage reporting** | Any citizen can report an outage in seconds (GPS auto-location, photo, outage type). Millions of reports fuse into one live national map — the grid becomes observable in real time. |
| **AI-driven triage** | Every report is instantly scored for severity (0–100) with a probable cause and suggested actions via OpenRouter AI, so LGUs dispatch the right resources first. |
| **Transparent permit tracking** | Energy permits are submitted, AI pre-screened for compliance, routed to the correct department, and tracked publicly from submission to decision. |
| **Multi-agency coordination** | A hierarchical role model (citizen to National Emergency Council) gives every level of government scoped, shared access to the same operational picture. |
| **Predictive analytics** | A scheduled AI engine aggregates 24-hour outage data and forecasts 48-hour risk zones per region, with recommended actions for pre-positioning response resources. |

---

## 4. System Business Flow

### 4.1 Citizen Outage Reporting

```
Citizen ──▶ Report Outage (GPS / photo / type)
                │
                ▼
        eWattPH Backend ──▶ Stored as PENDING
                │
                ├──▶ WebSocket event ──▶ LGU Dashboard (scoped by boundaries)
                │
                └──▶ AI Service ──▶ Severity score (0–100)
                                    Probable cause
                                    Suggested actions
                │
                ▼
Citizen receives ticket ID + estimated response time
Public map updates with severity-colored marker
```

### 4.2 LGU Response Workflow

```
LGU Staff dashboard (own LGU scope only)
    │
    ├─ VERIFY   ──▶ status = verified  ──▶ red marker on public map
    ├─ DISPATCH ──▶ assign response team, notes logged
    └─ RESOLVE  ──▶ status = resolved   ──▶ green marker, citizen notified
    │
    └─ Escalation ──▶ LGU Admin ──▶ Provincial Admin ──▶ DOE / national agencies
```

### 4.3 Permit Tracking and Approval

```
Applicant ──▶ Submit application + documents
                │
                ▼
        AI pre-screening ──▶ Compliance score (0–100)
                             Missing requirements
                             Routing to department
                │
                ▼
Department review (LGU Staff or Agency Staff)
    ├─ in_review ──▶ approved / rejected (with decision note)
    │
    ▼
Applicant notified ──▶ Status visible on public permit tracker
Full status history retained for transparency
```

### 4.4 Predictive Analytics Engine

```
Scheduler (daily 06:00)
    │
    ▼
Aggregate: 24h outage reports + permit statuses + grid context
    │
    ▼
OpenRouter AI ──▶ Structured JSON:
    │              risk_zones (region, province, risk_level, predicted_cause)
    │              recommended_actions
    │              affected_sectors
    ▼
Stored in ai_analyses ──▶ Public heatmap + LGU dashboards + NEC summary
```

### 4.5 Cross-Agency Coordination

A widespread CALABARZON outage escalates through the hierarchy: citizens report, LGUs verify and dispatch, the LGU Administrator requests provincial assistance, the Provincial Administrator notifies DOE, DOE implements load mitigation, DOLE issues advisories through the announcement system, and the National Emergency Council monitors everything on one dashboard. Every action is captured in the audit log.

---

## 5. Role Model

Nine hierarchical roles mirror the structure of the Philippine government, each with strictly scoped access:

| Level | Role | Scope |
|-------|------|-------|
| 1 | Citizen | Nationwide — view map, report outages, track own reports and permits |
| 2 | LGU Staff | Own LGU — verify reports, dispatch teams, process local permits |
| 3 | LGU Administrator | Own LGU — approve dispatches, allocate local resources |
| 4 | Provincial Administrator | Province — coordinate cross-LGU responses |
| 5 | Agency Staff | Own agency — monitor domain data, review national permits |
| 6 | Agency Head | Own agency — approve policy, issue directives |
| 7 | National Emergency Council | Nationwide — oversee all data, declare emergencies |
| 8 | Super Administrator | System-wide — users, roles, AI configuration, audit logs |

---

## 6. Technology Stack

| Layer | Technology |
|---|---|
| Backend | Laravel (PHP 8.4) |
| Frontend | React 18, Inertia.js, Tailwind CSS |
| Database | SQLite (development), MySQL 8.0 InnoDB utf8mb4 (production) |
| AI | OpenRouter API with deterministic mock fallback |
| Maps | MapLibre GL JS, CARTO basemap, Philippines-locked bounds |
| Realtime | Laravel Echo broadcasting (outage and LGU-scoped channels) |
| Design system | eGovPH-aligned tokens: `#0040E7` primary, `#FCD116` flag yellow, `#CE1126` flag red, Lexend typography |

---

## 7. Impact

**For citizens** — outage visibility in seconds instead of hours; a single ticket ID with AI-estimated response times; transparent permit tracking that ends the "where is my application" problem.

**For LGUs** — an operations dashboard with AI-triaged queues, structured dispatch workflows, and response-time analytics; resources go where severity is highest, first.

**For national agencies** — DOE sees grid stress as it forms; DOLE publishes advisories to affected regions directly; NGCP and NDRRMC share the same operational picture, enabling coordinated load mitigation instead of phone-tree crisis management.

**For the public trust** — every verification, dispatch, permit decision, and role change is written to an immutable audit log. Government response becomes measurable: reports per hour, average response time, resolution rate — all visible on the public dashboard.

**Scalability** — the pilot covers Metro Manila and CALABARZON (10 LGUs seeded) and is architected to scale to all 1,600+ LGUs and every national energy agency without structural change.

---

## 8. Security

- Form-request validation on all inputs; Eloquent ORM throughout (SQL injection safe)
- Policy classes and scoped queries prevent IDOR — LGU staff can only act within their boundary
- Login throttling (5 attempts/minute); public API throttled (60 requests/minute); report submissions (10/minute)
- AI prompt-injection sanitization before any user content reaches the model; no PII sent to third-party AI services
- Audit logging of all critical actions with actor, entity, old/new values, and IP address
- GDPR-style data export per user; API keys stored exclusively in environment configuration

---

## 9. Getting Started

```bash
composer install
npm install
touch database/database.sqlite
php artisan migrate:fresh --seed
npm run build
php artisan serve
```

Optional: set `OPENROUTER_API_KEY` in `.env` to enable live AI analysis; without a key the platform runs on deterministic mock intelligence suitable for demonstrations.

Scheduled analytics: `php artisan ai:analyze-risk` (runs daily at 06:00 via the Laravel scheduler in production).

### Demonstration Accounts

Password for all accounts: `password`

| Role | Email |
|---|---|
| Super Administrator | admin@ewattph.gov |
| LGU Staff (Quezon City) | lgu.staff@quezoncity.gov.ph |
| LGU Administrator (Quezon City) | lgu.admin@quezoncity.gov.ph |
| Provincial Administrator (CALABARZON) | provincial@calabarzon.gov.ph |
| Agency Staff (DOE) | staff@doe.gov.ph |
| Agency Head (DOE) | head@doe.gov.ph |
| National Emergency Council | council@ndrrmc.gov.ph |
| Citizen | juan@example.com |

---

## 10. Project Structure

```
app/
├── Console/Commands/     ai:analyze-risk predictive engine
├── Events/               OutageReportUpdated broadcast event
├── Http/
│   ├── Controllers/      Auth, Citizen, LGU, Permits, Public API, Admin
│   ├── Middleware/       Role scoping, Inertia shared props
│   ├── Policies/         Outage and permit authorization
│   └── Requests/         Validated form requests
├── Models/               OutageReport, Permit, AiAnalysis, AuditLog, ...
└── Services/             OpenRouterService, OutageAiService,
                          PermitAiService, RiskAssessmentService
database/migrations/      Full relational schema (databaseRules.md)
resources/js/
├── Components/           MapView, Logo, Footer, NotificationBell
├── Layouts/              eGovPH-styled application shell
└── Pages/                Home, LiveMap, Reports, Permits, LGU, Admin, Auth
routes/web.php            Public, authenticated, and role-gated routes
```

---

<div align="center">

**eWattPH** — Empowering Governance with Intelligent Energy

Department of Energy · DICT · NextGenPH 2026

</div>
