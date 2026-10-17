# SkillBridge — Product Requirements Document (PRD)

> **Status:** Concept. "SkillBridge" is a placeholder name. No customers, results, or performance numbers exist. Do not invent any (in UI copy, seed data, README, or demos).
> **Version:** 0.1 (derived from the concept pitch deck)
> **Build target for now:** Phase 1 (MVP) only. Phases 2 and 3 are documented for context. Do not build them unless I say so.

---

## 0. HOW YOU (THE AGENT) MUST WORK WITH ME — READ FIRST

I want to steer this build closely. **Do not run long stretches on your own. Keep asking me for course correction.**

### Mandatory check-in rules
1. **Plan before code.** Before writing any code, post a short plan (stack, folder structure, data model, milestones) and **stop and wait for my approval**.
2. **Check in at every checkpoint** listed in Section 12. At each one, stop and report in this format:
   - **Done:** what was built since the last check-in
   - **Running/Demo:** how I can see it working (command, URL, or screenshot)
   - **Decisions you made:** any assumption or tradeoff
   - **Next:** what you plan to do next
   - **Questions / Options:** 2–3 concrete choices for me, with your recommendation
3. **Ask, don't assume,** when any of these come up (never silently decide):
   - Tech stack or hosting choices
   - Anything touching consent, privacy, scoring formulas, or fairness rules
   - Adding or removing a feature versus this PRD
   - Any third-party API, paid service, or new dependency
   - Anything ambiguous or contradictory in this document
4. **Small steps (DECIDED cadence).** Always stop at every checkpoint in Section 12, and also stop mid-checkpoint whenever a task passes about 1-2 hours or hits an ask-first trigger from rule 3. No single work session should span more than one checkpoint. If a task feels bigger than about 1–2 hours of work, split it and ask.
5. **Never expand scope.** If you have an idea not in this PRD, put it under "Suggestions" in your check-in. Do not build it.
6. **Be honest about status.** Say plainly what is mocked, stubbed, or broken. Do not call something "done" if it only works on fake data.
7. **After I give a correction,** restate it in one line, update the plan, and confirm before continuing.

---

## 1. Product Summary

SkillBridge is a planned platform that turns **verified coding skills into real career opportunities**. It combines alumni networking, smart referrals, verified skill-based hiring, bounties, and founder pods.

Tagline: *From verified skills to real career opportunities.*

### Core flow (3 phases)
1. **VERIFY:** student connects GitHub/coding data (with consent) → Code-DNA profile → Shadow-Intern sandbox task → scores.
2. **MATCH:** alumnus posts a flash referral → fairness gate → ranked top five → alumnus makes the final call.
3. **CONVERT:** recruiter reviews evidence → real work (bounties, task pods, triggers) → outcomes tracked → job, paid project, or startup.

---

## 2. Problem Statement

| Gap today | Effect |
|---|---|
| Unverifiable resumes | Claims are hard to check |
| Cold-DM overload | High effort, low response |
| Referral favoritism | The same few get picked |
| Hidden skills | Degrees do not show ability |
| No real project work | Few chances to build for clients |
| Alumni–student gap | Goodwill without structure |

---

## 3. Stakeholders / User Roles

| Role | What they get |
|---|---|
| **Student** | Skill evidence, referrals, paid projects, mentorship |
| **Alumni** | Relevant candidates, referral tracking, transparent reputation |
| **Recruiter** | Structured evidence, standard assessments, better matching |
| **Company** | Real-problem bounties and a vetted talent pool |
| **Founder** | Product feedback and access to student talent |

Each role gets its own dashboard and role-based access.

---

## 4. Goals and Non-Goals

### Goals
- Replace weak hiring signals with **evidence** (code activity, sandbox results).
- Make referrals **fairer** through rotation, cooldowns, and conflict flags.
- Keep **humans in the final decision** (alumnus refers, recruiter reviews).
- Be **consent-first** and **auditable** everywhere.

### Non-Goals (do NOT build or claim)
- Proving authorship of code or detecting AI usage. Activity data is *evidence for review*, not proof.
- Claiming the sandbox eliminates cheating. It only *reduces* the risk.
- Automated hiring or referral decisions with no human.
- Combining candidate scores with alumni scores (see the firewall in Section 6).
- Real customer data, real metrics, or fake testimonials or statistics.

