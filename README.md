# SkillBridge

> From verified skills to real career opportunities.

SkillBridge is a platform that turns **verified coding skills into real career opportunities**. It combines alumni networking, smart referrals, verified skill-based hiring, and transparent reputation scoring.

## Features (MVP — Phase 1)

- **Dual Scoring Architecture**:
  - **Overall Merit Score**: Composite ranking formula ($0.5 \times \text{Technology Skills Avg} + 0.3 \times \text{Phase 1 Baseline} + 0.2 \times \text{Normalized CGPA}$) displayed prominently with breakdown components.
  - **Technology Skill Scores**: Deterministic 0–100 scores calculated per indexed technology from repository count, commit history, and activity recency with clickable GitHub evidence links.
- **1-Click Demo Evaluation & Persona Switcher**: Instant evaluation buttons on the Login page and a live switcher in the top navigation bar to test **Student**, **Alumni**, **Recruiter**, and **Admin** flows without OAuth keys.
- **Consent-First GitHub Connection**: Public repositories by default, private repositories with separate opt-in; least-privilege access.
- **Code-DNA Profile**: Full visual skill breakdown with evidence links for review, disclaimer notices, and repository commits.
- **Flash Referrals**: Short-lived referral slots posted by alumni with countdown timer and eligibility filters.
- **Fairness Gate & Matching Engine**: Automated candidate qualification checking, cooldown tracking, and top-5 ranked candidate generation ($0.45 \times \text{Code-DNA} + 0.35 \times \text{Sandbox Placeholder} + 0.20 \times \text{Profile Fit}$).
- **Alumni Credibility Score**: Dynamic reputation system with full audit trail (+15 on successful hires, -20 on failed screening, 0 on neutral).
- **Recruiter Outcomes Flow**: Outcome submission interface with structured screening failure reasons.
- **Audit Logging & Notifications**: Complete activity log with before/after state diffs and in-app notification center.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Lucide Icons |
| Backend | Node.js + Express.js + Passport.js |
| Database | SQLite (Zero-config local fallback) / PostgreSQL (via Sequelize ORM) |
| Architecture | RESTful API with Session Cookies & Role-based Access Control |

## Prerequisites

- **Node.js** >= 18
- *(Optional)* **PostgreSQL** >= 14 (if not provided, automatically defaults to zero-config local SQLite database `skillbridge.sqlite`)

## Quick Start (Instant Demo)

```bash
# 1. Clone the repository
git clone https://github.com/utkarsh-johar/Team-Unbound.git
cd Team-Unbound

# 2. Install dependencies for both frontend and backend
npm run install:all

# 3. Seed demo database (students, alumni, referrals, scores)
cd backend
npm run seed
cd ..

# 4. Start frontend and backend concurrently
npm run dev
```

- **Frontend App:** http://localhost:5173
- **Backend API:** http://localhost:5000

On the login page ([http://localhost:5173/login](http://localhost:5173/login)), click any of the **1-Click Demo Buttons** (Student, Alumni, Recruiter, Admin) or use the persona switcher in the navigation bar.

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
