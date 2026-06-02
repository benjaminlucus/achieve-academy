# Ravencrest Academy


##### *'Note for Hack Club Reviewer: The initial codebase structural setup and baseline error resolution were assisted by an AI editor. All subsequent features, business logic, and UI elements tracking toward my 35-hour goal are being typed completely by hand.'*

Tutoring marketplace MVP built with Next.js App Router, Clerk, and MongoDB. Supports student–tutor connections, trial messaging, manual payment verification (Pakistan MVP), and an admin verification workflow.

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Auth:** Clerk
- **Database:** MongoDB + Mongoose
- **Realtime:** Pusher
- **Email:** Resend

## Prerequisites

- Node.js 20+
- MongoDB instance
- Clerk application
- (Optional) Resend, Pusher, Sentry accounts

## Setup

1. Clone and install:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local` (see `.env.example` for all keys). **Never commit real secrets.**

4. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User roles

| Role | Flow |
|------|------|
| **Student** | Sign up → onboarding → dashboard → connect with tutors |
| **Tutor** | Sign up → onboarding → admin verification → dashboard |
| **Admin** | Sign up → onboarding with `ADMIN_ONBOARDING_PIN` → `/admin` |

## User status lifecycle

`applied` → `interview_scheduled` → `verified` | `blocked`

## Payment flow (manual MVP)

1. Student completes a session → pending `Payment` record is created.
2. Student submits payment proof via `/api/payments/verify` with `transactionId` + `sessionId`.
3. Server validates ownership, idempotency, and commission (20%).
4. `Connection.subscriptionStatus` is set to `active`.

Integrate a real payment provider (Stripe, JazzCash API, etc.) before scaling.

## Security

- All `/api/admin/*` routes require an authenticated **admin** user.
- Middleware requires Clerk auth for all `/api/*` routes.
- Payment verification is rate-limited and audit-logged.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## Production checklist

- Set strong `ADMIN_ONBOARDING_PIN`
- Use verified Resend domain (`RESEND_FROM_EMAIL`)
- Configure `SENTRY_DSN` for error monitoring
- Use MongoDB Atlas with IP allowlist
- Replace in-memory rate limiting with Redis/Upstash for multi-instance deploys

## Project structure

```
src/
  app/           # Routes (App Router)
  components/    # UI components
  database/      # Mongoose models + connection
  lib/           # Auth, payments, logging, utilities
  middleware.ts  # Clerk route protection
```
