# Next.js Frontend Conventions (Production-Ready)

Conventions for building and maintaining a production-grade Next.js frontend.
Follow these rules unless a task explicitly overrides them.

## Stack baseline

Pin to these versions. If your training data assumes older defaults (especially
Tailwind v3 config), it is wrong — use the rules here.

- **Next.js 16.x**, App Router (the Pages Router is in maintenance — do not use it for new code)
- **React 19**
- **TypeScript** in strict mode
- **Tailwind CSS v4** (CSS-first config — no `tailwind.config.js` by default)
- **shadcn/ui** (current CLI, Tailwind v4 / OKLCH theming)
- Package manager: pick one (pnpm recommended) and stick to it

---

## 1. Project structure & file conventions

- `app/` — routes only (App Router special files).
- `components/ui/` — shadcn primitives (CLI-managed, treat as low-churn).
- `components/` — your own composed/shared components.
- `lib/` — utilities, clients, helpers (`lib/utils.ts` holds `cn()`).
- `hooks/` — shared React hooks.
- Decide once whether to use a `src/` directory and stay consistent. With
  shadcn, use `--src-dir` if you want `src/app`.
- **Colocate** route-specific components and hooks inside their route folder.
  Only promote to `components/` / `hooks/` when shared across routes.
- Use the `@/*` import alias everywhere; no deep relative `../../../` paths.

Standard App Router special files:

| File | Purpose |
| --- | --- |
| `layout.tsx` | Shared UI that persists across navigation |
| `page.tsx` | Route-unique UI |
| `loading.tsx` | Suspense/pending fallback for the segment |
| `error.tsx` | Error boundary for the segment (Client Component) |
| `not-found.tsx` | 404 UI, paired with `notFound()` |
| `route.ts` | Route handler (export `GET`, `POST`, etc.) |

---

## 2. Server vs Client Components (highest-value rule)

- **Default to Server Components.** Do not add `"use client"` unless the
  component needs state, effects, event handlers, or browser-only APIs.
- Push `"use client"` to the **leaf** level. Keep pages and layouts as Server
  Components; isolate interactivity into small client components.
- Fetch data on the server and pass plain serializable data down as props.
- Never put secrets, tokens, or server-only logic in a Client Component.

---

## 3. TypeScript

- `strict: true`. No `any` — use `unknown` plus narrowing.
- Explicit return types on exported functions.
- `interface` for extendable object/prop shapes; `type` for unions and
  composition. Pick one convention for plain object props and be consistent.
- Derive types from a single source of truth (e.g. infer from Zod schemas with
  `z.infer`) instead of hand-writing duplicate types.

---

## 4. Styling — Tailwind CSS v4

Tailwind v4 uses **CSS-first configuration**. There is no `tailwind.config.js`
by default.

- Entry point is a single line: `@import "tailwindcss";`
- Define design tokens (colors, fonts, spacing) in CSS with `@theme`, not in a
  JS config file.
- Use `@tailwindcss/postcss`. **Remove `autoprefixer`** — Lightning CSS handles
  vendor prefixing.
- Prefer theme tokens over hardcoded/arbitrary values. Avoid `w-[437px]`-style
  arbitrary values unless genuinely one-off.
- Merge classes through a `cn()` helper (clsx + tailwind-merge). Never
  concatenate class strings by hand.
- Enforce class ordering with `prettier-plugin-tailwindcss`.
- No inline `style={}` except for truly dynamic runtime values.

Example token setup:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.62 0.19 256);
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

---

## 5. UI components — shadcn/ui

- shadcn copies component **source into your repo** — you own it.
- Install primitives via the CLI into `components/ui/`. Do not hand-write them.
- Initialize with `shadcn init` (it detects Next.js, validates Tailwind v4, and
  writes CSS variables into `globals.css`).
- Treat `components/ui/` as low-churn. Re-running the CLI **overwrites** these
  files, so put customizations in wrapper components in `components/`, not in
  the primitives.
- Build variants with `cva` (class-variance-authority), not conditional class
  soup.
- shadcn is built on Radix — lean on its accessibility primitives instead of
  rolling your own.

