# Design context — Auth screens redesign (login / register / verify-email), brand-forward

A self-contained brief for **rebuilding the authentication screens** — the screens an
**unauthenticated** visitor sees: **Sign in** (`/login`), **Create account** (`/register`),
and **Verify your email** (`/verify-email`), plus the shared auth chrome. This is a
**brand-forward re-skin + layout pass**: the wiring (server actions, form state, OTP) stays;
the **look changes from cold neutral greyscale to the app's real Sprout mint identity**.

> **This retires the neutral auth look.** Today the auth screens are a flat white `Card` on a
> blank background, all `muted-foreground` greys and a black primary button — the cold
> shadcn default. The moment the user signs in, the app **bursts into mint** (`/learn`,
> `/dashboard` already run the Sprout system). That seam — *cold front door → warm product* —
> is exactly what this redesign removes. **The front door now carries the brand.**
>
> **"Ignore the gray."** Drop the cold neutral greyscale as the *identity*: no blank-white
> field, no black CTA, no cold `text-muted-foreground` as the default ink. Replace it with the
> branded mint field, mint/coloured CTAs, and the **warm Sprout inks** (`--ink`, `--ink-2`,
> `--ink-3`) for text. Secondary text is still lower-contrast — but it's *warm* Sprout ink,
> not cold grey. Colour should feel **alive and inviting**, not corporate.
>
> **Light theme only.** Like `/learn` and `/dashboard`, the branded auth screens are a single,
> fully art-directed light theme. **Do not design a dark variant.**

> **Source of truth for the brand system** (tokens, type, atoms, verbatim CSS):
> [sprout_design_system_reference.md](sprout_design_system_reference.md).
> **Source of truth for the Google sign-in layout & flow:**
> [auth_google_sign_in.md](../api/auth_google_sign_in.md) — the Google button is the
> **primary CTA**; this brief inherits that layout decision.
> **Source of truth for the session/token contract:**
> [auth_session_tokens.md](../api/auth_session_tokens.md).
> Shared API conventions (base URL, `Authorization: Bearer`, error shape) live in
> [frontend_handoff.md](../api/frontend_handoff.md).
> If a doc and this file disagree, the API doc / the live CSS wins.

---

## 0. Taste pass (design-taste-frontend) — read first

This brief was run through the `design-taste-frontend` skill. The decisions below frame
everything after them. They are not marketing-page rules bolted on; they are the subset of the
skill that actually applies to a **product-auth surface**.

### 0.1 Design read & mode

> **Reading this as:** a product-auth surface (login / register / verify-email) for an existing
> language-learning app's new users, with a warm **Sprout-mint** product language, built on the
> in-repo Sprout design system (Tailwind v4 CSS-variable tokens + shadcn/ui primitives).
> **Mode: Redesign → Preserve** — the brand already exists and is locked; we re-skin onto it, we
> do not invent a new visual language.

Because the brand is already audited and documented
([sprout_design_system_reference.md](sprout_design_system_reference.md)), the redesign-protocol
audit is done: brand tokens, type, radii, shadows, and motion are all known and reused verbatim.
**Do not extract or re-derive a palette — adopt Sprout.**

### 0.2 Dials (deliberately calm — this is product UI, not a landing page)

The skill's landing-page baseline (`8 / 6 / 4`) is **wrong for an auth front door**. An auth
card is a single focused task; loud variance and cinematic motion would undercut trust. Set:

| Dial | Value | Why |
|---|---|---|
| **DESIGN_VARIANCE** | **3** | One centered card, one job. The skill's anti-center bias is explicitly waived for a single focused message — a sign-in card is exactly that. Symmetry reads as trustworthy here. |
| **MOTION_INTENSITY** | **3** | A gentle card entrance (`learn-fadeUp`), input-focus transitions, button press, and at most one soft `.lr-float` ornament. No scroll choreography, no parallax. |
| **VISUAL_DENSITY** | **3** | Airy. Generous padding inside the card; the form breathes. |

### 0.3 Locks (audit every screen against these before shipping)

