

## 1. `flow.md` — Detailed System Business Flow

```markdown
# eWattPH — System Business Flow

## 1. System Overview

**eWattPH** is a **national-scale** digital platform that provides real-time intelligence for the Philippine government during the energy emergency. It connects citizens, LGUs, national agencies, and the National Emergency Council into a single, transparent ecosystem. The system answers the question: *"How might the government deliver essential services and improve its effectiveness amidst the national energy emergency situation?"*

### Core Capabilities:
- **Crowdsourced Outage Reporting** – Any citizen can report power outages, creating a live map of the grid.
- **AI-Driven Predictive Analytics** – Uses OpenRouter AI to forecast outage hotspots and recommend actions.
- **Permit Tracking & Transparency** – Tracks energy-related permits (solar, transmission, etc.) from application to approval, with public visibility.
- **Multi-Agency Coordination** – Allows LGUs, DOE, DOLE, NGCP, and other agencies to share data and act in unison.
- **Public Dashboard** – Displays real-time status, government actions, and response metrics.

### Technology Stack:
- **Backend**: Laravel 11 (PHP 8.3)
- **Frontend**: React 18 with Inertia.js
- **Database**: MySQL 8.0 (InnoDB, utf8mb4)
- **AI**: OpenRouter API (models: `o1-mini`, `o1-pro`)
- **Maps**: MapLibre GL JS (national scope)
- **Notifications**: Push (via Laravel Echo/WebSockets), Email, SMS (optional)
- **Auth**: Laravel Sanctum (SPA) + Spatie Permission

---

## 2. User Roles & Hierarchical Access

The system adopts a **multi-level hierarchical role model** (9 roles) that reflects the Philippine government structure.

| Level | Role | Description | Scope | Permissions |
|-------|------|-------------|-------|-------------|
| 1 | **Citizen** | General public | Nationwide | View live map, report outages, track own reports, view public announcements |
| 2 | **LGU Staff** | Barangay / City / Municipal employees | Own LGU | Verify reports, dispatch teams, respond to alerts, process local permits |
| 3 | **LGU Administrator** | Mayor's Office / City Administrator | Own LGU | Approve high-priority dispatches, allocate local resources, oversee performance |
| 4 | **Provincial Administrator** | Governor's Office | Province | Coordinate cross-LGU responses, allocate provincial resources |
| 5 | **Agency Staff** | National agencies (DOE, DOLE, NGCP, DPWH, etc.) | Nationwide (own domain) | Monitor domain-specific data, approve permits, process national requests |
| 6 | **Agency Head** | Secretary / Director | Nationwide (own agency) | Approve policy, issue directives, report to higher councils |
| 7 | **National Emergency Council** | NDRRMC, Office of the President (OP) | Nationwide | Declare emergencies, activate national response plans, oversee all data |
| 8 | **Super Admin** | System Administrator | System-wide | Manage users, roles, AI configuration, system health, logs |

---

## 3. Detailed Business Flows

### 3.1 Citizen Outage Reporting

**Trigger**: A citizen experiences a power outage in their area.

**Steps**:
1. **Citizen** opens the eWattPH mobile app or web portal.
2. The app automatically loads the **live national map**.
3. Citizen taps the **"Report Outage"** button (floating action button on mobile).
4. **Location Detection**: The app uses GPS to auto-fill coordinates, or the citizen can select a location on the map.
5. **Details Entry**: Citizen provides a brief description (optional), uploads a photo (optional), and selects an outage type (e.g., transformer, line, etc.).
6. **Submission**: The report is sent to the backend API.
7. **Backend Process**:
   - The report is stored in `outage_reports` table with `status = 'pending'`.
   - A **WebSocket event** is broadcast to the relevant LGU dashboard (based on the location's administrative boundaries).
   - Simultaneously, the **AI Service** (OpenRouter) is invoked to analyze the report:
     - **AI Input**: Report data, recent reports in the same area (last 24h), grid load data (if available), weather conditions.
     - **AI Output**: Severity score (0-100), probable cause (e.g., transformer overload, line damage), suggested actions.
   - The AI output is attached to the report (`ai_metadata` JSON).
8. **Citizen receives**: Confirmation with a ticket ID and estimated response time (based on LGU SLA).
9. **LGU Staff receives**: A push/WebSocket notification with the new report and AI insights.
10. **Public Map Update**: After AI analysis (or after LGU verification), the report appears on the public map (with a marker color based on severity).

### 3.2 LGU Outage Management

**Trigger**: LGU staff receives a new report.

**Steps**:
1. **LGU Staff** logs in to their dashboard (scope: their LGU).
2. The dashboard displays a list of pending reports, filtered by severity and time.
3. Staff clicks on a report → full details (description, photo, map, AI analysis).
4. **Actions**:
   - **Verify**: If the report is legitimate, mark as `verified` → status updates to `verified`; public map shows a red marker.
   - **Dispatch**: Assign a response team (from LGU personnel) and optionally notify the local electric cooperative.
   - **Resolve**: Once power is restored, mark as `resolved` → public map changes to green.
5. **If escalated**: If the outage is large or requires external resources, the LGU Administrator can approve a request for provincial/national assistance.

### 3.3 Permit Tracking & Approval

**Trigger**: A citizen or developer submits a permit application (e.g., for solar installation, transmission line).

**Steps**:
1. **Applicant** navigates to the **Permit Application** page.
2. Uploads required documents (scanned papers, plans, certifications).
3. Selects the permit type and location.
4. Submits the application → stored in `permits` table with `status = 'submitted'`.
5. **AI Pre-screening**:
   - The AI automatically extracts key information from uploaded documents (OCR), checks for missing signatures, expired certificates, and completeness.
   - AI assigns a **compliance score** (0-100).
   - The application is routed to the appropriate department (e.g., Bureau of Fire, Engineering, DOE) based on type.
6. **Department Review**:
   - The assigned **Agency Staff** (or LGU Staff for local permits) reviews the application.
   - The system displays an **AI summary** that highlights potential issues (e.g., "This location is within a protected zone").
   - The staff can **approve** or **reject** with comments.
7. **Notification**:
   - Applicant is notified via email/push of the decision.
   - The permit status is visible on the **public dashboard** (permit tracker) with dates, so citizens can see the timeline.
8. **If national agency involved** (e.g., DOE for transmission line): The application is escalated to the **Agency Staff** of DOE, who may require further approval from the **Agency Head**.

### 3.4 AI Analytics Engine

**Objective**: Provide predictive insights to the government.

**Scheduled Tasks** (runs every 24 hours, or on-demand):

1. **Data Aggregation**:
   - Retrieve all `outage_reports` from the last 24 hours.
   - Retrieve `permits` statuses from the last 30 days.
   - Fetch weather data (via OpenWeather API) for major regions.
   - Fetch grid load data (mock data for prototype).
2. **Preprocessing**: Normalize data, remove duplicates, format JSON.
3. **AI Prompt** (sent to OpenRouter): A structured prompt containing the dataset and instructions:
   > "Analyze the provided data. Identify regions with high risk of outages in the next 48 hours. List predicted causes, recommended actions, and affected sectors. Output in JSON format."
4. **AI Response Parsing**: The response is parsed into a structured JSON object containing:
   - `risk_zones`: array of {region, province, risk_level, predicted_cause}
   - `recommended_actions`: array of strings
   - `affected_sectors`: array of strings
5. **Storage**: Save the analysis in `ai_analyses` table.
6. **Dashboard Updates**:
   - The public heatmap overlay is updated to show predicted risk zones (orange).
   - LGU dashboards display alerts for their region.
   - The **National Emergency Council** dashboard gets a summary of national risks.

### 3.5 Cross-Agency Coordination Flow

**Scenario**: Widespread outage in CALABARZON affecting industrial zones.

1. **Citizens** in multiple LGUs report outages → LGU dashboards filled.
2. **LGU Staff** in each municipality verify and dispatch local resources.
3. **LGU Admin** in Batangas realizes local resources are insufficient → requests provincial assistance.
4. **Provincial Admin** sees the aggregated demand → allocates provincial resources and notifies DOE.
5. **Agency Staff (DOE)** receives notification → checks grid load data → implements load shedding or prioritizes critical facilities.
6. **Agency Staff (DOLE)** sees that workplaces are affected → issues a work-from-home advisory via the eWattPH announcement system.
7. **Agency Head (DOE Secretary)** approves emergency power allocation for industrial zones.
8. **National Emergency Council** monitors the entire situation → potentially declares a localized state of calamity.
9. **Super Admin** ensures system stability; all actions are logged.

---

## 4. System Modules (Feature Breakdown)

| Module | Features |
|--------|----------|
| **Authentication** | Register, Login, Email Verification, Password Reset, Multi-factor (optional for admin) |
| **User Management** | Role assignment, LGU/Agency mapping, Profile management |
| **Outage Reporting** | Submit report, view own reports, location detection, photo upload |
| **Live Map** | National map, markers for outages (red=verified, yellow=pending, green=resolved), heatmap for risks |
| **LGU Dashboard** | List of reports (with filters), verification actions, dispatch management, response time tracking |
| **Permit Management** | Application submission, document upload, AI pre-screening, status tracking, public permit tracker |
| **Analytics & AI** | Risk heatmap, predictive analysis, AI summaries, exportable reports |
| **Notification** | Push (WebSocket), Email, SMS (optional), in-app notifications |
| **Public Dashboard** | Live map, permit tracker, response metrics, announcements |
| **Admin Panel** | User/role management, AI model settings, system health, logs |

---

## 5. Pilot Implementation Plan (for Competition)

To demonstrate feasibility, we propose a **pilot implementation** in Metro Manila (or a chosen province). The pilot will include:

- **A single LGU** (e.g., Quezon City) with full citizen and LGU staff features.
- **Mock AI integration** (using sample data) to showcase predictive analytics.
- **Public dashboard** available to demo.

This pilot will be scaled to the national level once approved.
```