---

## 5. Phased Scope

### Phase 1 — MVP (BUILD THIS)
- Authentication and role-based access. **Login (DECIDED): Sign in with Google.** Students must use their **college Google account** (check the account's email domain against the institution's `allowed_email_domains`; this is also how the college email is verified). **Alumni and recruiters, recommended default (pending my confirmation):** any Google account is accepted, since graduates and recruiters often lack a college account; alumni are then verified by LinkedIn or manual proof, and recruiters via the invite link. **Dashboards (DECIDED):** Student and Alumni are fully working; **Founder is an empty stub page** (route, role guard, "coming soon" placeholder, no features). **Recruiter is a stub plus ONE minimal feature (DECIDED): an outcome-confirmation page** where a recruiter or company user marks referral outcomes (see Section 7). Nothing else on the Recruiter dashboard in the MVP
- Consent flow and GitHub connection
- **Dynamic profile (Code-DNA)** built from GitHub data
- **Technology Skill Scores** (per technology)
- **Flash referrals** (alumnus posts, short-lived slot)
- Fairness gate and ranked top-five list
- **Alumni dashboard** (referrals, credibility score)
- Audit log of every score change

### Phase 2 — Validate (later, do not build yet)
Sandbox simulator (Shadow-Intern), Overall Merit Score, bounty pilot, audit tooling.

### Phase 3 — Expand (later, do not build yet)
Founder task pods, opportunity triggers, more integrations (coding platforms, company data).

> Note: the match formula uses sandbox performance, but the sandbox is Phase 2. **DECIDED for Phase 1:** use a **fixed placeholder sandbox value, identical for every candidate** (**DECIDED: 50 on the 0-100 scale**, stored in config as `sandbox_placeholder`, not hard-coded). Keep the original 0.45 / 0.35 / 0.20 weights. Because the value is the same for everyone, it does not change the ranking order, only the absolute match number. **Always label it in the UI and audit log as a placeholder** (e.g. "Sandbox score not available yet; placeholder used"), never present it as a measured result, and remove it automatically once real sandbox results exist in Phase 2.

---

## 6. Functional Requirements

### 6.1 Consent and data ingestion
- Nothing is ingested before **explicit, per-source consent**.
- The student can see what was collected, and can **revoke consent and delete data**.
- **GitHub data scope (DECIDED):** public repos by default; **private repos only if the student separately opts in** (its own consent record and its own revoke switch). Use the **least-privilege, read-only** GitHub access available (prefer a GitHub App with fine-grained read-only permissions over a broad OAuth `repo` scope, which would also grant write access). Store derived signals only (languages, libraries, activity counts, evidence links); **never store or display private source code**. Propose the exact approach at C2 and wait for my pick.
- Sources: **GitHub only in Phase 1 (DECIDED).** No manual project-link entry and no coding-platform integrations until I say so.

### 6.2 Code-DNA profile
- A **skill graph** built from coding evidence (languages, libraries, activity).
- Each skill links back to its evidence (repos, commits) so a reviewer can inspect it.
- Show a clear in-product disclaimer: *activity data is evidence for review, not proof of authorship or AI use.*

### 6.3 Shadow-Intern sandbox (Phase 2, spec for context)
- A **15-minute sandboxed debugging task**, isolated from the host and network.
- Output feeds the Technology Skill Score and the match score.
- Cheating risk is reduced, not removed. Say so in the UI.

### 6.4 Flash referrals
- **Flash referral form fields (DECIDED):** company, role title, required technologies, number of slots, description. Plus system/option fields already decided: expiry (default 7 days), a checkbox to also open it to other supported colleges, and the recruiter's email (creates the invite). Nothing else (no location, job type, or posting link) unless I ask.
- An alumnus posts a **short-lived referral slot** for an opportunity. **Default expiry: 7 days** (DECIDED; stored in config as `referral_expiry_days`). Expired slots close automatically.
- The system generates a **ranked top five**. The alumnus makes the **final decision**.
- Outcomes are tracked.

