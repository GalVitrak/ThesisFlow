# ThesisFlow – Academic Project & Thesis Management System

Live demo: `TBD`

ThesisFlow is a workflow-driven MVP for managing academic final projects and theses in Hebrew (RTL-first) with English support.

## Tech Stack

- Next.js 15 (App Router), React 19, TypeScript
- CSS Modules + `app/globals.css`
- Firebase Auth + Firestore (optional), with a full mock fallback mode
- Role-based UX: `student`, `supervisor`, `admin`, `examiner`

## Main Features

- Role dashboards with actionable cards and status visibility
- Proposal management + student application flow
- Supervisor review actions (approve/reject/request meeting)
- Milestone timeline and submission tracking
- Notifications + defense scheduling overview
- Admin configuration for faculties, milestones, and grading weights
- Demo guide and one-click role login shortcuts

## Demo Users

- Student: `student@test.com`
- Supervisor: `supervisor@test.com`
- Admin: `admin@test.com`
- Examiner: `examiner@test.com`
- Password (all users): `DemoPass123!`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` (defaults to `/he/...`).

### Windows / Turbopack fallback

If `next dev --turbopack` fails with `_buildManifest` / `ENOENT`:

```bash
npm run clean
npm run dev
```

If still unstable:

```bash
npm run dev:webpack
```

`npm run clean` runs `scripts/clean-next.mjs` and removes `.next`.

Branding asset used in the sidebar: `public/branding/hit-logo-50.jpg`.

## Main User Flows (Demo Script)

1. Sign in as student and review active project timeline
2. Apply to an open proposal from the proposals page
3. Sign in as supervisor and review pending applications
4. Track milestones/submissions and update review statuses
5. Sign in as admin and adjust grading weights to total 100%

## Firebase Setup and Deployment

1. Create a Firebase project and enable Auth (Email/Password) + Firestore
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_FIREBASE_*`
3. Set `NEXT_PUBLIC_USE_FIREBASE=true`
4. Ensure Firestore `users/{uid}` docs use Auth UID as the document ID
5. Deploy rules:

```bash
npm run firebase:login
npm run firebase:use
npm run firebase:deploy:rules
```

### Seed Firebase demo dataset

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json"
npm run seed:firestore
```

Optional:

- `SEED_USER_PASSWORD` overrides default demo password

### Deploy options

- Vercel: standard Next.js SSR deployment
- Firebase App Hosting (recommended for this repo): configure GitHub + env vars in Firebase console
- Firebase Hosting static export requires additional export setup in Next config

## Scripts

- `npm run dev` – dev server with Turbopack
- `npm run dev:webpack` – dev server without Turbopack
- `npm run clean` – remove `.next` cache
- `npm run lint` – ESLint
- `npm run build` / `npm run start` – production build/run
- `npm run seed:firestore` – seed Auth + Firestore demo data
- `npm run firebase:deploy:rules` – deploy Firestore security rules
- `npm run firebase:deploy:hosting` – deploy static hosting target (`out`)