---

## 2. `databaseRules.md` — MySQL Database Rules & Schema

```markdown
# eWattPH — MySQL Database Rules & Schema

## 1. General Conventions

- **Engine**: InnoDB (supports transactions, foreign keys).
- **Charset**: `utf8mb4` (full Unicode support).
- **Collation**: `utf8mb4_unicode_ci`.
- **Naming**: snake_case for tables and columns. Singular table names (e.g., `outage_report`).
- **Primary Keys**: `id` (BIGINT UNSIGNED AUTO_INCREMENT) unless specified.
- **Timestamps**: `created_at`, `updated_at` (Laravel default). Use `deleted_at` for soft deletes on key tables.
- **Foreign Keys**: Always define with `constrained()` and specify `onDelete`/`onUpdate`.

## 2. Table Design Principles

- **Normalisation**: 3NF.
- **Indexes**: Create indexes for columns used in `WHERE`, `JOIN`, `ORDER BY`, `GROUP BY`. Composite indexes for frequent queries.
- **JSON Columns**: For flexible AI metadata, but avoid for core queries.
- **Generated Columns**: Use for derived values (e.g., `severity_score` can be stored as generated column).
- **Caching**: Use Laravel Cache for heavy dashboard queries with TTL of 5 minutes.

## 3. Key Tables & Relationships

### users
| Field | Type | Notes |
|-------|------|-------|
| id | bigint | PK |
| name | string | |
| email | string | unique |
| password | string | hashed |
| email_verified_at | timestamp | nullable |
| role_id | foreignId | references `roles` |
| lgu_id | foreignId | nullable, references `lgus` |
| agency_id | foreignId | nullable, references `agencies` |
| created_at, updated_at | timestamps | |
| deleted_at | timestamp | nullable |

### roles
| id | bigint | PK |
| name | string | unique (citizen, lgu_staff, lgu_admin, provincial_admin, agency_staff, agency_head, national_council, super_admin) |
| description | text | |

### lgus
| id | bigint | PK |
| name | string | |
| province | string | |
| region | string | |
| latitude, longitude | decimal | |
| parent_id | foreignId | nullable, references `lgus` (for provincial level) |

### agencies
| id | bigint | PK |
| name | string | |
| abbreviation | string | e.g., DOE, DOLE |
| type | enum | national, regional |

### outage_reports
| id | bigint | PK |
| user_id | foreignId | references `users` |
| lgu_id | foreignId | references `lgus` (the LGU where the outage occurred) |
| latitude, longitude | decimal(10,7) | |
| description | text | nullable |
| photo_path | string | nullable |
| status | enum | pending, verified, resolved |
| ai_severity_score | unsignedTinyInteger | default 0 |
| ai_metadata | json | nullable |
| verified_by | foreignId | nullable, references `users` (LGU staff) |
| resolved_at | timestamp | nullable |
| created_at, updated_at | timestamps | |
| deleted_at | timestamp | nullable |

Indexes: `user_id`, `lgu_id`, `status`, `created_at`, composite (`lgu_id`, `status`, `created_at`).

### permits
| id | bigint | PK |
| applicant_id | foreignId | references `users` |
| lgu_id | foreignId | nullable, references `lgus` (for local permits) |
| agency_id | foreignId | nullable, references `agencies` (for national permits) |
| permit_type | enum | solar_rooftop, transmission_line, etc. |
| description | text | |
| documents | json | list of uploaded file paths |
| status | enum | submitted, in_review, approved, rejected |
| ai_compliance_score | unsignedTinyInteger | default 0 |
| ai_metadata | json | nullable |
| submitted_at | timestamp | |
| reviewed_by | foreignId | nullable, references `users` |
| reviewed_at | timestamp | nullable |
| decision_note | text | nullable |
| created_at, updated_at | timestamps | |
| deleted_at | timestamp | nullable |

Indexes: `applicant_id`, `lgu_id`, `agency_id`, `status`, `created_at`.

### permit_status_histories
| id | bigint | PK |
| permit_id | foreignId | references `permits` |
| old_status | enum | |
| new_status | enum | |
| user_id | foreignId | references `users` (who changed) |
| note | text | nullable |
| created_at | timestamp | |

### ai_analyses
| id | bigint | PK |
| type | enum | risk_assessment, permit_analysis |
| region | string | nullable |
| province | string | nullable |
| data | json | AI output |
| created_at | timestamp | |

### notifications
| id | bigint | PK |
| user_id | foreignId | references `users` |
| title | string | |
| message | text | |
| type | enum | push, email, in_app |
| read_at | timestamp | nullable |
| created_at | timestamp | |

### audit_logs
| id | bigint | PK |
| user_id | foreignId | references `users` |
| action | string | e.g., "outage_verified", "permit_approved" |
| entity_type | string | |
| entity_id | bigint | |
| old_values | json | nullable |
| new_values | json | nullable |
| ip_address | string | |
| created_at | timestamp | |

## 4. Sample Migration (Outage Report)

```php
Schema::create('outage_reports', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('lgu_id')->constrained('lgus')->onDelete('cascade');
    $table->decimal('latitude', 10, 7);
    $table->decimal('longitude', 10, 7);
    $table->text('description')->nullable();
    $table->string('photo_path')->nullable();
    $table->enum('status', ['pending', 'verified', 'resolved'])->default('pending');
    $table->unsignedTinyInteger('ai_severity_score')->default(0);
    $table->json('ai_metadata')->nullable();
    $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('resolved_at')->nullable();
    $table->timestamps();
    $table->softDeletes();

    $table->index(['lgu_id', 'status']);
    $table->index(['lgu_id', 'created_at']);
    $table->index('status');
});
```
```

