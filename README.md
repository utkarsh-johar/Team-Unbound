# SkillBridge

> From verified skills to real career opportunities.

SkillBridge is a platform that turns **verified coding skills into real career opportunities**. It combines alumni networking, smart referrals, verified skill-based hiring, and transparent reputation scoring.

## Features (MVP — Phase 1)

- **Google OAuth** authentication with role-based access (Student, Alumni, Recruiter, Founder)
- **Consent-first GitHub connection** — public repos by default, private repos with separate opt-in
- **Code-DNA Profile** — skill graph built from GitHub evidence (languages, libraries, activity)
- **Technology Skill Scores** — per-technology scores (0–100) with linked evidence
- **Flash Referrals** — short-lived referral slots posted by alumni with configurable expiry
- **Fairness Gate** — eligibility checks, cooldowns, conflict flags, and fair rotation
- **Ranked Top Five** — weighted matching (CodeDNA × 0.45 + Sandbox × 0.35 + Fit × 0.20)
- **Alumni Credibility Score** — transparent reputation, firewalled from candidate scores
- **Audit Logging** — every score change and referral decision logged with reason
- **In-app Notifications** — notification center with unread count
- **Recruiter Outcome Page** — confirm referral outcomes to update alumni credibility
- **Admin Panel** — verify alumni, review appeals

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Sequelize ORM |
| Auth | Passport.js (Google OAuth 2.0) |

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14 (local install or Docker)
- **Google OAuth App** (configured with `http://localhost:5000/api/auth/google/callback`)
- **GitHub OAuth App** (configured with `http://localhost:5000/api/github/callback`)

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/utkarsh-johar/Team-Unbound.git
cd Team-Unbound
```

### 2. Configure environment

Copy the example environment file and fill in your credentials:

```bash
cp backend/.env.example backend/.env
```

Required environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `SESSION_SECRET` | Express session secret (any random string) |

### 3. Install dependencies

```bash
npm run install:all
```

### 4. Set up the database

```bash
cd backend
npm run db:migrate
npm run seed        # Loads labeled demo data
```

### 5. Start development servers

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Demo Data

The seed script loads labeled demo data (fake students, alumni, referrals). All demo records:
- Have an `is_demo` flag set to `true`
- Display a visible **"Demo"** badge in the UI
- Are clearly distinguishable from real accounts

## Project Structure

```
SkillBridge/
├── backend/
│   ├── config/          # Database & app configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Auth & role guards
│   ├── models/          # Sequelize models
│   ├── routes/          # Express routes
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── context/     # React context providers
│       ├── hooks/       # Custom React hooks
│       └── pages/       # Page components
├── package.json         # Root scripts
└── README.md
```

## Disclaimers

- Activity data is **evidence for review**, not proof of authorship or AI use.
- The sandbox (Phase 2) **reduces** cheating risk but does not eliminate it.
- CGPA is **self-reported and not verified** in the MVP.
- All scoring weights and policy values are **configurable**.
- No real customer data, metrics, or testimonials exist. All data shown is demo/placeholder.

## License

Private — All rights reserved.
