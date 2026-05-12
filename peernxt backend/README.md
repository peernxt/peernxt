# PeerNXT Backend

Production-ready Node.js API for the PeerNXT study-abroad platform.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express + TypeScript
- **Database / Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Validation:** Zod
- **Meeting links:** Google Calendar API (Google Meet)

## Setup

1. **Install dependencies**
   ```bash
   cd backend && npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - In **Project Settings → API**: copy **Project URL**, **service_role** key, and **JWT Secret**
   - Run the schema: **SQL Editor** → paste and run `supabase/migrations/001_initial.sql`

3. **Environment**
   - Copy `.env.example` to `.env`
   - Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`
   - Optional: `GOOGLE_CALENDAR_CREDENTIALS` for real Google Meet links; Resend/SMTP and WhatsApp for notifications

4. **Run**
   ```bash
   npm run dev    # development with tsx watch
   npm run build && npm start   # production
   ```

## API Overview

Base path: `/api/v1` (configurable via `API_PREFIX`).

**Auth:** Send Supabase access token (from `supabase.auth.getSession()` or similar) in header:
- `Authorization: Bearer <access_token>` or
- `X-Supabase-Auth-Token: <access_token>`

User role is resolved from the `users` table (column `role`). Create user rows via `POST /api/v1/users/me` (student self-register) or `POST /api/v1/users` (agent/ambassador, with body `{ uid, role, email, displayName, profile }`). Use the Supabase Auth user id as `uid`.

### Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/health` | - | Health check |
| GET | `/users/me` | * | Current user profile |
| POST | `/users/me` | * | Student self-register (create profile after Supabase sign-up) |
| PUT | `/users/me` | * | Update own profile |
| GET | `/users?role=agent` | * | List agents |
| GET | `/users?role=ambassador` | * | List ambassadors |
| GET | `/users/:userId` | * | Get user by ID |
| POST | `/users` | agent/ambassador | Create user (e.g. after Supabase sign-up) |
| POST | `/counselor-meetings/book` | student | Book free counselor meeting → creates chat + Meet link in chat |
| GET | `/counselor-meetings/me` | * | My counselor meetings |
| GET | `/counselor-meetings/:meetingId` | * | Meeting detail (if participant) |
| POST | `/ambassador-slots/slots` | ambassador | Create group slot (max 10 students) |
| GET | `/ambassador-slots/slots/open` | * | List open slots (query: `ambassadorId`, `from`, `to`) |
| GET | `/ambassador-slots/slots/me` | ambassador | My slots |
| GET | `/ambassador-slots/slots/:slotId` | * | Slot detail |
| GET | `/ambassador-slots/slots/:slotId/bookings` | ambassador | Bookings for slot |
| POST | `/ambassador-slots/book` | student | Book seat → sends link via WhatsApp + email |
| GET | `/ambassador-slots/bookings/me` | student | My ambassador bookings |
| GET | `/chats` | * | My chats (counselor only) |
| GET | `/chats/:chatId` | * | Chat detail |
| GET | `/chats/:chatId/messages` | * | Messages |
| POST | `/chats/:chatId/messages` | * | Send message |
| GET | `/events` | - | Upcoming events |
| GET | `/events/:eventId` | - | Event detail |
| POST | `/events` | agent | Create event |
| GET | `/events/agent/:agentId` | - | Events by agent |
| POST | `/events/:eventId/rsvp` | student | RSVP |
| DELETE | `/events/:eventId/rsvp` | student | Cancel RSVP |
| GET | `/events/:eventId/rsvps` | agent | List RSVPs |
| GET | `/events/rsvps/me` | student | My RSVPs |

## Behavior

- **Counselor meetings:** On book, a 1:1 chat is created and the Google Meet link is posted in that chat. Students and counselors use the in-app chat for the link.
- **Ambassador slots:** One Meet link per slot. When a student books, the link is sent via **email** and **WhatsApp** (if configured) with date/time. No group chat per slot; ambassador sees the link on the slot detail screen.

## License

Proprietary – PeerNXT.