---

## 3. `security.md` — Security Architecture

```markdown
# eWattPH — Security Architecture

## 1. Authentication & Authorisation

- **Laravel Sanctum** for SPA token-based authentication.
- Passwords hashed with **Argon2id** (or bcrypt).
- **MFA** (Google Authenticator) for admin and national council roles.
- **Role-based access control** via `spatie/laravel-permission`.
  - Each role has explicit permissions (e.g., `report_outage`, `verify_report`, `approve_permit`).
  - Scoped access: LGU staff only see data where `lgu_id = auth()->user()->lgu_id` (using query scopes).

## 2. API Security

- All endpoints protected (except public map data: `/api/public/map`).
- **Rate Limiting**:
  - Public endpoints: `throttle:60,1` per IP.
  - AI endpoints: `throttle:10,1` per user.
- **CORS**: Restrict to trusted domains.
- **Validation**: All inputs validated via Laravel Form Requests.
- **IDOR Protection**: Use `Policy` classes to check if user can access resource.

## 3. Data Protection

- **Encryption at Rest**: Sensitive fields (e.g., email, personal data) encrypted using Laravel's `Crypt` facade.
- **HTTPS Only**: Enforce SSL/TLS via middleware.
- **GDPR-like compliance**: Users can request data export/deletion.

## 4. AI Integration Security

- **API Key Storage**: In `.env`, never in code.
- **Prompt Injection Protection**: Sanitise user input before sending to AI.
- **Data Minimisation**: Send only necessary data (no PII) to OpenRouter.
- **AI Rate Limits**: Per user and per IP.

## 5. Logging & Monitoring

- **Audit Logs**: All critical actions (permit status change, outage verification, user role changes) logged in `audit_logs`.
- **Error Logging**: Use Laravel's logging with Sentry.
- **System Health Checks**: Scheduled jobs to verify uptime and API connectivity.

## 6. Common Threats & Mitigations

| Threat | Mitigation |
|--------|------------|
| SQL Injection | Eloquent ORM, prepared statements |
| XSS | React's automatic escaping; CSP headers |
| CSRF | Laravel's CSRF token in Inertia |
| Brute Force | Login throttling (5 attempts/min) |
| IDOR | Policies and scoped queries |
| Ransomware/Data Breach | Encryption, regular backups, least privilege |
| AI Abuse | Rate limiting, sanitisation, human review of AI outputs |
```