- **Color lock — one accent: mint.** `--primary` mint is the *only* brand accent on these
  screens. The amber/violet/sky Sprout accents do **not** appear here (they "mean" streak /
  leaderboard / activity, which don't exist pre-login). The single semantic exception is **error
  = the `--bad` family** (`--bad-soft` fill, `--bad-ink` text). No stray non-mint CTA anywhere.
- **Shape lock — one radius system.** Card `--r-card` (30px), inputs/OTP slots `--r-input`
  (16px), buttons/pills `--r-chip` (full). Pick it, apply it to every control, don't mix.
- **Theme lock — light only.** The whole surface is one light theme; no section inverts. This is
  the project's explicit constraint (Sprout is light-only by design, like `/learn` and
  `/dashboard`), which overrides the skill's dual-mode default. Do **not** author a dark variant.

### 0.4 Taste guardrails specific to auth (the AI-tells that apply here)

- **Zero em-dashes in shipped UI copy** (skill §9.G, non-negotiable). Titles, labels, helper
  text, button labels, toasts, error strings: use a period, comma, colon, or a plain hyphen
  (`-`). E.g. write "We'll send a 6-digit code to {email}." — never an em-dash. *(This rule is
  about the rendered strings; this internal doc still uses em-dashes for readability.)*
- **No decorative status dots.** No little coloured dot before a label "for design." Colour and
  dots must carry real meaning (an error state, the active OTP slot), never decoration.
