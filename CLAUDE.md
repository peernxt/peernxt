# PeerNXT — Claude Code Context

## What this is
Study abroad marketplace for Indian students. Three user roles:
- **Students** — browse counsellors/ambassadors, book ₹299 peer sessions, community
- **Counsellors (Agents)** — paid subscription tiers (₹1L/2L/3L), manage student leads
- **Peer Ambassadors** — students currently abroad, earn money hosting ₹299 group sessions

Revenue: ₹299 student session fees (Razorpay) + counsellor subscriptions.

## Repo structure
```
peernxt/
├── peernxt backend/        Express + TypeScript + Supabase  (port 4000)
├── peernxt user frontend/  React + Vite + TailwindCSS       (port 3000)
└── peernxt admin frontend/ React + Vite                     (port 3002)
```

## Tech stack (actual — not the spec doc)
- **Backend**: Express (NOT NestJS), Supabase (NOT Prisma), Zod validation, JWT via Supabase
- **Frontend**: React + TypeScript + Vite + TailwindCSS + React Query
- **DB**: PostgreSQL via Supabase. Schema in `peernxt backend/supabase/migrations/`
- **Auth**: Supabase Auth — Google OAuth (students) + email/password (counsellors/ambassadors)

> The spec doc says NestJS + Prisma. Ignore it. Code uses Express + Supabase. Stay on that path.

## Running locally
```bash
# Backend
cd "peernxt backend" && npm run dev       # port 4000

# User frontend
cd "peernxt user frontend" && npm run dev  # port 3000

# Admin frontend
cd "peernxt admin frontend" && npm run dev # port 3002

# Or from root (all three):
npm run dev
```

## Environment setup
Copy `.env.example` to `.env` in each sub-project. Required vars:
- Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`
- Frontends: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`

## API prefix
All backend routes: `/api/v1/`

## Auth middleware
`requireAuth` in `peernxt backend/src/middleware/auth.ts` — verifies Supabase JWT.
`requireRole(...roles)` — role-based guard, use after `requireAuth`.

## Existing routes (backend)
- `/api/v1/users` — CRUD all roles
- `/api/v1/counselor-meetings` — book, list, get meetings
- `/api/v1/ambassador-slots` — create, book, cancel, list slots
- `/api/v1/chats` — basic REST chat + messages
- `/api/v1/events` — events + RSVP
- `/api/v1/admin` — admin panel operations

## 13-Week Roadmap (started ~2026-05-22)
### Phase 1 — Auth & Core Transaction (Wks 1–5)
- Redis/Upstash setup → OTP send/verify → phone login
- Razorpay ₹299 payment → webhook → transaction records
- **Goal: first real transaction by Week 4**

### Phase 2 — Ambassador Product (Wks 5–8)
- AWS S3 file uploads (profile pics + verification docs)
- Ambassador onboarding + verification
- 48h post-session chat window
- Ambassador earnings + payout request

### Phase 3 — Community & Real-Time DMs (Wks 8–11)
- Wire community feed to real API
- Community groups + trending topics
- Socket.io DMs (replace fake REST chat)

### Phase 4 — AI Chat (Wks 11–13)
- Claude API integration (POST /ai/chat)
- Per-user conversation memory
- Floating chat widget + lead capture handoff

### Notifications (distributed Wk 6–11)
- FCM push: payment events, session reminders, new DMs

### Deliberately out of scope (Phase 2 roadmap later)
Counsellor lead CRM, counsellor subscriptions, analytics, physical appointments,
cancellation engine, reviews & ratings, WhatsApp Business API.

## Day-1 external registrations (long approval times — start immediately)
- Razorpay merchant KYC: 3–7 days
- DLT SMS registration (for OTP): 7–14 days
- WhatsApp Business API template approval: 5–14 days

## Known issues / production blockers
- No payments at all (Razorpay not integrated)
- No phone OTP login (Indian market needs this — Google/email is wrong)
- No file uploads (S3 not wired)
- No real-time (Socket.io not added)
- AI chat absent entirely
- FCM push notifications not wired

## Security notes
- Debug telemetry (`fetch http://127.0.0.1:7754/ingest/...`) was removed from App.tsx on 2026-06-01
- `data/debug-cce85b.log` removed from git tracking on 2026-06-01
- `AUTH_BYPASS_ENABLED` flag (`VITE_SKIP_AUTH=true`) — never set true in production