---

## 4. `uiux.md` — UI/UX Guidelines (Exact eGovPH Style)

```markdown
# eWattPH — UI/UX Guidelines (Exact eGovPH App Style)

## 1. Design Philosophy

**eWattPH** ay dapat magkaroon ng **exact visual design at user experience** na kapareho ng **eGovPH app** — ang official government super-app ng Pilipinas. Ang eGovPH app ay kilala sa **clean, modern, at "super-app" na UI/UX** na aligned sa global standards. Ito ang magbibigay sa eWattPH ng **pamilyar at mapagkakatiwalaang dating** para sa mga mamamayan.

### Core Design Principles:
- **Modern at Professional** – Pareho sa eGovPH app na may "clean, modern, and aligned with global super-app expectations".
- **Mobile-First** – Ang app ay dapat parang native mobile application.
- **Government-Trustworthy** – Nagpapakita ng credibility sa pamamagitan ng visual appeal at navigability.
- **User-Centered** – Pinapadali ang access sa government services.

---

## 2. Logo & Branding

### Logo Design (Exact eGovPH Style):
- **Circular Emblem** – Katulad ng eGovPH app logo, may concentric circles na may national motif sa gitna.
- **Center Icon** – Isang **lightning bolt** (kuryente) na naka-embed sa gitna ng sun rays, kumakatawan sa **energy intelligence**.
- **Color Scheme**:
  - **Primary Blue**: `#1E3A8A` (katulad ng eGovPH brand)
  - **Secondary Red**: `#CC0000` (nagpapakita ng urgency)
  - **Accent Gold**: `#F59E0B` (highlights at premium feel)
  - **Background**: `#FFFFFF` (puti, malinis)

