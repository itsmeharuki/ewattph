<div align="center">

# eWattPH

**National Energy Intelligence Platform for the Philippine Government**

*Empowering Governance with Intelligent Energy*

</div>

---

## What is eWattPH?

eWattPH is a web application that helps the Philippine government respond faster during power outages. It connects citizens, local government units (LGUs), and national agencies into one platform with a live map of brownouts across the Philippines.

**Key features:**
- Citizens can report brownouts with GPS location
- LGU staff can verify and dispatch response teams
- DOE can track permits and issue advisories
- National Emergency Council can monitor everything in real-time
- AI automatically detects outages from social media and news

---

## How to Install

### Prerequisites

Make sure you have these installed on your computer:

| Software | Version | Download |
|----------|---------|----------|
| **PHP** | 8.2+ | https://php.net |
| **Composer** | Latest | https://getcomposer.org |
| **Node.js** | 18+ | https://nodejs.org |
| **SQLite** | Built-in with PHP | No download needed |

### Step-by-Step Installation

**1. Clone or download the project**
```bash
git clone <repository-url>
cd eWattPH
```

**2. Install PHP dependencies**
```bash
composer install
```

**3. Install JavaScript dependencies**
```bash
npm install
```

**4. Create the database**
```bash
touch database/database.sqlite
```

**5. Set up environment file**
```bash
cp .env.example .env
php artisan key:generate
```

**6. Run database migrations and seed demo data**
```bash
php artisan migrate:fresh --seed
```

**7. Import Philippine LGU data (1,600+ cities/municipalities)**
```bash
php artisan import:psgc
```

**8. Build the frontend**
```bash
npm run build
```

**9. Start the server**
```bash
php artisan serve
```

**10. Open your browser**
```
http://127.0.0.1:8000
```

That's it! The app is now running.

---

## How to Use (Login)

After installation, you can log in with these demo accounts. The password for all accounts is: **`password`**

| Role | Email | What they can do |
|------|-------|------------------|
| **Super Admin** | `admin@ewattph.gov.ph` | Manage users, system settings, view logs |
| **NEC** | `nec@ewattph.gov.ph` | Monitor entire Philippines, declare emergencies |
| **DOE Staff** | `doe.staff@ewattph.gov.ph` | Review permits, create advisories, view national data |
| **DOE Head** | `doe.secretary@ewattph.gov.ph` | Final approve/reject permits, issue directives |
| **LGU Staff (QC)** | `qc.staff@ewattph.gov.ph` | Verify brownout reports, dispatch teams in Quezon City |
| **LGU Admin (QC)** | `qc.mayor@ewattph.gov.ph` | Final approve permits in Quezon City |
| **Provincial Admin** | `governor.batangas@ewattph.gov.ph` | Coordinate across LGUs in Batangas |
| **Citizen** | `citizen1@example.com` | Report brownouts, apply for permits |
| **Company** | `solarcompany@example.com` | Apply for business/energy permits |

---

## How the Roles Work

eWattPH has **9 roles** that mirror the Philippine government structure. Each role has **specific permissions** — they can only see and do what their job requires.

### Role Hierarchy (Simple Explanation)

```
┌─────────────────────────────────────────────┐
│  👑 Super Admin                             │
│  System manager — creates accounts,         │
│  manages settings, views logs               │
├─────────────────────────────────────────────┤
│  🏛️ National Emergency Council (NEC)        │
│  Highest decision maker — sees everything   │
│  nationwide, can declare emergencies        │
├─────────────────────────────────────────────┤
│  ⚡ Department of Energy (DOE)               │
│  Agency Head — approves permits, issues     │
│  policies, coordinates nationally           │
│  Agency Staff — reviews permits, creates    │
│  advisories, monitors energy data           │
├─────────────────────────────────────────────┤
│  🏢 Provincial Admin                         │
│  Governor's office — coordinates across     │
│  multiple LGUs in a province                │
├─────────────────────────────────────────────┤
│  🏠 LGU (Local Government Unit)              │
│  LGU Admin (Mayor) — approves permits,      │
│  oversees local operations                  │
│  LGU Staff — verifies reports, dispatches   │
│  teams, processes permits                   │
├─────────────────────────────────────────────┤
│  👤 Citizen / Company                        │
│  Reports brownouts, applies for permits,    │
│  tracks own applications                    │
└─────────────────────────────────────────────┘
```

### Brownout Report Flow

Here's what happens when a citizen reports a brownout:

```
1. Citizen reports brownout
   → GPS location auto-detected
   → Photo uploaded (optional)
   → Status: PENDING

2. AI analyzes the report
   → Severity score (0-100)
   → Probable cause identified
   → Suggested actions

3. LGU Staff sees the report
   → Verifies it's real → Status: VERIFIED
   → Dispatches response team

4. Problem fixed
   → Status: RESOLVED
   → Citizen notified
   → Public map updated
```

### Permit Approval Flow (Two-Step Process)

Permits require **two people** to approve — this is for security and accountability:

```
1. Citizen/Company submits permit
   → Status: SUBMITTED

2. Staff reviews documents
   → AI checks completeness
   → Staff recommends approval or rejection
   → Status: RECOMMENDED FOR APPROVAL
              or RECOMMENDED FOR REJECTION

3. Admin/Head makes final decision
   → Approves → Status: APPROVED ✅
   → Rejects → Status: REJECTED ❌

4. Applicant notified of decision
```

**Who does what:**

| Permit Type | Staff (Recommends) | Admin/Head (Final Decision) |
|-------------|--------------------|-----------------------------|
| Local permits (solar rooftop, building) | LGU Staff | LGU Admin (Mayor) |
| National permits (transmission, large solar) | DOE Staff | DOE Head (Secretary) |

### What Each Role Sees

| Role | Dashboard Shows | Can Do |
|------|-----------------|--------|
| **Citizen** | Home, Map, Reports, Permits | Report outages, apply for permits |
| **LGU Staff** | LGU Dashboard with brownout reports + permits | Verify reports, dispatch teams, recommend permits |
| **LGU Admin** | LGU Dashboard with permits section | Final approve/reject local permits |
| **DOE Staff** | DOE Dashboard with national data + permits | Create advisories, recommend national permits |
| **DOE Head** | DOE Dashboard with permit approvals | Final approve/reject national permits |
| **NEC** | National overview of everything | Declare emergencies, monitor all agencies |
| **Super Admin** | Admin panel with user management | Create users, view logs, manage system |

---

## Automatic Brownout Detection

The system automatically scans social media (Twitter/X, Facebook) and news websites for brownout reports. When it finds one:

1. AI reads the post and extracts location + details
2. Confidence score is calculated (how sure we are it's a real outage)
3. It appears on the live map as an "Auto-Detected" marker
4. If confidence is high enough, it's included in analytics

This means even if nobody uses the app, the system can detect brownouts happening across the Philippines.

---

## Project Structure

```
eWattPH/
├── app/
│   ├── Console/Commands/     ← Background tasks (AI analysis, data import)
│   ├── Http/Controllers/     ← API endpoints (Auth, Reports, Permits, Admin)
│   ├── Models/               ← Database models (User, Permit, OutageReport)
│   └── Services/             ← Business logic (AI, notifications, metrics)
├── database/
│   ├── migrations/           ← Database structure
│   └── seeders/              ← Demo data (users, roles, LGUs)
├── resources/js/
│   ├── Components/           ← Reusable UI (Map, Logo, Footer)
│   ├── Layouts/              ← Page layout (navbar, sidebar)
│   └── Pages/                ← All pages (Home, Reports, Permits, Admin)
└── routes/web.php            ← All URL routes
```

---

## Tech Stack

| Part | Technology |
|------|------------|
| **Backend** | Laravel (PHP) |
| **Frontend** | React + Inertia.js |
| **Styling** | Tailwind CSS |
| **Database** | SQLite (dev) / MySQL (production) |
| **AI** | OpenRouter API |
| **Maps** | MapLibre GL JS |
| **Design** | eGovPH-style UI |

---

## Testing the App

**Quick test flow:**

1. Go to `http://127.0.0.1:8000`
2. Click **"Get Started"** to register as a citizen
3. Log in and go to **"Reports"** → click **"Use my current location"**
4. Submit a brownout report
5. Log out, then log in as **LGU Staff** (`qc.staff@ewattph.gov.ph`)
6. Go to **"LGU Dashboard"** → see the report → click **"I-verify"**
7. Log in as **LGU Admin** (`qc.mayor@ewattph.gov.ph`)
8. Go to **"LGU Dashboard"** → **"Permits"** tab → approve a permit

---

## License

This project was created for the **NextGenPH 2026 Innovation Contest** by the Development Academy of the Philippines (DAP).

---

<div align="center">

### Developed by

**John Joshua Manalo Escare**

Mindoro State University — Main Campus

---

**eWattPH** — Empowering Governance with Intelligent Energy ⚡🇵🇭

</div>