### 6.5 Fairness gate
A candidate is considered only if **all three** checks pass, otherwise they are skipped:
1. Eligible **and opted in**
2. A referral slot is **open**
3. Candidate is **outside cooldown**

**Cooldown (illustrative, configurable):** a candidate who receives N referrals enters a **7-day cooldown**. **DECIDED:** store `cooldown_trigger_count` (**default 2**) and `cooldown_days` (**default 7**) in config; the deck's "2 or 3" means N is adjustable.
Also: conflict flags and fair rotation to spread access.

### 6.6 Ranked matching
```
Match = 0.45 × CodeDNA + 0.35 × Sandbox + 0.20 × Fit
```
- CodeDNA = Code-DNA and library relevance
- Sandbox = sandbox performance
- Fit = academic and intent fit
- All inputs **normalized to a common scale**. **Weights must be configurable** (config file or admin setting), not hard-coded.

### 6.7 Recruiter review (Phase 2+)
Recruiters see structured evidence and review it as a human. No auto-reject.

### 6.8 Bounties, task pods, opportunity triggers (Phase 2–3)
Corporate bounties, founder task pods, and opt-in opportunity triggers. Not in the MVP.

### 6.9 Notifications
Basic notifications for referral posted, referral decision, outcome confirmed, and consent changes. **In-app only (DECIDED):** a notification center with unread count. **No email, SMS or push in the MVP.**

---

## 7. Scoring System — THREE SEPARATE SCORES, NEVER COMBINED

| # | Score | Formula / Rule | Used for |
|---|---|---|---|
| 1 | **Technology Skill Score** | (**Formula: Antigravity proposes a simple, transparent formula at C3 and I approve it before it is used.**) One score **per technology** (e.g. Python, C++), from Code-DNA evidence plus sandbox results in that technology. Range 0–100. | Role-specific matching and shortlisting |
| 2 | **Overall Merit Score** | `0.5 × Skills + 0.3 × Bounties + 0.2 × CGPA`, each input normalized to 0–100 first | Candidate ranking and shortlist order |
| 3 | **Alumni Credibility Score** | Starts at **100**. **+15** for a successful, appropriate referral. **−20** if a referral fails screening under a fair, evidence-based policy. (Illustrative.) | Transparent alumni reputation only. **Never** used for candidate ranking. |

### Safeguards (required)
- **Firewall:** candidate scores and alumni scores are never combined or cross-used.
- **Anti-favoritism:** fair rotation, cooldowns, conflict flags.
- **No unfair penalties:** evidence-based screening **with an appeal path**.
- **Reviewable:** every score change is logged **with its reason**.
- All numeric values above are **illustrative and configurable**.

> Phase 1 builds Score 1 and Score 3. Score 2 (Merit) needs bounties and CGPA, so it is Phase 2. Confirm with me before changing this.

---

## 8. Architecture (planned, nothing is built yet)

Layered, consent-first:

| Layer | Contents |
|---|---|
| **Presentation** | Student, Alumni, Recruiter, Founder dashboards |
| **Application services** | Dynamic profiles, skill and merit scoring, alumni credibility, recommendation engine, flash referrals, sandbox simulator, corporate bounties, task pods, opportunity triggers, notifications |
| **Integration** | GitHub and coding-platform APIs; company and opportunity data (planned) |
| **Data** | User profiles, skills and evidence, referral records, assessment results, bounty records, audit logs |
| **Security (all layers)** | Authentication, role-based access, user consent, privacy controls, sandbox isolation, secure API access, auditability |

**UI style (DECIDED):** clean and minimal, using **Tailwind CSS + shadcn/ui**. Responsive web, accessible by default, no custom design system.

**Alumni dashboard contents (DECIDED):** referrals posted (with status and expiry), the ranked top five per referral with the component scores, outcomes, and the credibility score with its change history (reasons shown). No extra stats or charts in the MVP.

**Hosting (DECIDED): run locally only for now.** No deployment work in the MVP. Provide a README with local setup (PostgreSQL via Docker or a local install, `.env.example`, Google and GitHub OAuth apps configured with localhost callback URLs). Keep the app deployable later (env-based config, no hard-coded URLs).

