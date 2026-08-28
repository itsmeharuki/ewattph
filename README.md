<div align="center">

<img src="public/images/ewattph-mark.svg" alt="eWattPH" width="140" />

# eWattPH

**National Energy Intelligence Platform for the Philippine Government**

*Empowering Governance with Intelligent Energy*

</div>

---

## Overview

eWattPH is a national-scale web platform that provides real-time power outage intelligence to the Philippine government. It connects citizens, local government units, national agencies, and the National Emergency Council into a single, transparent ecosystem built around one live national map of the power grid.

The platform answers the question: **"How might the government deliver essential services and improve its effectiveness amidst the national energy emergency situation?"**

**Key capabilities:**

- Crowdsourced outage reporting with GPS auto-location
- AI-driven severity scoring and predictive analytics
- Transparent permit tracking from submission to decision
- Multi-agency coordination with hierarchical role-based access
- Automatic brownout detection from social media and news sources

---

## Installation

### Prerequisites

| Software | Version | Source |
|----------|---------|--------|
| PHP | 8.2+ | https://php.net |
| Composer | Latest | https://getcomposer.org |
| Node.js | 18+ | https://nodejs.org |
| SQLite | Built-in with PHP | None required |

### Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd eWattPH

# 2. Install dependencies
composer install
npm install

# 3. Create database
touch database/database.sqlite

# 4. Configure environment
cp .env.example .env
php artisan key:generate

# 5. Run migrations and seed demo data
php artisan migrate:fresh --seed

# 6. Import Philippine LGU data (1,600+ cities/municipalities)
php artisan import:psgc

# 7. Build frontend assets
npm run build

# 8. Start development server
php artisan serve
```

Open **http://127.0.0.1:8000** in your browser.

---

## Demo Accounts

Password for all accounts: **`password`**

| Role | Email | Access Level |
|------|-------|--------------|
| Super Admin | `admin@ewattph.gov.ph` | System-wide user management and logs |
| National Emergency Council | `nec@ewattph.gov.ph` | Nationwide monitoring and emergency declaration |
| DOE Agency Head | `doe.secretary@ewattph.gov.ph` | Final permit approval and policy directives |
| DOE Agency Staff | `doe.staff@ewattph.gov.ph` | Permit review, advisories, national energy data |
| Provincial Admin | `governor.batangas@ewattph.gov.ph` | Cross-LGU coordination in Batangas |
| LGU Administrator (QC) | `qc.mayor@ewattph.gov.ph` | Final permit approval in Quezon City |
| LGU Staff (QC) | `qc.staff@ewattph.gov.ph` | Report verification, dispatch, permit review |
| Citizen | `citizen1@example.com` | Outage reporting and permit applications |
| Company | `solarcompany@example.com` | Business permit applications |

---

## Role Hierarchy

The system implements **9 roles** that mirror the Philippine government structure. Each role has strictly scoped access.

```
Super Admin
    System-wide access. Manages users, settings, and audit logs.
    Does NOT process permits or verify outage reports.

National Emergency Council
    Nationwide oversight. Declares emergencies and monitors all agencies.
    Does NOT process permits or verify individual reports.

Department of Energy (DOE)
    Agency Head -- Final approve/reject national permits, issue directives
    Agency Staff -- Review national permits, create advisories

Provincial Administrator
    Coordinates cross-LGU responses within a province.

Local Government Unit (LGU)
    LGU Admin (Mayor) -- Final approve/reject local permits
    LGU Staff -- Verify outage reports, dispatch teams, recommend permits

Citizen / Company
    Report outages, apply for permits, track applications.
```

---

## Brownout Report Flow

```
1. Citizen submits report
   GPS auto-detected. Photo optional. Status: PENDING.

2. AI analyzes the report
   Severity score (0-100). Probable cause. Suggested actions.

3. LGU Staff reviews
   Verifies report. Dispatches response team. Status: VERIFIED.

4. Resolution
   Power restored. Status: RESOLVED. Citizen notified.
```

---

## Permit Approval Flow

Permits follow a **two-step approval process** for accountability:

```
1. Applicant submits permit
   Status: SUBMITTED.

2. Staff reviews documents
   AI pre-screens for compliance. Staff recommends decision.
   Status: RECOMMENDED FOR APPROVAL or RECOMMENDED FOR REJECTION.

3. Administrator makes final decision
   Approves or rejects with documented reason.
   Status: APPROVED or REJECTED.

4. Applicant notified of decision.
```

**Approval authority:**

| Permit Type | Recommends | Final Decision |
|-------------|------------|----------------|
| Local (solar rooftop, building electrical) | LGU Staff | LGU Administrator |
| National (transmission lines, large solar farms) | DOE Agency Staff | DOE Agency Head |

---

## Automatic Detection

The system continuously scans social media platforms and news websites for brownout reports using web scraping. When a potential outage is detected:

1. AI extracts location and incident details from the post
2. Confidence score is calculated based on source reliability and content clarity
3. Incident appears on the live map as an auto-detected marker
4. High-confidence incidents are included in analytics and risk assessments

This enables real-time grid awareness even without direct citizen reports.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel (PHP 8.4) |
| Frontend | React 18, Inertia.js |
| Styling | Tailwind CSS |
| Database | SQLite (development), MySQL 8.0 (production) |
| AI Integration | OpenRouter API |
| Mapping | MapLibre GL JS |
| Design System | eGovPH-aligned UI tokens |

---

## Project Structure

```
eWattPH/
    app/
        Console/Commands/     Background tasks (AI analysis, data import)
        Http/Controllers/     API endpoints (Auth, Reports, Permits, Admin)
        Models/               Database models (User, Permit, OutageReport)
        Services/             Business logic (AI, notifications, metrics)
    database/
        migrations/           Database schema
        seeders/              Demo data (users, roles, LGUs)
    resources/js/
        Components/           Reusable UI components
        Layouts/              Application shell and navigation
        Pages/                All page views
    routes/web.php            Route definitions
```

---

## License

This project was developed for the **NextGenPH 2026 Innovation Contest** by the Development Academy of the Philippines (DAP).

---

<div align="center">

### Developed by

**John Joshua Manalo Escarez**

Mindoro State University -- Main Campus

---

*eWattPH -- Empowering Governance with Intelligent Energy*

</div>