- **Button contrast check (a11y, mandatory).** White label on mint `--primary` (#12bd8a) is
  borderline for WCAG AA on small text. The mint CTA label is large + bold (`.lr-btn` is 700
  weight, ≥16px), which clears the 3:1 large-text bar — keep it bold/large, and if a smaller
  mint button ever appears, deepen the fill to `--primary-press` (#0ca576) or darken the label.
  Audit every CTA before shipping.
- **Form contrast check (a11y, mandatory).** Labels and helper text must pass AA on white: use
  `--ink` / `--ink-2`, **never `--ink-3` (#91a09a) for essential text** — `--ink-3` is for
  placeholders and non-essential labels only (it fails AA for body). The mint focus ring must be
  visible on every input, OTP slot, button, and link.
- **No fake/generic data.** Field *placeholders* (`you@example.com`, `alice_99`) are fine as
  examples; the verify screen shows the **real** `user.email`. Don't invent counts, avatars, or
  social-proof — there's none to show pre-login.
- **Full interactive cycles** (idle / focus / submitting / error / disabled-cooldown) are already
  specced in §6 — keep them; "static success only" is a fail.
- **Reduced motion** is mandatory for all motion at this dial; the global `.app-shell` /
  `.learn-shell` reduced-motion rule already covers it — keep any new entrance/ornament inside
  that contract.

### 0.5 Honesty notes (don't "fix" these — they're correct for this repo)

- **Icons stay `lucide-react`.** The skill discourages Lucide, but its override applies: *the
  project already depends on it* (`EyeIcon`, `TriangleAlertIcon`, `Loader2Icon`, the OTP). **Do
  not** introduce Phosphor/Tabler into a Lucide tree — one icon family per project.
- **The serif title is justified, not a default-reach.** The skill is strict about serif, but the
  brand brief *names* the serif (Newsreader, already the app-wide display face for words and
  numbers). It is **not** Fraunces/Instrument_Serif (the banned defaults). Use it only for the
  card title; body stays Plus Jakarta Sans.
- **Centered layout is correct here** (see 0.2) — don't force an asymmetric split onto an auth
  card.

### 0.6 What the skill says that does NOT apply (ignore these for auth)

Marketing-page rules that are out of scope for a product-auth card, so an implementer doesn't
import them by mistake: hero-fits-viewport / hero-stack discipline, eyebrow rationing across
"sections," "Trusted by" logo walls, bento grids + cell-count rhythm, marquees, zigzag
alternation, section-layout-repetition, scroll-cue bans, content-density spec-sheet rules. There
is one card, not a multi-section page.

---

## 1. The big picture (what we're building)

Three screens, one shared chrome, all unauthenticated. They are the **first impression** of the
product and right now they undersell it. The job:

1. **Make the front door feel like the same product as `/learn` and `/dashboard`.** Mint field,
   warm ink, soft-shadowed card, the Sprout atoms. A visitor should feel the brand before they
   ever sign in.
2. **Make signing in effortless.** Per [auth_google_sign_in.md](../api/auth_google_sign_in.md),
   **Google is the primary CTA** — full-width, prominent, first. Email/password is the demoted
   secondary path below an "or" divider. Same layout on **both** sign-in and sign-up.
3. **Keep every existing behaviour.** Server actions (`loginAction`, `registerAction`,
   `verifyEmailAction`, `sendVerificationAction`), `useActionState` field errors, the 6-digit OTP,
   the resend cooldown, the show/hide password toggle — all stay. **This is a visual + layout
   redesign, not a rewrite of the auth logic.**

The spine, one sentence:

> **Arrive somewhere that already feels like the product → continue with Google in one tap (or
> email if you prefer) → if needed, verify with a code — all wrapped in the Sprout brand.**

### Files in scope (restyle these — don't rebuild the logic)

| File | Role |
|---|---|
| [layout.tsx](../../src/app/(auth)/layout.tsx) | Shared auth chrome (centered column, `BrandMark`, `max-w-sm`) — **becomes the brand scope** (§7) |
| [login/page.tsx](../../src/app/(auth)/login/page.tsx) · [login-form.tsx](../../src/app/(auth)/login/login-form.tsx) | Sign-in screen + form |
| [register/page.tsx](../../src/app/(auth)/register/page.tsx) · [register-form.tsx](../../src/app/(auth)/register/register-form.tsx) | Create-account screen + form |
| [verify-email/page.tsx](../../src/app/(auth)/verify-email/page.tsx) · [verify-email-form.tsx](../../src/app/(auth)/verify-email/verify-email-form.tsx) | OTP verification screen + form |
| [src/components/auth/](../../src/components/auth/) | Shared atoms: `SocialButtonRow`, `OrDivider`, `PasswordField`, `SubmitButton`, `FormAlert`, `FieldError` |
| [brand-mark.tsx](../../src/components/brand-mark.tsx) | The "V" lockup at the top of the chrome (already uses `bg-primary` — will inherit mint once scoped) |

> **Out of scope:** onboarding (`/onboarding`) and the in-app email-verify *banner* are owned by the
> authenticated `(app)` layout — leave them. Match their brand, don't touch them here.

---

## 2. Brand & color system (adopt Sprout — drop the gray)

Every auth surface adopts the **Sprout mint identity** — the exact tokens that power `/learn`
and `/dashboard`. All tokens below are **verbatim from the live Sprout system**
([sprout_design_system_reference.md §2](sprout_design_system_reference.md), sourced from
[globals.css](../../src/app/globals.css)). **Design against these — don't invent new hues, and
don't fall back to cold shadcn greys.**

### 2.1 Palette (light only)

```css
/* brand core */
--primary:        #12bd8a;   /* mint — the brand. primary CTAs, links, focus rings, active */
--primary-press:  #0ca576;
--primary-ink:    #07684b;   /* deep mint — text on soft mint, branded links */
--primary-soft:   #e0f6ee;   /* mint tint — hover/selected fills, avatar circle, focus glow */
--primary-soft-2: #c8eede;

/* surfaces + WARM ink (this replaces the cold greyscale) */
--app-bg:    #eaf1ed;        /* the page field — NOT white */
--surface:   #ffffff;        /* the auth card */
--card-2:    #f6faf8;        /* sunken/secondary fill (e.g. social buttons, OTP slots) */
--ink:       #15241e;        /* primary text — warm near-black, not #000 */
--ink-2:     #5b6b64;        /* secondary text — warm, replaces text-muted-foreground */
--ink-3:     #91a09a;        /* muted / placeholders / labels */
--line:      #e9efeb;
--line-2:    #dde6e1;        /* borders — warm, replaces cold neutral borders */

/* gamification / personality accents (use sparingly for warmth) */
--amber:  #ffb020;  --amber-2: #ff7a1a;  --amber-soft: #fff0d4;
--violet: #7b6cff;  --violet-soft: #ece9ff;
--sky:    #1f9fd1;  --sky-soft:    #e0f1fa;

/* semantic (errors / success) */
--ok:  #11a368;  --ok-soft:  #dcf4e7;  --ok-ink:  #0a6e44;
--bad: #f1456a;  --bad-soft: #fde4ea;  --bad-ink: #b51f42;   /* form errors live here */
```

**The "no gray" rule, concretely:**

| Old (cold, retire) | New (warm Sprout) |
|---|---|
| `bg-background` blank white field | mint field — `--app-bg` + the soft-mint glow (§2.2) |
| black primary button (`bg-primary` = `oklch(0.205 0 0)`) | **mint** CTA (`--primary`) |
| `text-muted-foreground` (cold grey) | `--ink-2` / `--ink-3` (warm Sprout ink) |
| neutral `border` | `--line-2` (warm) |
| plain underline links in `text-foreground` | mint links — `--primary-ink`, hover `--primary` |

### 2.2 Page field (brand it — don't leave it flat white)

The auth chrome background is the Sprout field, not white. Reuse the verbatim gradient:

```css
/* page field (apply to the (auth) chrome root) */
background:
  radial-gradient(120% 80% at 50% -10%, rgba(18,189,138,0.07), transparent 60%),
  var(--app-bg);
```

Optionally lift the card itself onto a faint **hero-band** wash (mint → sky, from the dashboard)
so the single centred card feels intentional rather than floating on blank:

```css
/* optional: a soft wash behind/within the card for extra warmth */
background:
  radial-gradient(120% 120% at 0% 0%, rgba(18,189,138,0.14), transparent 55%),
  radial-gradient(120% 120% at 100% 0%, rgba(31,159,209,0.12), transparent 55%),
  var(--surface);
```

A small **mint/sky ornament** (a `.lr-float` blob, a soft ring) behind the card is welcome for
personality — one at most, and it must honour `prefers-reduced-motion`.

### 2.3 Type

- **Plus Jakarta Sans** (`--font-jakarta`) — all UI text, labels, inputs, buttons. Weights 400–800.
- **Newsreader serif** (`--serif`) — the **headline moment**: the card title ("Welcome back",
  "Create your account", "Check your inbox"). The serif is what makes the screen feel *crafted* —
  use it for the title, keep the body in Jakarta.
- Eyebrows / section labels use `.lr-eyebrow` (12px, 700, `0.12em` tracking, uppercase, `--ink-3`).

> **Engineer note on fonts:** Jakarta + Newsreader are currently loaded **scoped to the `/learn`
> subtree** ([learn/layout.tsx](../../src/app/(app)/learn/layout.tsx)). To use them on the auth
> screens, load the same `next/font/google` families in the `(auth)` layout (or a shared font
> module) and expose `--font-jakarta` / `--font-newsreader` on the auth scope. If that's deferred,
> the screens still read correctly on the default sans — but the serif title is the payoff, prefer
> wiring it.

### 2.4 Radii, shadows, motion

```css
--r-card: 30px;   --r-tile: 18px;   --r-chip: 999px;   --r-input: 16px;

--sh-sm: 0 1px 2px rgba(16,40,32,.05), 0 2px 6px rgba(16,40,32,.04);
--sh-md: 0 2px 6px rgba(16,40,32,.05), 0 14px 30px -10px rgba(16,40,32,.14);
--sh-lg: 0 10px 26px -8px rgba(16,40,32,.12), 0 34px 64px -22px rgba(16,40,32,.2);
--sh-primary: 0 8px 18px -5px rgba(18,189,138,.5);   /* mint CTA glow */
```

- The auth **card** = `--surface`, `--r-card` (30px — rounder + friendlier than today's default
  card), `--sh-lg` (it's the single hero on the screen, let it lift).
- **Reuse the Sprout atoms** instead of inventing: `.lr-btn` (CTA), `.lr-input` (text fields),
  `.lr-chip` (pills/badges), `.lr-sk` (skeleton), `.lr-icon-btn`. Verbatim CSS in
  [sprout_design_system_reference.md §4](sprout_design_system_reference.md). **Reuse before
  inventing.**
- Card entrance: `learn-fadeUp` / `.lr-stagger` on the form rows for a gentle reveal. Honour
  `prefers-reduced-motion`.

---

## 3. The login / register layout (Google primary — from the API doc)

Both `/login` and `/register` share **one layout** (per
[auth_google_sign_in.md §"Recommended login screen layout"](../api/auth_google_sign_in.md)):
**Google is the primary, full-width CTA; email/password is the secondary path below an "or"
divider.** Same structure on both screens — only the form fields and copy differ.

```
   ╭───────────────────────────────────────────────────╮
   │            [V]  Vocab            (BrandMark, mint) │   ← chrome, above the card
   ╰───────────────────────────────────────────────────╯

   ┌───────────────────────────────────────────────────┐   ← card: --surface, --r-card, --sh-lg
   │                                                   │
   │        Welcome back            (serif title)      │
   │        Sign in to continue learning.  (--ink-2)   │
   │                                                   │
   │  ┌─────────────────────────────────────────────┐  │
   │  │  [G]   Continue with Google                 │  │   ← PRIMARY CTA, full-width, first
   │  └─────────────────────────────────────────────┘  │
   │  [ Apple ]  [ GitHub ]   (optional secondary row) │
   │                                                   │
   │  ───────────────  or  ───────────────             │   ← OrDivider, warm --line-2 + --ink-3
   │                                                   │
   │   Email     [______________________________]     │   ← .lr-input, mint focus ring
   │   Password  [__________________________] (👁)     │
   │   ┌─────────────────────────────────────────────┐ │
   │   │            Sign in           (mint, soft?)  │ │   ← secondary submit (see note)
   │   └─────────────────────────────────────────────┘ │
   │                                                   │
   │        No account?  Sign up   (mint link)         │
   └───────────────────────────────────────────────────┘
```

**Guidance (carried from the API doc + brand):**

- **Google first and prominent.** It's the highest-emphasis control. Today the providers render
  as three equal-weight `variant="outline"` buttons in `social-button-row.tsx` — **re-rank so
  Google is the dominant button** (full-width, branded border or filled, larger), with Apple/GitHub
  demoted to a smaller secondary row (or hidden until wired). Keep the multicolour Google `G` glyph
  exactly as-is — it's the one place the literal Google brand colours are correct.
- **Email/password is secondary.** Below the divider, smaller visual weight than Google. Don't give
  it equal prominence.
- **Two primary-ish actions, ranked by colour, not equal.** Google = the loud primary;
  the email **Sign in / Create account** submit is a *secondary* commit. Suggested treatment:
  Google = `.lr-btn--primary` (mint, full glow) **or** the official GIS button; email submit =
  `.lr-btn--soft` (mint-tint) or `--ghost` so the hierarchy reads. Pick one and keep it consistent
  across both screens. (Avoid two identical loud mint buttons stacked — that flattens the hierarchy
  the API doc asks for.)
- **Links are mint.** "No account? **Sign up**" / "Already have an account? **Sign in**" — the link
  word in `--primary-ink`, hover `--primary`. Not the old `text-foreground` underline.
- **Same layout, both screens.** `/register` adds Username + Email + Password (8-char min) above the
  same divider + social block; `/login` is Email + Password. The Google block and divider are
  identical.
- **Do not require a password from Google users** — they never set one. (UX note only; nothing on
  these screens forces it.)

> **Wiring reminder (not this brief's job, but don't regress it):** the social buttons are still
> **stubbed** (`toast.info("… isn't wired up yet.")` in
> [social-button-row.tsx](../../src/components/auth/social-button-row.tsx)). The redesign re-ranks
> and re-skins them; actually wiring Google (GIS → `POST /v1/auth/google`) is a separate task per
> [auth_google_sign_in.md](../api/auth_google_sign_in.md). Keep the stub behaviour until then.

---

## 4. The verify-email screen

Same branded chrome + card. The body is the **6-digit OTP** + a **resend** control + a "Skip for
now" link ([verify-email-form.tsx](../../src/app/(auth)/verify-email/verify-email-form.tsx)).

```
   ┌───────────────────────────────────────────────────┐
   │        Check your inbox        (serif title)      │
   │   We'll send a 6-digit code to alice@gmail.com    │   ← email in --primary-ink / --ink, not grey
   │                                                   │
   │        [ _ ] [ _ ] [ _ ]   [ _ ] [ _ ] [ _ ]      │   ← OTP slots: --card-2 fill, mint focus
   │                                                   │
   │  ┌─────────────────────────────────────────────┐  │
   │  │                 Verify                      │  │   ← .lr-btn--primary (mint), full-width
   │  └─────────────────────────────────────────────┘  │
   │                                                   │
   │               Send code  /  Resend in 42s         │   ← ghost/soft; cooldown in --ink-3, tnum
   │               Skip for now    (mint link)         │
   └───────────────────────────────────────────────────┘
```

- **OTP slots** (`InputOTPSlot`): warm `--card-2` fill, `--line-2` border, and a **mint focus
  ring** on the active slot (`box-shadow: 0 0 0 4px var(--primary-soft)`, border `--primary`).
  Size up to feel deliberate (the current `size-11` is fine; round to `--r-input`).
- **Verify** = `.lr-btn--primary` (mint), full-width.
- **Resend** stays a low-emphasis ghost/text button; the cooldown counter (`Resend in 42s`) uses
  `--ink-3` and **`tabular-nums`** so it doesn't jitter as it ticks.
- **"Skip for now"** is a mint link (`--ink-2` → `--primary` on hover), not cold grey.
- Keep the `RESEND_COOLDOWN_SECONDS` logic, the `toast` success/error, and the
  `isEmailVerified`/`isOnboarded` redirects exactly as they are.

---

## 5. Component mapping (restyle these atoms)

The forms are already factored into shared atoms — **re-skin the atoms and the hierarchy reflows
everywhere.** Reuse the Sprout equivalents:

| Auth atom (current) | Redesign to |
|---|---|
| `SubmitButton` ([submit-button.tsx](../../src/components/auth/submit-button.tsx)) | `.lr-btn` family — `--primary` (mint) for the main commit, keep the `useFormStatus` spinner. Email submit may be `--soft`/`--ghost` to sit under Google (§3). |
| `SocialButtonRow` ([social-button-row.tsx](../../src/components/auth/social-button-row.tsx)) | **Re-rank:** Google = dominant full-width primary; Apple/GitHub = smaller secondary row. Keep the multicolour `G`. |
| `OrDivider` ([or-divider.tsx](../../src/components/auth/or-divider.tsx)) | Warm `--line-2` rules + `--ink-3` "or" label. |
| `PasswordField` ([password-field.tsx](../../src/components/auth/password-field.tsx)) | `.lr-input` look (mint focus ring, `--r-input`); eye toggle in `--ink-3` → `--primary` on hover. |
| `FormAlert` ([form-alert.tsx](../../src/components/auth/form-alert.tsx)) | Keep the semantic **error** treatment but on Sprout tokens: `--bad-soft` fill, `--bad-ink` text, `--bad` icon (it already uses `bg-destructive/10` — point it at the Sprout `--bad` family). |
| `FieldError` ([field-error.tsx](../../src/components/auth/field-error.tsx)) | Inline field errors in `--bad-ink`. |
| `Input` / `Label` (shadcn) | Inputs adopt `.lr-input` (or inherit mint `--ring`/`--input` once scoped); labels in `--ink`. |
| `Card` (shadcn) | The auth card → `--surface`, `--r-card` (30px), `--sh-lg`, `--line` border. |
| `BrandMark` ([brand-mark.tsx](../../src/components/brand-mark.tsx)) | Already `bg-primary` — inherits mint automatically once the scope is applied (§7). No change needed beyond that. |

**Reuse, don't reinvent.** Verbatim CSS for every `.lr-*` atom is in
[sprout_design_system_reference.md §4](sprout_design_system_reference.md).

---

## 6. States to design

The forms drive these through `useActionState` / `useFormStatus` / the OTP + cooldown — design the
**branded** look for each:

| State | Trigger | Treatment |
|---|---|---|
| **Idle** | first paint | Branded card + Google primary + secondary form. Optional `learn-fadeUp` reveal. |
| **Field error** | `state.fieldErrors?.<field>` | `aria-invalid` input with `--bad` border; `FieldError` text in `--bad-ink` below the field. |
| **Form-level error** | `state.error` (e.g. "Invalid email or password", or a Google-flow `401`) | `FormAlert` banner on `--bad-soft` / `--bad-ink` at the top of the form. |
| **Submitting** | `useFormStatus().pending` | Disabled CTA + mint spinner + pending label ("Signing in…", "Creating account…", "Verifying…"). |
| **Social stub** | provider click (unwired) | Keep the `toast.info("… isn't wired up yet.")` until GIS is wired. |
| **OTP — sending / cooldown** | `sending` / `cooldown > 0` | Resend disabled; "Sending…" → "Resend in {n}s" (`--ink-3`, `tabular-nums`). |
| **OTP — sent** | `toast.success` | Success toast (sonner) on Sprout tokens; nothing blocks the slots. |
| **Verified / redirect** | action success | Existing redirects (`/`, `/onboarding`) — no bespoke screen. |

---

## 7. Implementation note (engineer — applying the brand scope)

The Sprout tokens currently live **scoped to `.learn-shell`** (and `.app-shell` for the
authenticated home) and are consumed as **plain CSS variables** (`bg-(--amber-soft)`,
`text-(--ink-2)`) — *not* Tailwind theme colours
([sprout_design_system_reference.md §0](sprout_design_system_reference.md)). The `(auth)` route
group is **outside** `.app-shell` today, so it gets none of this. To brand it:

- **Add a brand scope on the `(auth)` layout root** — apply a class that carries the Sprout token
  block to the `<main>` in [layout.tsx](../../src/app/(auth)/layout.tsx). Either reuse `.app-shell`
  (same tokens, light-only) or add a sibling `.auth-shell` block in
  [globals.css](../../src/app/globals.css) that declares the identical variables + the page-field
  background. Mirroring how `.learn-shell` / `.app-shell` are set once at their layout roots.
- Inside that scope, reused shadcn primitives (`Button`, `Card`, `Input`, the OTP slots) inherit
  the mint `--primary` / `--ring` / `--border` automatically — exactly as in `/learn`.
- **Do not** promote mint to global `:root`, and **do not** brand the `/admin` subtree.
- **Load the Sprout fonts** for this scope (§2.3) if you want the serif title.

---

## 8. Constraints & accessibility

- **Behaviour is frozen.** Don't change server actions, validation, the OTP length, redirect
  targets, or the cooldown. Visual + layout only.
- **Colour is never the only signal.** Errors carry an icon + text, not just red; the active OTP
  slot has a border change, not only a glow; links are underlined-on-hover, not colour-only.
- **Contrast.** Warm inks must still pass AA on `--surface`: `--ink` and `--ink-2` for body,
  `--ink-3` only for non-essential labels/placeholders. Mint links use `--primary-ink` (deep) on
  white, not the bright `--primary`, for legible contrast.
- **Focus visible everywhere** — mint focus ring (`0 0 0 4px var(--primary-soft)` + `--primary`
  border) on inputs, OTP slots, buttons, and links. Keyboard-first must work.
- **Honour `prefers-reduced-motion`** — the global rule already covers `.app-shell`/`.learn-shell`;
  keep any new ornament/entrance inside that contract.
- **Light theme only** — no dark variant.
- **Don't regress the Google stub** — keep the "not wired up yet" toast until GIS is integrated.

---

## 9. Screen checklist for the designer

Design at minimum (light theme):

- [ ] **Brand pass:** mint page field (§2.2), warm Sprout ink replacing every cold grey, serif
      card title, `--r-card`/`--sh-lg` card — the auth screens read as the Sprout family.
- [ ] **Login:** Google **primary** full-width CTA → divider → secondary email/password form →
      mint "Sign up" link. (§3)
- [ ] **Register:** same layout — Username + Email + Password(8) → divider → social block → mint
      "Sign in" link. (§3)
- [ ] **Verify-email:** branded OTP slots (mint focus), mint **Verify** CTA, ghost resend with
      `tabular-nums` cooldown, mint "Skip for now". (§4)
- [ ] **Atoms re-skinned:** `SubmitButton`, `SocialButtonRow` (re-ranked), `OrDivider`,
      `PasswordField`, `FormAlert`/`FieldError` on Sprout tokens. (§5)
- [ ] **States:** idle / field error / form error / submitting / OTP sending+cooldown — all on
      brand. (§6)
- [ ] **Cross-cutting:** mint focus rings, AA contrast on warm ink, colour-never-alone,
      reduced-motion, **light only**. (§8)
- [ ] **(Engineer) Brand scope** applied to the `(auth)` layout root + Sprout fonts loaded. (§7)

> Keep this file current: if the auth layout, the provider set, or the Sprout tokens change, update
> §2–§5 here in the same PR (alongside
> [auth_google_sign_in.md](../api/auth_google_sign_in.md) and
> [sprout_design_system_reference.md](sprout_design_system_reference.md)).
