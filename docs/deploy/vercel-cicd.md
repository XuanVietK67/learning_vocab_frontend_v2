# Deployment & CI/CD (Vercel + GitHub Actions)

This frontend is a server-rendered Next.js 16 app (it uses `next/headers`
cookies and server-side fetches — see [src/lib/api.ts](../../src/lib/api.ts)),
so it must run on a **Node.js runtime**, not a static host.

- **Deployment:** Vercel (native Next.js host) with push-to-deploy.
- **CI quality gates:** GitHub Actions — lint, type-check, build — in
  [.github/workflows/ci.yml](../../.github/workflows/ci.yml).
- **Backend:** NestJS on Railway, reached via `API_BASE_URL` (server-only).

---

## 1. CI — GitHub Actions

On every push to `master` and every PR, `ci.yml` runs:

```
npm ci  →  npm run lint  →  npm run type-check  →  npm run build
```

`type-check` (`tsc --noEmit`) was added to `package.json` for this. Nothing
to configure — it runs automatically once the workflow file is on `master`.

## 2. Deploy — Vercel

Vercel auto-detects Next.js; `vercel.json` only pins the framework and the
`sin1` (Singapore) region for lower latency from Vietnam.

### One-time setup

1. Go to <https://vercel.com> → sign in with GitHub.
2. **Add New → Project** → import `XuanVietK67/learning_vocab_frontend_v2`.
3. Framework preset: **Next.js** (auto-detected). Leave build/output defaults.
4. Add **Environment Variables** (Production + Preview), since `.env` is
   gitignored and never reaches Vercel:

   | Variable | Value | Notes |
   |---|---|---|
   | `API_BASE_URL` | `https://learningvocabbackend-production.up.railway.app` | server-only, no trailing slash |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-app>.vercel.app` | set after the first deploy gives you the URL |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `946218975594-…apps.googleusercontent.com` | public |
   | `NEXT_PUBLIC_GITHUB_CLIENT_ID` | *(if used)* | public |
   | `NEXT_PUBLIC_APPLE_SERVICES_ID` | *(if used)* | public |

5. **Deploy.** Vercel builds and gives you a `*.vercel.app` URL.
6. Set `NEXT_PUBLIC_APP_URL` to that URL and redeploy (it drives the OAuth
   `redirect_uri`).

### After setup — the CI/CD loop

- **Push to `master`** → Vercel builds & promotes to production.
- **Open a PR** → Vercel posts a unique **preview URL**; GitHub Actions runs
  the quality gates on the same PR.

### Google OAuth

In Google Cloud Console → the OAuth client, add to **Authorized redirect URIs**
(and JavaScript origins) the production URL **and** preview URLs you use, e.g.
`https://<your-app>.vercel.app`. Without this, Google sign-in fails in prod.

## 3. Notes

- The free **Hobby** plan covers a thesis-scale project.
- The backend stays on Railway; cross-origin is a non-issue because API calls
  are made server-side (see [src/lib/api.ts](../../src/lib/api.ts)).
- To make CI **block merges**, enable branch protection on `master` and mark
  the `verify` check as required (GitHub → Settings → Branches).