### Tagline:
> *"Empowering Governance with Intelligent Energy"*

---

## 3. Color Palette (Exact eGovPH Style)

Ang eGovPH app ay gumagamit ng **clean, flat design** na may **consistent color system**. Narito ang mga kulay na gagamitin:

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Primary Blue** | `#1E3A8A` | Main headers, primary buttons, navigation |
| **Secondary Blue** | `#3B82F6` | Secondary buttons, links, active states |
| **Accent Gold** | `#F59E0B` | Highlights, notifications, warnings |
| **Success Green** | `#10B981` | Verified, resolved, positive status |
| **Danger Red** | `#EF4444` | Errors, urgent alerts, outage markers |
| **Background** | `#F8FAFC` | Page background (light gray-white) |
| **Card Background** | `#FFFFFF` | Content cards |
| **Text Primary** | `#1F2937` | Main text |
| **Text Secondary** | `#6B7280` | Muted text, descriptions |

### Semantic Colors (para sa status):

| Status | Color | Hex |
|--------|-------|-----|
| **Pending** | Yellow | `#F59E0B` |
| **Verified** | Red | `#EF4444` |
| **Resolved** | Green | `#10B981` |
| **In Review** | Blue | `#3B82F6` |
| **Approved** | Green | `#10B981` |
| **Rejected** | Red | `#EF4444` |

