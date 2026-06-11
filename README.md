# Study Time Tracker

Full-stack study time tracker built with Next.js App Router, TypeScript, TailwindCSS, Drizzle ORM, and Neon PostgreSQL.

## Features

- Registration, login, logout, forgot/reset password, and authenticated password change
- HTTP-only JWT cookie sessions with `jose`
- Check-in/check-out study workflow with server-calculated durations
- Personal history with filters and audited session editing
- Personal stats with date-range filters and Recharts visualizations
- Private study groups with owner/admin/member roles
- Group-level stats and member comparison charts
- Dev-only seed endpoint and script

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Drizzle ORM + postgres-js
- Neon PostgreSQL
- bcryptjs
- jose
- Recharts
- Zod
- date-fns

## Environment

Create `.env.local` from `.env.example`.

Required:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `RESEND_API_KEY`
- `PASSWORD_RESET_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`

## Install

```bash
npm install
```

## Database

The app expects the conceptual schema from the spec. Drizzle schema lives in [src/db/schema.ts](/Volumes/Transcend/studytime/src/db/schema.ts:1).

To sync the schema:

```bash
npm run db:push
```

Notes:

- The existing Neon database in this workspace already contains related tables and views.
- `drizzle-kit push` may prompt because it detects existing constraints/views not represented in this codebase.
- The app assumes `citext` support is available in Postgres for case-insensitive username/email columns.

## Run locally

```bash
npm run dev
```

App URL:

- default local dev script: `npm run dev`
- default URL for this repo: `http://localhost:9792`
- the dev launcher will stop an existing stale Next dev process for this repo before starting

## Development seed

Script:

```bash
npm run db:seed
```

API route:

```bash
curl -X POST http://localhost:9792/api/dev/seed
```

Seeded credentials:

- `dung` / `password123`
- `lover` / `password123`
- Group: `Study Together`

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Set environment variables from `.env.example`.
4. Ensure `DATABASE_URL` points to your Neon production database.
5. Deploy with the default Next.js settings.

## Important SQL assumptions

- `users.username` and `users.email` are `citext`.
- `study_sessions.status` and `group_members.role` values match the enums in [src/db/schema.ts](/Volumes/Transcend/studytime/src/db/schema.ts:1).
- Group stats are grouped by `Asia/Bangkok`.
- Only users sharing a group should see each other’s stats.