---

## 6. Data fetching, mutations & state

- **Reads:** fetch in Server Components. Use `fetch` cache options or
  `unstable_cache` deliberately; set revalidation intentionally.
- **Writes:** use Server Actions for mutations. Revalidate affected paths/tags
  after a successful mutation.
- **State priority:** local state → URL state (search params) → light global
  store (Zustand) **only when justified**. Do not reach for global state by
  default.

---

## 7. Forms & validation

- Use `react-hook-form` + `zod`.
- Define one Zod schema per form and share it between client validation and the
  Server Action (validate again on the server — never trust the client).
- Use shadcn's `Form` components for accessible field wiring.

---

## 8. Performance

- Always use `next/image` for images and `next/font` for fonts.
- Use `next/dynamic` for heavy client-only components.
- Favor Server Components and streaming (`<Suspense>`) to minimize client JS.
- Avoid large client bundles — audit `"use client"` usage regularly.

---

## 9. Error handling

Use the App Router's layered model. Use the right tool at each level instead of
wrapping everything in try/catch.

- `error.tsx` catches errors in its segment. It **must be a Client Component**
  and receives `error` and a `reset()` function. Place these at the segment
  level so one failure doesn't blank the whole app.
- `global-error.tsx` catches root-layout failures and must render its own
  `<html>`/`<body>`.
- `not-found.tsx` pairs with the `notFound()` helper for 404s.

**Expected vs unexpected errors** (write this down — agents tend to `throw`
for everything):

- **Expected** failures (validation, "email taken", missing record) → return as
  typed result values and render in the UI. Do not throw.
  - Server Actions return e.g. `{ success: false, error: "..." }`.
- **Unexpected** failures → throw and let the nearest error boundary catch them.

Guardrails:

- Validate inputs with Zod at the top of every Server Action; wrap real side
  effects in try/catch.
- Never leak raw errors/stack traces to the client. Next.js redacts these in
  production and replaces them with an error digest.
- Wire unexpected errors to observability (e.g. Sentry) so the digest is
  traceable.
- Pair every async boundary with `loading.tsx` or `<Suspense>` — handle pending
  and failure states, not just the happy path.

---

## 10. Testing

Two layers, split by a real tool limitation (not preference):

- **Vitest + React Testing Library** — Server Actions, Zod schemas, utilities,
  and **synchronous** Server/Client Components.
- **Playwright** — async Server Components, auth flows, and full user journeys.

> Vitest cannot render **async** Server Components (React's async-component
> support isn't stable in the test runner). Next.js officially recommends
> pushing async components to E2E tests.

Playwright rules:

- Run E2E against the **production build**, not the dev server (dev hot-reload
  and debug behavior cause flaky, misleading results).
- Prefer role-/label-based selectors or `data-testid` over CSS/class selectors.
- Mock network calls at the boundary via fixtures for deterministic runs.
- Reuse authenticated state across tests instead of logging in every time.

Coverage philosophy (not "100%"):

- Unit-test business logic and pure functions thoroughly.
- Integration-test data access and API/route handlers.
- Keep ~20–30 Playwright E2E tests on the paths where failure costs money.

CI:

- Gate sequentially — run fast unit tests first, proceed to integration and E2E
  only if they pass.

---

## 11. Code quality & tooling

- ESLint (Next.js config) + Prettier + `prettier-plugin-tailwindcss`.
- `husky` + `lint-staged` so lint/format/type-check actually run on commit.
- Type-check in CI (`tsc --noEmit`) as a required gate.

---

## 12. Naming conventions

- Files: `kebab-case` (e.g. `user-card.tsx`).
- Components: `PascalCase`.
- Functions/variables: `camelCase`.
- Constants: `SCREAMING_SNAKE_CASE`.
- Hooks: `useThing`.

---

## 13. Keeping this current

Next.js publishes a docs index at `/docs/llms.txt` and guidance on configuring
projects so AI agents pull up-to-date docs instead of stale training data. Point
your agent at that (or a docs MCP) so this skill doesn't drift as Next.js 16
evolves.