---

## 4. Typography

### Font Family:
- **Primary Font**: `Inter` – Modern, clean, at ginagamit sa eGovPH app.
- **Heading Font**: `Inter` (Bold 700) – para sa mga titles at headers.
- **Body Font**: `Inter` (Regular 400) – para sa content.
- **Mono Font**: `Roboto Mono` – para sa technical data at codes (kung kailangan).

### Font Sizes (Responsive):

| Element | Desktop | Mobile |
|---------|---------|--------|
| **H1 (Page Title)** | 32px | 24px |
| **H2 (Section Title)** | 24px | 20px |
| **H3 (Card Title)** | 20px | 18px |
| **H4 (Subtitle)** | 18px | 16px |
| **Body Text** | 16px | 14px |
| **Small Text** | 14px | 12px |
| **Button Text** | 14px | 14px |
| **Label** | 12px | 12px |

### Font Weights:
- **Bold (700)**: Headings, titles, emphasis
- **Semi-Bold (600)**: Subheadings, buttons
- **Medium (500)**: Labels, navigation
- **Regular (400)**: Body text, descriptions

---

## 5. Layout & Components (Exact eGovPH Style)

### 5.1 Home Dashboard (eGovPH Style)

Ang eGovPH app ay may **new Home Dashboard UI** na "cleaner and more modern". Kailangan gayahin ito:

**Structure:**
```
┌─────────────────────────────────┐
│  [Logo]  eWattPH        [🔔]   │  ← Header (sticky)
├─────────────────────────────────┤
│  ┌───────────────────────┐      │
│  │  Greeting: "Magandang  │      │
│  │  Araw, Juan!"         │      │
│  └───────────────────────┘      │
│  ┌───────────────────────┐      │
│  │  [Quick Actions]      │      │
│  │  [Report Outage]      │      │
│  │  [View Map]           │      │
│  │  [Permit Tracker]     │      │
│  └───────────────────────┘      │
│  ┌───────────────────────┐      │
│  │  [Live Status Card]   │      │
│  │  Power: ✅ 98%         │      │
│  │  Outages: 12          │      │
│  └───────────────────────┘      │
│  ┌───────────────────────┐      │
│  │  [Recent Announcements]│      │
│  │  • DOE: Load Shedding │      │
│  │    Schedule for May  │      │
│  └───────────────────────┘      │
├─────────────────────────────────┤
│  [Home] [Map] [Reports] [Profile]│  ← Bottom Nav (mobile)
└─────────────────────────────────┘
```