**Local Postgres:** Antigravity decides (Docker Compose or a local install); propose it in the C0 plan with the tradeoff.

**Demo data (DECIDED):** provide **labeled demo seed data** (fake students, alumni, recruiter, referrals) through a seed script. Every demo record must be clearly marked as demo (e.g. a `is_demo` flag and a visible "Demo" badge in the UI), must never look like real users or results, and must be separable from real accounts.

**Tech stack (DECIDED): Next.js + TypeScript + PostgreSQL.** In your C0 plan, propose the specifics (ORM such as Prisma or Drizzle, auth library, hosting, styling) with tradeoffs and **wait for my pick**. Prefer simple and free-tier-friendly.

---

## 9. Data Model (starting point; propose changes)

- `Institution` (id, name, allowed_email_domains) — **the MVP supports a few colleges (DECIDED)**, so every user belongs to one institution
- `User` (id, role, institution, email, consent flags)
- `Consent` (user, source, granted_at, revoked_at)
- `Profile` (user, summary)
- `SkillEvidence` (user, technology, evidence refs, source)
- `TechSkillScore` (user, technology, score, computed_at)
- `Referral` (alumnus, opportunity, status, expires_at, slots)
- `ReferralCandidate` (referral, candidate, rank, match_score, skipped_reason)
- `CooldownState` (candidate, referral_count, cooldown_until)
- `AlumniCredibility` (alumnus, score)
- `AuditLog` (actor, action, entity, before, after, **reason**, timestamp)
- `Appeal` (referral or score change, submitted_by, status)

---

## 10. Non-Functional Requirements

