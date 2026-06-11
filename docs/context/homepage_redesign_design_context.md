# Design context — Homepage redesign (signed-in normal user), brand-forward rewrite

A self-contained brief for **rebuilding the home screen a signed-in, non-admin user
(`role = 'user'`) lands on after login** (`/dashboard`). This is a **from-scratch,
brand-forward redesign** — assume nothing about the page that exists today. Everything
a designer needs is here; you should **not** need to read the codebase.

> **This supersedes the old neutral brief.** The previous version asked the home screen
> to "match the neutral shadcn greyscale" with "no brand accent colour." That is
> **retired.** The home screen now carries the app's real identity — the **Sprout mint
> system** that already powers `/learn` — pushed a little louder for a dashboard.
>
> **The home is deliberately lean.** Two heavy surfaces moved off it to their own screens:
> - **Activity heatmap → the Profile / user-detail screen** (it's a "my history" artifact).
> - **Leaderboard → its own `/leaderboard` screen**, reachable from a new sidebar entry.
>
>   The home keeps at most a light **rank teaser** that links to that screen. Detailed
>   specs for both spun-off surfaces live in **§9 (Related screens)** — enough to seed
>   their own briefs.
>
> **Scope of this redesign:** color/brand, the **sidebar + navigation** (full IA rework,
> now richer — §3), the **home layout**, and **which capabilities the home surfaces**.
>
> **Light theme only.** Like `/learn` today, the branded surfaces are a single, fully
> art-directed light theme. **Do not design a dark variant.**

> Source of truth for *what the user can do* (the capability map this distils):
> [user_capabilities.md](../api/user_capabilities.md).
> Source of truth for the *brand system* (tokens, type, atoms, verbatim CSS):
> [sprout_design_system_reference.md](sprout_design_system_reference.md).
> Source of truth for the *API behaviour* of each surface: the per-feature docs linked
> inline. Shared conventions (base URL, `Authorization: Bearer`, pagination, error shape)
> live in [frontend_handoff.md](../api/frontend_handoff.md).
> If a doc and this file disagree, the API doc / the live CSS wins.

---

## 1. The big picture (what we're building)

`/dashboard` is the first authenticated screen and the hub of the app. We're turning it
from a flat neutral stack into the **"trophy room"** — a branded home that (a) mirrors
the energy and identity of a Learn session, and (b) is the **launchpad** into the rest of
the app via a richer sidebar.

Two things drive this rewrite:

1. **Identity.** The app already has a gorgeous, complete design language — the **Sprout
   mint system** — but it's locked inside `/learn`. The signed-in home greets the user in
   cold greyscale, then `/learn` bursts into mint. That seam is the problem. The home
   should feel like *the same product*.
2. **A real navigation.** The backend supports far more than today's sidebar exposes
   (personal words + decks, catalog, community, practice & pronunciation, **leaderboard**,
   **profile/activity**). The redesign turns the sidebar into the app's spine and keeps the
   **home itself focused** — it doesn't try to cram every feature onto one page.

The spine of the redesigned home, one sentence:

> **Land in a place that feels like mine → see how I'm doing today → jump back into
> learning in one click** (everything else is one click away in the sidebar).

Above the fold it answers: *Am I on track today? What's my streak? How many cards are
due? — and one big primary button to keep going.* Below: a focused **progress** read and a
**launchpad** to the user's own words/lists, practice, and discovery.

```
   AM I ON TRACK?            WHAT NOW?                 WHAT ELSE (one click)
  ┌──────────────┐        ┌──────────────┐          ┌──────────────────────────┐
  │ 🔥 streak    │  ───▶  │ N cards due  │  ───▶     │ progress · my words      │
  │ daily goal   │        │ [Continue →] │          │ my lists · practice       │
  └──────────────┘        └──────────────┘          │ explore · community       │
     /me/stats              /me/stats                └──────────────────────────┘
                                              (heatmap → Profile · board → /leaderboard)
```

### The vocabulary (use these words in the UI)

| In the UI the user sees… | …which in the API is a… |
|---|---|
| **List** (a "vocabulary list") | **Deck** |
| **Word** | **Vocabulary** |
| **Streak** | consecutive `streakDays` |
| **Card / review** | a scheduled SRS item |

Keep labels consistent across the whole app — **"List"**, **"Word"**, **"streak"**,
**"cards due"**.

---

## 2. Brand & color system (shared across all the branded surfaces)

Every branded surface — home, sidebar, profile, leaderboard — adopts the **Sprout mint
identity** (the exact tokens that power `/learn`), pushed louder for these screens. It is
**not** the restrained-mint-inside-a-study-card look; it's the *brand at full confidence*.

All tokens below are **verbatim from the live Sprout system**
([sprout_design_system_reference.md §2](sprout_design_system_reference.md), sourced from
[globals.css](../../src/app/globals.css)) — design against these, don't invent new hues.

### 2.1 Palette (light only)

```css
/* brand core */
--primary:        #12bd8a;   /* mint — the brand. primary CTAs, active nav, accents */
--primary-press:  #0ca576;
--primary-ink:    #07684b;   /* deep mint — text on soft mint */
--primary-soft:   #e0f6ee;   /* mint tint — selected/hover fills */
--primary-soft-2: #c8eede;

/* surfaces + ink */
--app-bg:    #eaf1ed;        /* the page field (was --learn-bg) */
--surface:   #ffffff;        /* cards */
--card-2:    #f6faf8;        /* sunken/secondary card */
--ink:       #15241e;        /* primary text */
--ink-2:     #5b6b64;        /* secondary text */
--ink-3:     #91a09a;        /* muted / labels */
--line:      #e9efeb;
--line-2:    #dde6e1;        /* borders */

/* gamification accents */
--amber:      #ffb020;  --amber-2: #ff7a1a;  --amber-soft: #fff0d4;   /* STREAK / celebration */
--violet:     #7b6cff;  --violet-soft: #ece9ff;                       /* LEADERBOARD / social */
--sky:        #1f9fd1;  --sky-soft:    #e0f1fa;                       /* ACTIVITY / heatmap */

/* semantic */
--ok:  #11a368;  --ok-soft:  #dcf4e7;  --ok-ink:  #0a6e44;
--bad: #f1456a;  --bad-soft: #fde4ea;  --bad-ink: #b51f42;
```

**Accent assignment is meaningful and consistent app-wide — color *means* something:**

| Accent | Owns | Lives mostly on |
|---|---|---|
| **Mint** `--primary` | Brand, primary CTA, active nav, progress fill | everywhere |
| **Amber** `--amber` | **Streak** flame, daily-goal ring, celebration | home hero |
| **Violet** `--violet` | **Leaderboard** / social | `/leaderboard` screen (+ home rank teaser) |
| **Sky** `--sky` | **Activity heatmap**, "active days" | Profile screen |

### 2.2 Page background (brand it — don't leave it flat white)

The page field is **not** white. Use the Sprout soft-mint glow over the field color, and
let the **hero band** carry a richer gradient:

```css
/* page field */
background:
  radial-gradient(120% 80% at 50% -10%, rgba(18,189,138,0.07), transparent 60%),
  var(--app-bg);

/* hero band (turned up for the dashboard) — mint → sky wash behind the streak/CTA hero */
background:
  radial-gradient(120% 120% at 0% 0%, rgba(18,189,138,0.14), transparent 55%),
  radial-gradient(120% 120% at 100% 0%, rgba(31,159,209,0.12), transparent 55%),
  var(--surface);
```

### 2.3 Type

- **Plus Jakarta Sans** — all UI text, labels, buttons, chip numbers. Weights 400–800.
  (`--font-jakarta`)
- **Newsreader (serif)** — **display** moments: the greeting headline, big counts (streak
  number, "N cards due"), section eyebrows. Weights 400/500/600, normal + italic.
  (`--serif` / `.lr-word` ramp.) The serif is what makes the home feel *crafted* — use it
  for the numbers that matter.
- Eyebrows use `.lr-eyebrow` (12px, 700, `0.12em` tracking, uppercase, `--ink-3`).
- **`tabular-nums`** on every count/rank/value that can change.

### 2.4 Radii, shadows, motion

```css
--r-card: 30px;   --r-tile: 18px;   --r-chip: 999px;   --r-input: 16px;

--sh-sm: 0 1px 2px rgba(16,40,32,.05), 0 2px 6px rgba(16,40,32,.04);
--sh-md: 0 2px 6px rgba(16,40,32,.05), 0 14px 30px -10px rgba(16,40,32,.14);
--sh-lg: 0 10px 26px -8px rgba(16,40,32,.12), 0 34px 64px -22px rgba(16,40,32,.2);
--sh-primary: 0 8px 18px -5px rgba(18,189,138,.5);   /* mint CTA glow */
--sh-amber:   0 8px 18px -5px rgba(255,140,30,.5);   /* streak glow */
```

- Cards = `--surface`, `--r-card` (30px), `--sh-md`/`--sh-lg`. The hero earns `--sh-lg`;
  smaller tiles `--sh-sm`/`--sh-md`.
- Reuse the **Sprout atoms** where they fit — `.lr-btn` (CTA: `--primary` for "go",
  `--amber` for celebratory), `.lr-chip` / `.lr-typepill` (pills), `.lr-streak` (streak
  badge), `.lr-progress` (goal bar), `.lr-sk` (skeleton), `.lr-icon-btn`. Verbatim CSS in
  [sprout_design_system_reference.md §4](sprout_design_system_reference.md). **Reuse before
  inventing.**
- Motion: `.lr-stagger` / `learn-fadeUp` for section reveal; `.lr-float` for one hero
  ornament at most. **Honour `prefers-reduced-motion`.**

### 2.5 Implementation note (engineer, not designer)

The Sprout tokens currently live **scoped to `.learn-shell`** and are consumed as **plain
CSS variables** (`bg-(--amber-soft)`, `text-(--ink-2)`), *not* Tailwind theme colors. To
brand these surfaces:

- **Lift the tokens to a shared brand scope** — e.g. an `.app-shell` class on the
  authenticated **user** layout root (home, words, decks, explore, community, practice,
  leaderboard, profile), mirroring how `.learn-shell` is set once in the learn layout.
  **Do not** brand the **admin** subtree, and **do not** promote mint to global `:root`.
- Inside that scope, reused shadcn primitives (`Button`, `Badge`, `Progress`, `Card`)
  inherit the mint `--primary`/`--ring` automatically, exactly as in `/learn`.

---

## 3. Sidebar & navigation (the redesigned spine — more features)

The sidebar today ([app-nav.tsx](../../src/components/app/app-nav.tsx)) is neutral and lists
only Home / Learn, with **Decks** and **Words** greyed "Soon" — even though both are fully
backend-supported. Rebuild it into a **branded, grouped** navigation that exposes the whole
user capability map (see [user_capabilities.md](../api/user_capabilities.md)).

### 3.1 New navigation model (grouped)

```
Sidebar (rebuilt, branded, grouped by eyebrow label)

  [BrandMark]

  MENU
  ├── Home         /dashboard     HomeIcon            ← this redesign
  ├── Learn        /learn         GraduationCapIcon   (the mint study UI; the home CTA jumps here)
  └── Practice     /practice      MicIcon             ← NEW. sentence + pronunciation (cap §6)

  LIBRARY
  ├── My Words     /words         BookMarkedIcon      ← ACTIVATE (was "Soon"). /v1/me/vocabularies
  └── My Lists     /decks         LayersIcon          ← ACTIVATE (was "Soon"). /v1/me/decks

  DISCOVER
  ├── Explore      /explore       CompassIcon         ← NEW. catalog: vocab / topics / system decks (cap §2)
  ├── Community    /community      UsersIcon           ← NEW. public / shared lists (/v1/decks/public)
  └── Leaderboard  /leaderboard   TrophyIcon          ← NEW. its own screen (cap §8) — see §9.2

  ── (footer) ──
  Profile menu  →  avatar + username, opens:          ← NEW. user-detail / account (cap §1)
    · Profile       /profile      (hosts the activity heatmap — see §9.1)
    · Settings      /settings     (PATCH /v1/users/:id; incl. leaderboard opt-out)
    · Sign out      logoutAction
   (Admin          /admin         ShieldIcon — admin only, unchanged, neutral)
```

- **Group with `.lr-eyebrow` labels** (MENU / LIBRARY / DISCOVER) so a longer list stays
  scannable — this is the "show more features" ask, kept legible by grouping.
- **Activate Decks→"My Lists" and Words→"My Words"** (drop "Soon"). If a destination page
  isn't built yet, route it to a simple branded index rather than a dead greyed label —
  **don't** mark backend-supported features "Soon."
- **Add Practice, Explore, Community, Leaderboard** as first-class destinations.
- **Three list sources, kept distinct.** A vocabulary list always belongs to exactly one of
  three provenances, and the nav separates them: **My Lists** (`/decks` → `/v1/me/decks`,
  *mine*), **Explore** (`/explore` → `/v1/decks`, *system / app-curated lists* — plus vocab &
  topics), **Community** (`/community` → `/v1/decks/public`, *other users'*). They share one
  card family but each card carries a **provenance badge** — see §7.4.
- Keep route-detection (`pathname === href || startsWith(href + '/')`) for the active state.

### 3.2 Branded styling

- Sidebar surface: `--surface` (or a faint mint-tinted panel), border `--line-2`.
- **Active item:** mint — `bg-(--primary-soft)` fill + `text-(--primary-ink)` + a mint left
  rail/dot; icon in `--primary`. Inactive: `--ink-2`, hover `--card-2` / `--ink`.
- **Leaderboard** active/hover may tint **violet** (`--violet-soft`) to match its screen.
- Group eyebrows in `--ink-3`, small caps; items `--r-tile`-ish, `--sh-sm` on the active pill.
- **Brand mark** at top stays; ensure it reads on the tinted panel.

### 3.3 Profile menu (footer)

Replace the static "avatar + email + Sign out" footer with a **profile menu**
(popover/dropdown):
- Avatar (`avatarUrl`, fallback = username initial in a `--primary-soft` circle) + username.
- **Profile** → `/profile` (the user-detail screen that hosts the **activity heatmap**, §9.1).
- **Settings** → `/settings` (edit `nativeLanguage`/`targetLanguage`/`proficiencyLevel`/
  `dailyGoalMinutes`/`weeklyVocabGoal`, and **🆕 `leaderboardOptOut`**, via `PATCH /v1/users/:id`).
- **Sign out** (existing `logoutAction`).

### 3.4 Mobile

The compact top bar (`AppMobileBar`) gets the same brand treatment. With more destinations,
collapse to a **hamburger → branded drawer** that mirrors the grouped desktop nav (icon-only
row is no longer enough). The **email-verify banner**
([verify-email-banner.tsx](../../src/components/app/verify-email-banner.tsx)) stays owned by
the layout — **don't duplicate it**. The onboarding gate also stays in the layout
(unonboarded users are redirected to `/onboarding` before `/dashboard`), so the home can
assume `isOnboarded === true` (see §8).

---

## 4. What the home surfaces (focused capability set)

With the sidebar carrying navigation, the **home stays focused** on the daily-loop core +
the user's own library, and **delegates** the heavy social/history surfaces to their screens:

| Section | Capability (cap-map §) | Data source | On the home? |
|---|---|---|---|
| **Greeting / header** | identity (§1) | `GET /v1/auth/me` | ✅ hero |
| **Streak + daily goal + primary CTA** | progress/learn (§5, §7) | `/me/stats` | ✅ hero |
| **Progress breakdown** | progress (§7) | `/me/stats → counts` | ✅ |
| **My Words** (count + quick-add) | personal vocab (§3) | `/me/vocabularies` | ✅ launchpad |
| **My Lists** (rail) | personal decks (§4) | `/me/decks` | ✅ launchpad — provenance **Mine** |
| **Suggested for you** (rail) | catalog (§2) | `/me/decks/suggested` | ✅ — provenance **Official** (curated) |
| **Practice / Explore / Community** (entries) | §6, §2 | nav | ✅ launchpad tiles |
| **🥇 Rank teaser** (optional, light) | social (§8) | `/leaderboard → me` | ◐ one small chip → `/leaderboard` |
| **🆕 Activity heatmap** | activity (§7) | `/me/activity` | ❌ → **Profile screen** (§9.1) |
| **🆕 Full leaderboard** | social (§8) | `/leaderboard` | ❌ → **`/leaderboard` screen** (§9.2) |
| **Verify / onboarding nudges** | identity (§1) | layout | (layout-owned) |

On the home, two list sections appear side by side — **Suggested for you** (Official/curated)
and the **My Lists** rail (Mine). They look identical except for their **provenance badge**
(§7.4), so the user is never confused about whether a list is the app's or their own.

The **rank teaser** is deliberately tiny — a single `#87 · You →` chip (in the hero corner or
as one launchpad tile), not a card. Its job is to *advertise the leaderboard screen*, not to
reproduce it. Drop it entirely if `me.rank === null` / opted out.

---

## 5. The home screen to lay out (leaner)

A branded field (§2.2), a **hero band** up top, then a tidy two-tier body: **Progress** + a
**launchpad bento**, then the **Suggested** rail. No heatmap, no leaderboard card. Suggested
container `max-w-5xl`, centered, `gap-8`/`gap-10` rhythm.

```
  ╭─────────────────────────────────────────────────────────────────────────╮
  │  HERO BAND  (mint→sky gradient wash, §2.2)                                │
  │                                                                          │
  │  Welcome back, {username}                        🥇 #87 · You →  [avatar▾]│  ← serif greeting + tiny rank teaser
  │  ┌────────────────────────────┐   ┌─────────────────────────────────┐    │
  │  │ 🔥 14-day streak  (amber)  │   │  8 cards due now      (serif)    │    │
  │  │ Goal · 12 / 20 min  (○)    │   │  Clear your queue to stay sharp.│    │
  │  │                            │   │  [ ▶ Continue learning ]  (mint)│    │  ← PRIMARY CTA
  │  └────────────────────────────┘   └─────────────────────────────────┘    │
  ╰─────────────────────────────────────────────────────────────────────────╯

  ┌──────────────── Progress ─────────────────────────────────────────────────┐
  │  (mint donut)   New 5 · Learning 9 · Review 23 · Mastered 41               │  ← progress breakdown
  │                 78 words total                                             │
  └────────────────────────────────────────────────────────────────────────────┘

  ┌──── My Words ────┐  ┌──── My Lists ────┐  ┌──── Practice ────┐  ┌─ Explore / Community ─┐
  │  128 words       │  │  6 lists         │  │  🎙 Pronounce     │  │  Browse the catalog → │  ← LAUNCHPAD bento
  │  [+ Quick add]   │  │  [+ New list]    │  │  ✍ Write a line   │  │  Shared lists →       │
  └──────────────────┘  └──────────────────┘  └──────────────────┘  └───────────────────────┘

  Suggested for you                                         (curated picks · "Official" badge)
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ ✓Official│ │ ✓Official│ │ ✓Official│    ← one card family + provenance badge (§7.4)
  │ list     │ │ list     │ │ list     │
  └──────────┘ └──────────┘ └──────────┘
```

**Responsive intent:** one column on mobile (hero stacks: streak card, then CTA card; the
rank teaser drops under the greeting); Progress full-width; the launchpad bento goes 4-up at
`lg` → 2-up → 1-up.

---

## 6. The data that drives the home

Stay cheap on load. The hero + progress run on **two existing calls**; the launchpad rails are
**secondary** (lazy / below-fold). Only the fields the UI reacts to are listed.

### 6.1 Already wired (fetchers exist)

**Identity** — `GET /v1/auth/me`:

| Field | Drives |
|---|---|
| `username`, `avatarUrl` | greeting + profile-menu avatar (null → initial) |
| `isEmailVerified` | verify banner (handled in the layout) |
| `leaderboardOptOut` | whether the rank teaser shows at all; settings toggle |

**Stats snapshot** — `GET /v1/me/stats` → `StatsResponse`
([types.ts](../../src/lib/me/types.ts)):

```jsonc
{ "streakDays": 14, "dueNow": 8, "reviewedToday": 12, "dailyGoalMinutes": 20,
  "counts": { "new": 5, "learning": 9, "review": 23, "mastered": 41 },
  "nextDueAt": "2026-06-10T14:00:00.000Z" }   // ISO of soonest future card, or null
```

| Field | Drives |
|---|---|
| `streakDays` | the **streak** flame/counter (amber; 0 → "No streak yet") |
| `dueNow` | the **primary CTA** ("Study N cards") + today-progress |
| `reviewedToday` + `dailyGoalMinutes` | daily-goal ring/bar (amber) |
| `counts {new,learning,review,mastered}` | the **progress** donut/bar (mint ramp; `total = sum`) |
| `nextDueAt` | "Next review in …" when `dueNow === 0` (`formatTimeUntil`, [format.ts](../../src/lib/format.ts)) |

**Suggested decks** — `GET /v1/me/decks/suggested` → `DeckSummary[]`:
`{ id, name, description, language, cefrLevel, vocabCount }`. Empty array is normal.

### 6.2 Launchpad rails + rank teaser (secondary / below-fold)

Fetch below the fold or lazily; each degrades to its own empty/skeleton independently (§8) —
never block the hero on them.

| Block | Endpoint | Field(s) the UI needs | Doc |
|---|---|---|---|
| **My Words** count + quick-add | `GET /v1/me/vocabularies` (count) · `POST /v1/me/vocabularies/quick-create` | total count; quick-add lemma → `202` + poll `…/jobs/:jobId` | [me_vocabulary_quick_create.md](../api/me_vocabulary_quick_create.md) |
| **My Lists** rail + new-list | `GET /v1/me/decks` · `POST /v1/me/decks` | `DeckSummary[]` (name, cefr, vocabCount) | — |
| **Explore / Community** entries | nav → `/explore`, `/community` (`GET /v1/decks/public` for a teaser count) | optional count | [decks_share_and_clone.md](../api/decks_share_and_clone.md) |
| **Practice** entry | nav → `/practice` | optional: last pronunciation score teaser | [pronunciation_score.md](../api/pronunciation_score.md) |
| **🥇 Rank teaser** | `GET /v1/leaderboard?metric=words_mastered&window=all` → use **`me` only** | `me.rank`, `me.value` | [community_leaderboard.md](../api/community_leaderboard.md) |

Quick-add is **async** (`202` → poll the job); show an optimistic "adding…" chip and refresh
the count when it resolves. The home tile is a fast lemma entry only — deep editing lives on
`/words`. The rank teaser reads only `me` from the leaderboard call; the **top-N list belongs
to the `/leaderboard` screen** (§9.2), not the home.

---

## 7. Building blocks (home)

### 7.1 Hero (streak + daily goal + primary CTA)
The branded centrepiece in the gradient hero band (§2.2). Two cards (or one split card): a
**streak/goal** card and a **CTA** card.
- **Streak:** reuse the `.lr-streak` badge idiom (amber gradient, flame) scaled up — number
  in **serif**, `tabular-nums`. `streakDays === 0` → muted flame + "No streak yet" (never a
  bare "0").
- **Daily goal:** an **amber** ring or `.lr-progress`-style bar, `reviewedToday` vs
  `dailyGoalMinutes`.
- **Adaptive heading** from `dueNow` (serif, large): `dueNow>0` → "{N} cards due now";
  `dueNow===0 & nextDueAt` → "You're all caught up" + "Next review {formatTimeUntil}";
  `total===0` → "Ready to learn your first words?".
- **One primary CTA** — `.lr-btn --primary --lg` (mint) → `/learn?mode=daily` (or `review`
  when ahead / "Start your first session" for new users). **Exactly one** high-emphasis
  button on the screen.
- **Rank teaser** (optional): a small `.lr-chip` in the band corner —
  `🥇 #{me.rank} · You →`, **violet** accent, links to `/leaderboard`. Hidden if
  `me.rank === null` / opted out.

### 7.2 Progress breakdown (mint ramp)
A donut or stacked segmented bar over `counts {new,learning,review,mastered}`, on a
**mint→deep-mint ramp** (`--primary-soft-2` → `--primary` → `--primary-ink`, `--ink-3` for
"new"). Legend with `tabular-nums` counts + "N words total" (serif total). Keep four raw
tiles (`.lr-chip`-style) as the compact/mobile fallback if the donut is heavy there.

### 7.3 Launchpad bento (my words / my lists / practice / explore+community)
Small `--surface` tiles (`--r-tile`/`--r-card`, `--sh-sm`), each: an eyebrow + a big serif
number or icon + one action.
- **My Words:** `{count} words` + `[+ Quick add]` (mint soft button → lemma entry, §6.2).
- **My Lists:** `{count} lists` + `[+ New list]`; below, the existing deck-card rail.
- **Practice:** a **mic** glyph (reuse `.lr-orb`/`.lr-mic` energy) → `/practice`; optionally
  tease the last pronunciation score.
- **Explore / Community:** "Browse the catalog →" / "Shared lists →" → `/explore`, `/community`.

### 7.4 List card + provenance (System vs Mine vs Community)
There is **one list-card family** — the existing "Suggested for you" card
([suggested-decks.tsx](../../src/components/dashboard/suggested-decks.tsx)): `Card` + name,
CEFR pill, clamped description, `vocabCount` + chevron. **Don't invent a second card.** But a
vocabulary list can come from **three distinct sources**, and the UI must make the source
**unmistakable** — the card carries a **provenance badge** (a small top-corner pill), and each
source has a consistent label, accent, and home:

| Source | Badge (text — never color alone) | Endpoint | Lives on (whole screen) | Accent / marker | Extra on the card |
|---|---|---|---|---|---|
| **System** (app-curated) | **"Official"** + `BadgeCheck` seal | `GET /v1/decks` | **Explore** (`/explore`) + home **Suggested** | **mint** seal | — |
| **Mine** (I made / cloned it) | **"Mine"** | `GET /v1/me/decks` | **My Lists** (`/decks`) | neutral `--ink` | **Private / Public** visibility pill |
| **Community** (another user published) | **"Community"** + `by @username` | `GET /v1/decks/public` | **Community** (`/community`) | **violet** `--violet` | author + a **Clone** action |

Rules:
- **Always show the provenance badge wherever lists from different sources can appear
  together** — the home (Suggested = Official, My-Lists rail = Mine), search results, clone
  flows. On a single-source screen the badge may be implicit (every card on My Lists is Mine)
  but the visual language stays the same.
- **Suggested for you** draws from **system/curated** content (`/me/decks/suggested`) — badge
  it **Official**; never let it read as the user's own.
- **Community** cards always attribute the author (`by @username`) and expose **Clone**
  (`POST /v1/me/decks/:id/clone`, cap §4) → the clone becomes a **Mine** list; the same list
  then renders with the **Mine** badge.
- Restyle the card to the brand (mint hover lift, `--line-2` borders, `--r-card`). The badge
  recolours by source (mint / neutral / violet) so provenance reads at a glance — but the
  **text label carries it**, color never alone (accessibility, §11).

---

## 8. States to design (home)

`me` / `stats` / `suggested` fetch on the **server**; launchpad rails + rank teaser are
**client** components that fetch on mount (design their own loading + error). Cover:

| State | Trigger | Treatment |
|---|---|---|
| **Brand-new user (no activity)** | `counts` all 0, `dueNow:0`, `streakDays:0` | Hero → "Ready to learn your first words?" + "Start your first session." Hide the Progress donut (or empty hint). |
| **All caught up** | `dueNow===0`, `nextDueAt` set | Hero → "You're all caught up" + "Next review {formatTimeUntil(nextDueAt)}" + a "Get ahead" CTA. |
| **No streak yet** | `streakDays===0` | Muted (grey) flame + "No streak yet" — never a bare 0. |
| **My Words / My Lists empty** | count 0 / `decks.length===0` | Tile shows the **create** affordance only ("Add your first word" / "Make your first list"); rail hidden. |
| **Suggested empty** | array empty | Render nothing for that rail. |
| **Rank teaser — opted-out / no rank** | `me.rank===null` | **Hide the teaser** (the leaderboard CTA still lives in the sidebar). |
| **Loading (client cards)** | fetch in-flight | `.lr-sk` shimmer — tiles for the bento, a chip for the teaser. |
| **Error** | `stats` null / fetch fails | Calm per-card fallback ("We couldn't load this right now. Refresh to try again.") + retry — **never blank the whole page**. |
| **`401` session expired** | any call 401s | Defer to the app-shell guard (redirect `/login`); no bespoke per-card auth state. |

> **Onboarding nudge:** the layout redirects `!isOnboarded` users to `/onboarding` before
> `/dashboard` renders, so you generally **won't** need an onboarding card here. The
> **email-verify** banner is rendered by the layout — don't duplicate it.

---

## 9. Related screens (out of scope here — pointers to seed their own briefs)

These two surfaces moved **off** the home. They each deserve their own design-context file;
the essentials are captured here so the IA is unambiguous and the home's links land somewhere.

### 9.1 Profile / user-detail screen — hosts the **Activity heatmap** (`/profile`)

The "my history" home for a user. Reached from the **profile menu** (§3.3) and the header
avatar. Surfaces identity + the activity record.

- **Heatmap** — `GET /v1/me/activity?from=&to=&tz=<device tz>`. Full doc:
  [me_activity_heatmap.md](../api/me_activity_heatmap.md). API returns only active days; the
  UI builds the grid:

  ```jsonc
  { "from": "2025-06-11", "to": "2026-06-10", "timezone": "Asia/Ho_Chi_Minh",
    "totalReviews": 1840, "totalNewWords": 476, "activeDays": 211, "maxReviews": 92,
    "days": [ { "date": "2026-03-21", "reviews": 92, "newWords": 18 }, … ] }
  ```

  - **Pass the device tz** (`Intl.DateTimeFormat().resolvedOptions().timeZone`); default
    range = last 53 weeks; capped server-side (>366 days → `400`).
  - **Build the grid client-side:** index `days[]` into a `Map<date,…>`; missing date = 0
    cell. Intensity = 4–5 buckets on `reviews` (`0 / 1–3 / 4–6 / 7–9 / 10+`, or quartiles of
    `maxReviews`) on the **sky ramp** (empty `--card-2` → `--sky-soft` → tints of `--sky` →
    `--sky`). Cell `size-3`, `rounded-[3px]`, `gap-1`; month + weekday labels; "Less ▢▢▣▤
    More" legend; tooltip `"{reviews} reviews · {newWords} new words on {date}"` (empty →
    "No activity on {date}"). **Color is never the only signal** (tooltip carries counts).
  - Streak (`/me/stats`) and lit days read the same `learning_activity` log — keep copy
    consistent (±1-day tz edge around midnight is expected; don't reconcile). No entrance
    animation on the cells; honour reduced-motion.
- Also natural here: profile summary (avatar, username, target language/level), totals
  (`totalReviews`, `activeDays`, words mastered), and an entry to **Settings**.

### 9.2 Leaderboard screen — the full board (`/leaderboard`, sidebar entry)

Its own screen, linked from the **Leaderboard** sidebar item (violet accent) and the home
rank teaser.

- **Board** — `GET /v1/leaderboard?metric=words_mastered&window=all`. Full doc:
  [community_leaderboard.md](../api/community_leaderboard.md):

  ```jsonc
  { "metric": "words_mastered", "window": "all", "limit": 50,
    "data": [ { "rank": 1, "userId": "…", "username": "alice_99", "avatarUrl": "…", "value": 320 }, … ],
    "me": { "rank": 87, "value": 14 } }   // me.rank is null if no activity / opted out
  ```

  - Full ranked list (top 50) with **medal** styling on ranks 1–3 (violet/gold accents), a
    **pinned "you" row** (`#{me.rank} · You · {me.value}`, `tabular-nums`, on a `--violet-soft`
    band) that stays visible while scrolling.
  - **Only `metric=words_mastered&window=all` is live.** `metric=new_words` → **501** until
    Phase 2 — gate any "This week" toggle as "coming soon."
  - **`me.rank === null`** (no qualifying activity / opted out) → swap the you-row for an
    "Appear on the leaderboard" prompt linking to **Settings** (`leaderboardOptOut`, §3.3).
  - Server caches ~1–2 min — don't poll; refetch on tab focus. Loading → `.lr-sk` rows; error
    → calm retry.

> Both 9.1 and 9.2 want their own full design-context file. This section is the seed, not the
> final spec.

---

## 10. Constraints & edge cases (home)

- **Async quick-add:** `POST …/quick-create` returns `202`; poll the job and update the My
  Words count when it resolves — optimistic "adding…" meanwhile.
- **Avatar may be null** → fall back to the username initial in a `--primary-soft` circle
  (reuse everywhere: header, profile menu).
- **Counts are live-ish:** `dueNow`/`counts`/word + list counts change as the user studies —
  the home is a snapshot; re-fetch on navigation back rather than caching hard.
- **Rank teaser is opt-in to render:** only when `me.rank` is non-null; never block the hero
  on the leaderboard call (it's secondary).
- **Light only:** do not author dark-mode variants.
- **Errors:** `401` → redirect (app-shell guard); generic → per-card retry. One failing card
  must never blank the page.

---

## 11. Design goals (the bar to hit)

1. **It must feel like the same product as `/learn`.** Mint identity, serif numbers, the
   Sprout atoms — the seam between "cold app" and "warm study session" is gone.
2. **The home is focused, not a dumping ground.** Daily loop (streak, CTA, progress) + the
   user's own library + discovery launchpad. Heavy social/history surfaces live on **their
   own screens** (Profile, Leaderboard) reached via the sidebar.
3. **Answer "am I on track + what now" above the fold.** Streak, daily goal, due count, one
   primary button — visible without scrolling on a laptop.
4. **One primary CTA.** "Continue learning" (mint) is the only high-emphasis button.
5. **The sidebar is the spine.** Grouped, branded, exposing every feature (Home, Learn,
   Practice / My Words, My Lists / Explore, Community, Leaderboard / Profile + Settings).
6. **Color means something.** Mint = brand/go, **amber = streak**, **violet = leaderboard**,
   **sky = activity**. Consistent app-wide.
7. **One card family.** Hero, progress, and list cards share the `--surface` / `--r-card` /
   soft-border / shadow scaffold.
8. **Never blank the page on partial failure.** Each source degrades independently.
9. **Accessibility:** color is never the only signal; honour `prefers-reduced-motion`;
   `tabular-nums` on all changing numbers.

---

## 12. Screen checklist for the designer

Design at minimum (light theme):

- [ ] **Brand pass:** page field + hero gradient (§2.2), mint primary, serif display numbers
      — the home reads as the Sprout family.
- [ ] **Sidebar + nav:** branded, **grouped** (MENU / LIBRARY / DISCOVER), mint active state,
      **Decks/Words activated**, **Practice + Explore + Community + Leaderboard** added,
      **profile menu** (Profile + Settings incl. opt-out). Mobile drawer to match.
- [ ] **Hero:** streak (amber, serif), daily-goal ring/bar, adaptive heading
      (`due` / `caught-up` / `first-time`), single mint CTA, optional violet rank teaser.
- [ ] **Progress breakdown:** donut/bar over `counts` (**mint ramp**) + legend + total;
      all-zero empty state.
- [ ] **Launchpad bento:** My Words (count + quick-add), My Lists (count + new + rail),
      Practice, Explore/Community — each with its empty/loading state.
- [ ] **Suggested for you:** reuse the list-card rail; hidden when empty.
- [ ] **List provenance:** the one card family with a **provenance badge** — **Official**
      (system, mint seal) / **Mine** (neutral, + Private/Public) / **Community** (violet, +
      `by @username` + Clone). Source is unmistakable wherever lists mix; label carries it,
      not color alone (§7.4).
- [ ] **Responsive:** single column (mobile, stacked hero) → progress full-width → bento;
      sidebar → mobile drawer.
- [ ] **Cross-cutting:** branded card family, per-card loading/empty/error, `tabular-nums`,
      reduced-motion, **light only**.
- [ ] **(Spun off — own briefs):** Profile screen w/ **activity heatmap** (sky, §9.1);
      **Leaderboard** screen (violet, top-50 + pinned you-row, §9.2).

> Keep this file current: when the home's data sources, surfaced sections, or the nav IA
> change, update §3–§6 here in the same PR (alongside
> [user_capabilities.md](../api/user_capabilities.md)).