### 5.2 Search Functionality

Ang eGovPH app ay may **"Search Services" feature** na nagbibigay ng "quickly search and access eGovPH services anytime for faster and more convenient navigation". Kailangan ito sa eWattPH:

- **Search Bar** sa header (desktop) at sa home page (mobile).
- **Filter by Category**: Outages, Permits, Agencies, Announcements.
- **Recent Searches** – automatic na naka-display.

### 5.3 Notification System

Ang eGovPH app ay may **notification bell** sa home page at may **In-App Notification History** na may "sleek new interface":

- **Notification Bell** – Icons sa header (desktop at mobile).
- **Notification History UI** – Listahan ng mga notifications:
  - **Unread** – May solid blue dot marker.
  - **Read** – Naka-fade.
- **Notification Categories**:
  - **Alerts** – Emergency, outages.
  - **Updates** – Permit status, government advisories.
  - **System** – App updates.

### 5.4 Settings Page

Ang eGovPH app ay may **Settings Page with Push Notification Toggle**:

- **Push Notification Toggle** – On/Off switch.
- **Account Settings**:
  - Profile editing.
  - Change Email.
  - Language preference (Filipino/English).
- **Privacy Settings** – Data control.
- **App Version** – Info.

### 5.5 Profile / Digital ID UI

Ang eGovPH app ay may **enhanced Profile Page** na may "ID Slider" at "Enlarged QR Code":

- **Profile Page** – May avatar, name, verified status.
- **Wallet ID** – Slider para sa ID cards.
- **QR Code** – Pwedeng i-scan.
- **Verified Users Only** – Features na available lang sa verified users.

### 5.6 Service Listings (NGAs & LGUs)

Ang eGovPH app ay may **"Browse National Government Agencies by Category or by Agencies with an improved listing interface"**:

- **Agency List** – May category filter (Health, Energy, Labor, etc.).
- **LGU List** – May "Your LGU" at "Other LGUs" section.
- **Card Design** – May icon, name, description, at "Open" button.

---

## 6. Component Library

### 6.1 Buttons

| Type | Style | Hex | Border Radius | Height |
|------|-------|-----|---------------|--------|
| **Primary** | Solid Blue | `#1E3A8A` | 8px | 48px |
| **Secondary** | Outline Blue | `#3B82F6` | 8px | 48px |
| **Danger** | Solid Red | `#EF4444` | 8px | 48px |
| **Success** | Solid Green | `#10B981` | 8px | 48px |
| **Ghost** | Transparent w/ Blue text | `#3B82F6` | 8px | 48px |

### 6.2 Cards

- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `12px`
- **Shadow**: `0 1px 3px rgba(0,0,0,0.1)`
- **Padding**: `16px`

### 6.3 Forms

- **Input Fields**:
  - Height: `48px`
  - Border: `1px solid #D1D5DB`
  - Border Radius: `8px`
  - Focus: `2px solid #3B82F6`
  - Background: `#FFFFFF`
- **Labels**: `14px`, `#6B7280`, `500` weight.
- **Dropdowns**: Katulad ng input field, may arrow icon.

### 6.4 Modal / Dialog

- **Background Overlay**: `rgba(0,0,0,0.5)`
- **Content Box**: `#FFFFFF`, `rounded-2xl`, `shadow-xl`.
- **Close Button**: `X` icon, top-right.

### 6.5 Toast / Snackbar

- **Success**: Green background, white text.
- **Error**: Red background, white text.
- **Info**: Blue background, white text.
- **Position**: Bottom center (mobile), top right (desktop).

---

## 7. Mobile Native Feel

Ang eGovPH app ay optimized para sa mobile. Kailangan gawin ito sa eWattPH:

### 7.1 Bottom Navigation Bar

- **Icons**: 4 na pangunahing icons.
- **Active State**: May highlight (blue background with rounded top).
- **Icons**:
  - **Home**: House icon.
  - **Map**: Map pin icon.
  - **Reports**: Document icon.
  - **Profile**: User icon.

### 7.2 Pull-to-Refresh

- Sa map at dashboard, may pull-to-refresh para ma-update ang data.
- May loading indicator.

### 7.3 Smooth Transitions

- Gamit ang **Framer Motion** para sa page transitions.
- **Fade In / Slide Up** – para sa modals.
- **Slide Left / Right** – para sa page navigation.

### 7.4 Touch Targets

- Minimum **44×44px** para sa lahat ng interactive elements.
- May feedback (ripple effect) kapag naka-tap.

---

## 8. Accessibility & Inclusivity

### 8.1 Contrast Ratios

- **Text**: `#1F2937` sa `#FFFFFF` background → **Contrast Ratio 15.2:1** (AAA).
- **Muted Text**: `#6B7280` sa `#FFFFFF` background → **Contrast Ratio 4.6:1** (AA).
- **Primary Button**: White text sa `#1E3A8A` → **Contrast Ratio 8.4:1** (AAA).

### 8.2 Keyboard Navigation

- Lahat ng interactive elements ay accessible via keyboard.
- **Focus States**: May visible blue outline (`#3B82F6`).
- **Tab Order**: Logical na pagsunod-sunod.

### 8.3 Alt Text

- Ang lahat ng images at icons ay may descriptive alt text.
- Para sa mapa, may text description ng current location.

### 8.4 Language Support

- **Toggle**: Filipino (Tagalog) at English.
- **Defaults**: English, pero pwede i-switch sa Filipino.

---

## 9. Technical Implementation

### 9.1 CSS Framework

- **Tailwind CSS** – Para sa rapid development.
- **Custom CSS Variables** – Para sa consistent design tokens.

### 9.2 React Components

```jsx
// Example: NotificationBell.jsx
import { Bell, Check } from 'lucide-react';

export default function NotificationBell({ count, unread }) {
  return (
    <button className="relative p-2 rounded-full hover:bg-gray-100">
      <Bell className="w-5 h-5 text-gray-600" />
      {count > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
```

### 9.3 Map Integration

- **MapLibre GL JS** – Interactive national map.
- **Style**: Katulad ng eGovPH app na may clean, minimal style.
- **Markers**:
  - **Outage**: Red dot marker.
  - **Resolved**: Green dot marker.
  - **Risk Zone**: Yellow/orange heatmap.

---

## 10. Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-primary: #1E3A8A;
  --color-secondary: #3B82F6;
  --color-accent: #F59E0B;
  --color-success: #10B981;
  --color-danger: #EF4444;
  --color-background: #F8FAFC;
  --color-card: #FFFFFF;
  --color-text: #1F2937;
  --color-text-muted: #6B7280;

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

---

## 11. Conclusion

Ang **uiux.md** na ito ay nagbibigay ng kumpletong blueprint para i-replicate ang **exact UI/UX style ng eGovPH app** sa eWattPH. Sa pamamagitan ng:

- **Paggamit ng parehong color palette at typography**
- **Pagsunod sa parehong layout patterns at component styles**
- **Pag-integrate ng eGovPH features** (notification bell, search, settings, profile)

Ang eWattPH ay magiging **pamilyar, mapagkakatiwalaan, at modern** para sa mga Filipino citizens at government officials.
```

---

## 📥 How to Use

1. Copy the content of each code block.
2. Save them as separate `.md` files:
   - `flow.md`
   - `databaseRules.md`
   - `security.md`
   - `uiux.md`
3. Place them in your project root or a `docs/` folder.

These documents are now ready for your AI agent or development team to implement the system accurately. Good luck with your NextGenPH 2026 entry! 🇵🇭⚡