- **Privacy and consent:** collect the minimum, allow revoke and delete, never share beyond role permissions.
- **Security:** authentication, role-based access, secure API access, no secrets in the repo.
- **Auditability:** every score change and referral decision is logged with a reason.
- **Explainability:** every score and rank must be explainable in plain language (which inputs, which weights), **to the alumnus (for their candidates' ranking) and in the admin audit view**.
- **Alumni credibility visibility (DECIDED):** the Alumni Credibility Score is **visible to alumni, students and recruiters** (transparent reputation). It is still **never used in candidate ranking** and never combined with candidate scores (firewall).
- **Deletion and audit logs (DECIDED):** when a user deletes their data, delete all personal data and **keep audit entries in anonymized form** (replace the user reference with an irreversible pseudonym and strip names, emails and free text that could identify them). Audit entries must remain useful for fairness review.
- **Appeals (DECIDED):** the alumnus appeal for a -20 penalty is a **simple free-text appeal** reviewed by the admin. The admin decision (upheld or reversed, with a reason) is logged, and a reversal restores the points. No structured grounds in the MVP.
- **Student visibility (DECIDED):** a student sees **only their own Technology Skill Scores**, not match details, other candidates' data, or their rank. If the fairness gate skips them, they are shown only a **generic status** (e.g. "not eligible for this referral right now"), **never the specific reason** (such as the cooldown rule). The audit log still records the exact skip reason.
- **Honesty in the UI:** show the disclaimers about authorship, AI usage, and cheating risk.
- **Configurability:** weights, cooldown length, and credibility deltas live in config.
- **Testing:** unit tests for the fairness gate, match formula, score updates, and cooldown logic.

---

## 11. Success Metrics (KPIs to *measure*, not results)

- Referral conversion rate
- Assessment completion
- Time to shortlist
- Bounty completion
- Stakeholder retention

Instrument events so these can be measured later. **Do not display or fabricate values.**

---

## 12. Checkpoints — STOP AND ASK ME AT EACH

| # | Checkpoint | Stop and show me |
|---|---|---|
| **C0** | Plan | Stack options, folder structure, data model, milestone list. **No code until I approve.** |
| **C1** | Skeleton | Project runs, auth and roles working, empty dashboards |
| **C2** | Consent + GitHub | Consent screen, GitHub connect, revoke and delete working |
| **C3** | Code-DNA + Skill Scores | Profile and per-technology scores with evidence links. Show me the formula. |
| **C4** | Flash referrals + Fairness gate | Post a referral, gate logic, cooldown, ranked top five. Show test cases. |
| **C5** | Alumni dashboard + Credibility + Audit log | Score changes logged with reasons, appeal path stub |
| **C6** | MVP polish | Disclaimers, config for weights, tests passing, demo script |

---

## 13. Open Questions (ask me before assuming)

1. ~~Tech stack~~ **Resolved:** Next.js + TypeScript + Postgres. Still open: ORM, auth library, hosting.
2. ~~Phase 1 with no sandbox~~ **Resolved:** fixed labeled placeholder (default 50, configurable). Value confirmed as 50.
3. ~~How is "Fit" collected~~ **Resolved:** self-reported profile form with these fields (DECIDED): **college, branch/program, graduation year, CGPA, career intent (role types and domains)**. CGPA is **self-reported, not verified** in the MVP; label it as such wherever it is shown. **Fit score formula:** Antigravity proposes a simple, transparent formula at C4 (how these fields become a 0-100 Fit value for a given referral) and I approve it before use.
4. ~~Recruiter and Founder dashboards~~ **Resolved:** empty stubs in the MVP.
5. ~~"Eligible" candidate~~ **Resolved (confirmed):** a student is eligible if they (a) verified a college email, (b) opted in to referrals, (c) connected GitHub with consent, and (d) completed the Fit profile form. The alumnus may optionally narrow a specific referral by graduation year or program (stored per referral, off by default). Do not build further eligibility rules without asking me.
6. ~~Alumni verification~~ **Resolved:** LinkedIn or manual proof, reviewed before the alumnus can post referrals. **Approver (DECIDED):** a single `admin` role (me) with a minimal admin page listing pending alumni submissions, with approve/reject and a required reason, every decision written to the audit log. No automatic approval in the MVP. Ask me for the exact flow at C1/C2.
7. **Outcome decision (DECIDED):** a **recruiter or company confirms** whether a referral succeeded or failed screening, **via a minimal recruiter outcome page built in the MVP (DECIDED)**. That confirmation triggers the +15 / -20 credibility change, always logged with a reason, with the appeal path. **"Failed screening" definition (DECIDED, confirmed):** *Successful* = the referred candidate advances past initial screening (shortlisted or interviewed). *Failed* = rejected at initial screening **with a recruiter-selected reason from a fixed list that indicates the referral was inappropriate** (e.g. skills not matching the evidence, misrepresented evidence, not meeting the stated requirements). Rejection for any other reason (competition, headcount, later-stage rejection) is **neutral: no credibility change**, so alumni are not punished for ordinary hiring outcomes. One credibility change per referral. **Recruiter linking (DECIDED):** the alumnus enters the recruiter's email on the referral, which creates an **invite**; the recruiter signs up via that invite and is linked to that referral only (a recruiter sees only referrals they were invited to). **Invite delivery (DECIDED, confirmed):** since the MVP has no email sending, the app generates a one-time invite link that the alumnus copies and sends to the recruiter themselves; the link is tied to the entered email and expires (default 7 days, configurable).
7a. **Multi-college scope (DECIDED: a few colleges, seeded list; I add colleges manually, no college-management UI).** Referral reach, **DECIDED (confirmed):** a flash referral reaches students of the alumnus's **own college by default**, and the alumnus can tick one option, "also open to other supported colleges", per referral (a boolean on the referral, off by default). The fairness gate and cooldowns apply across colleges.
8. ~~Product name~~ **Resolved:** keep "SkillBridge" for now, as a single config constant so it can be renamed later.

---

## 14. Definition of Done (MVP)

- A student can consent, connect GitHub, and see a Code-DNA profile with per-technology scores and linked evidence.
- An alumnus can post a flash referral and see a ranked top five that respects the fairness gate and cooldowns, then make the final call.
- Alumni credibility updates correctly, and every score change appears in the audit log with a reason.
- Candidate scores and alumni scores are never combined.
- Required disclaimers are visible in the UI.
- Weights and policy values are configurable.
- Tests cover the gate, formula, cooldown, and score updates.
- No fake metrics or customers anywhere.
