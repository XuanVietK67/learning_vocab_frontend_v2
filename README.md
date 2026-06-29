# Vocab — Learn vocabulary in context

Web frontend for **Vocab**, a vocabulary-learning platform that teaches words in
context through adaptive question drills, pronunciation scoring, and live AI
speaking practice. This is the **client app only** — it talks to a separate
NestJS backend over the documented `/v1` HTTP API and never touches the database
directly.

> Graduation thesis project (đồ án tốt nghiệp). The architecture is documented in
> [docs/api/frontend_architecture.md](docs/api/frontend_architecture.md).

## Features

- **Auth** — email/password login & registration, OTP email verification, and
  Google sign-in.
- **Onboarding** — first-run wizard to set the learner's native language and goals.
- **Learn** — adaptive question queue with many modes (flashcard, cloze MCQ/typing,
  dictation, image/listening choice, meaning-in-context, sense disambiguation,
  translation↔word, pronunciation), staged as a level ladder with audio feedback.
- **Practice** — focused write & speak drills over your own words.
- **Words & Decks** — create vocabulary (quick-add, manual form, bulk import) and
  organize it into decks.
- **Community** — publish decks and clone decks shared by others.
- **Speaking Room** — live AI conversation practice against authored scenarios.
- **Leaderboard, Profile & Settings** — stats, activity heatmap, and preferences.
- **Admin** — vocabulary, topic, user, and scenario management surface.

## Tech stack

| Concern    | Choice |
| ---------- | ------ |
| Framework  | [Next.js 16](https://nextjs.org) (App Router, server-first) |
| UI         | React 19 · TypeScript (strict) |
| Styling    | Tailwind CSS v4 (CSS-first, no `tailwind.config.js`) |
| Components | shadcn/ui on [Base UI](https://base-ui.com) primitives |
| Validation | zod v4 (shared client + server) |
| Misc       | `next-themes`, `sonner`, `lucide-react`, `input-otp` |

Most screens are **Server Components** that fetch on the server; all writes go
through **Server Actions**, so access/refresh tokens live only in httpOnly
cookies and never reach browser JS.

## Prerequisites

- **Node.js 20+** and npm
- A running instance of the **Vocab backend** (NestJS), reachable over HTTP. The
  frontend defaults to `http://localhost:3000` for the API.

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
```

Then edit `.env`:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `API_BASE_URL` | yes | Base URL of the NestJS backend (server-side only). Defaults to `http://localhost:3000`. In production use the deployed domain (https, no port, no trailing slash). |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | no | Google OAuth **Web** client ID for Google sign-in. Must match the backend's `GOOGLE_CLIENT_ID`; leave unset to hide the button gracefully. |
| `NEXT_PUBLIC_PRONUNCIATION_SUBMIT_ATTEMPT` | no | When `true`, the Learn pronunciation card commits a scored attempt for acoustic grading. Keep `false` until the backend grading change ships. |

## Usage

```bash
# Development (hot reload) — runs on port 3001
npm run dev

# Production build & serve
npm run build
npm run start
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

> The dev server uses port **3001** (the backend default is 3000). For Google
> sign-in in dev, add `http://localhost:3001` to the OAuth client's "Authorized
> JavaScript origins".

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Start the dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3001 |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Type-check with `tsc --noEmit` |

## Project structure

```
src/app/
  (auth)/       login, register, verify-email      — auth layout
  (app)/        dashboard, learn, practice, words,  — the learner experience
                decks, community, speaking,
                leaderboard, profile, settings, explore
  (admin)/      vocabulary / topic / user /         — admin-only surface
                scenario management
  onboarding/   first-run profile wizard
src/lib/        api client, auth/session, server actions, zod validations
src/components/ shared UI (marketing landing, primitives)
docs/           architecture, API contracts, and design context
```

Route groups (parenthesised folders) don't appear in the URL — they give each
area its own `layout.tsx` and guards. See
[docs/api/frontend_architecture.md](docs/api/frontend_architecture.md) for the
full architecture overview and screen→API mapping.

## Deployment

Deployed on Vercel via CI/CD. See
[docs/deploy/vercel-cicd.md](docs/deploy/vercel-cicd.md) and
[docs/api/production_api_base_url.md](docs/api/production_api_base_url.md) for the
production setup.
