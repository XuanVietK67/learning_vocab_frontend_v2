---
name: frontend
description: Conventions for this production Next.js 16 + React 19 + Tailwind v4 + shadcn/ui frontend. Use whenever creating or editing components, routes (app/), styling, data fetching, mutations, forms, error/loading states, tests, or any frontend code in this repo.
---

# Frontend conventions (this repo)

Production-grade Next.js frontend. Follow these rules unless a task explicitly
overrides them. They override stale training-data defaults (especially Tailwind v3).

## This project's pinned setup (verify, don't assume)

- **Next.js 16.x**, App Router only. The Pages Router is in maintenance — never use it for new code.
- **React 19**, **TypeScript** strict mode.
- **Tailwind CSS v4** — CSS-first config, **no `tailwind.config.js`**.
- **shadcn/ui** — current CLI, Tailwind v4 / OKLCH theming (add via CLI when first needed).
- **Package manager: `npm`** (repo has `package-lock.json`). Use `npm`, not pnpm/yarn — do not introduce a second lockfile.
- **`src/` directory layout**: code lives under `src/`. Import alias **`@/*` → `./src/*`** (`tsconfig.json`). Never use deep relative `../../../` paths.

> **Before writing Next.js code, read the relevant local guide** under
> [node_modules/next/dist/docs/01-app/](node_modules/next/dist/docs/01-app/)
> (per [AGENTS.md](../../../AGENTS.md)). APIs in Next 16 may differ from training data —
> the local docs are the source of truth. Heed deprecation notices.

## 1. Structure & file conventions

- `src/app/` — routes only (App Router special files).
- `src/components/ui/` — shadcn primitives (CLI-managed, low-churn).
- `src/components/` — your own composed/shared components.
- `src/lib/` — utilities, clients, helpers (`src/lib/utils.ts` holds `cn()`).
- `src/hooks/` — shared React hooks.
- **Colocate** route-specific components/hooks inside their route folder. Only promote
  to `src/components/` / `src/hooks/` when shared across routes.

App Router special files: `layout.tsx` (persistent UI), `page.tsx` (route UI),
`loading.tsx` (pending fallback), `error.tsx` (segment error boundary — **Client
Component**), `not-found.tsx` (404, pairs with `notFound()`), `route.ts` (handler:
export `GET`/`POST`/…).

## 2. Server vs Client Components (highest-value rule)

- **Default to Server Components.** Add `"use client"` only when the component needs
  state, effects, event handlers, or browser-only APIs.
- Push `"use client"` to the **leaf**. Keep pages/layouts as Server Components; isolate
  interactivity into small client components.
- Fetch on the server, pass plain serializable data down as props.
- **Never** put secrets/tokens/server-only logic in a Client Component.

## 3. TypeScript

- `strict: true`. No `any` — use `unknown` + narrowing. Explicit return types on exported functions.
- `interface` for extendable object/prop shapes; `type` for unions/composition. Be consistent.
- Derive types from one source of truth (e.g. `z.infer` from Zod schemas) — don't hand-duplicate.

## 4. Styling — Tailwind CSS v4

- Entry point is one line: `@import "tailwindcss";` (in `src/app/globals.css`).
- Define design tokens (colors, fonts, spacing) in CSS with `@theme` — not a JS config.
- Use `@tailwindcss/postcss`. **No `autoprefixer`** — Lightning CSS handles prefixing.
- Prefer theme tokens over hardcoded/arbitrary values (avoid `w-[437px]` unless truly one-off).
- Merge classes with the `cn()` helper (clsx + tailwind-merge). Never concatenate class strings by hand.
- Enforce ordering with `prettier-plugin-tailwindcss`. No inline `style={}` except truly dynamic runtime values.

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.62 0.19 256);
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

## 5. UI components — shadcn/ui

- shadcn copies source **into the repo** — you own it. Install primitives via the CLI into
  `src/components/ui/`; do not hand-write them. Initialize with `shadcn init`.
- Treat `src/components/ui/` as low-churn — re-running the CLI **overwrites** it. Put
  customizations in wrapper components in `src/components/`, not in the primitives.
- Build variants with `cva` (class-variance-authority), not conditional class soup.
- Lean on Radix accessibility primitives instead of rolling your own.

## 6. Data fetching, mutations & state

- **Reads:** fetch in Server Components. Set `fetch` cache / `unstable_cache` / revalidation deliberately.
- **Writes:** Server Actions for mutations; revalidate affected paths/tags after success.
- **State priority:** local → URL (search params) → light global store (Zustand) **only when justified**.
  Don't reach for global state by default.

## 7. Forms & validation

- `react-hook-form` + `zod`. One Zod schema per form, shared between client validation and the
  Server Action — **always re-validate on the server**. Use shadcn's `Form` components for accessible wiring.

## 8. Performance

- `next/image` for images, `next/font` for fonts. `next/dynamic` for heavy client-only components.
- Favor Server Components + streaming (`<Suspense>`) to minimize client JS. Audit `"use client"` usage.

## 9. Error handling (App Router layered model)

- `error.tsx` (Client Component, gets `error` + `reset()`) catches segment errors — place at
  segment level so one failure doesn't blank the app. `global-error.tsx` catches root-layout
  failures (renders its own `<html>`/`<body>`). `not-found.tsx` pairs with `notFound()`.
- **Expected** failures (validation, "email taken", missing record) → return typed result values
  (e.g. Server Action returns `{ success: false, error: "..." }`) and render in UI. **Do not throw.**
- **Unexpected** failures → throw; let the nearest error boundary catch them.
- Validate inputs with Zod at the top of every Server Action; wrap real side effects in try/catch.
- Never leak raw errors/stack traces to the client. Wire unexpected errors to observability (e.g. Sentry).
- Pair every async boundary with `loading.tsx` or `<Suspense>` — handle pending and failure, not just happy path.

## 10. Testing

- **Vitest + React Testing Library** — Server Actions, Zod schemas, utilities, and **synchronous** components.
- **Playwright** — async Server Components, auth flows, full user journeys. (Vitest can't render async Server Components.)
- Playwright: run against the **production build**; prefer role/label/`data-testid` selectors; mock network at the
  boundary; reuse authenticated state.
- Coverage: unit-test logic/pure functions thoroughly; integration-test data access/route handlers; keep
  ~20–30 E2E tests on paths where failure costs money. CI gates sequentially (unit → integration → E2E).

## 11. Code quality & tooling

- ESLint (Next.js config) + Prettier + `prettier-plugin-tailwindcss`. `husky` + `lint-staged` on commit.
- Type-check is a required CI gate (`tsc --noEmit`). Per global rules: run type-check + lint before committing;
  never `--no-verify`; never commit `.env`/secrets.

## 12. Naming

- Files `kebab-case` (`user-card.tsx`) · Components `PascalCase` · functions/vars `camelCase` ·
  constants `SCREAMING_SNAKE_CASE` · hooks `useThing`.

## 13. Keeping current

Next.js publishes a docs index at `/docs/llms.txt`; the full docs are vendored locally under
[node_modules/next/dist/docs/](node_modules/next/dist/docs/). Read those before relying on memory so this
skill doesn't drift as Next.js 16 evolves.
