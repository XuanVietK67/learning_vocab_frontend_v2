# Design context — Homepage / dashboard redesign (signed-in normal user)

A self-contained brief for **redesigning the home screen a signed-in, non-admin
user (`role = 'user'`) lands on after login** (`/dashboard`). Everything a designer
needs is here; you should **not** need to read the codebase.

> Source of truth for *what the user can do* (the capability map this distils):
> [user_capabilities.md](../api/user_capabilities.md).
> Source of truth for the *API behaviour* of the new surfaces: the per-feature docs
> linked inline — [me_activity_heatmap.md](../api/me_activity_heatmap.md),
> [community_leaderboard.md](../api/community_leaderboard.md),
> [users_profile.md](../api/users_profile.md). Shared conventions (base URL,
> `Authorization: Bearer`, pagination, error shape) live in
> [frontend_handoff.md](../api/frontend_handoff.md).
> If a doc and this file disagree, the API doc wins.

---

## 1. The big picture (what we're redesigning)

`/dashboard` is the first authenticated screen and the hub of the app. Today it's a
competent-but-flat stack: a "Today" hero, four count tiles, a practice-modes grid,
and a "Suggested for you" deck row. The backend has since shipped three new
capabilities that make a richer, more motivating home screen possible — **and they
are the main drivers of this redesign** (🆕 in the capability map):

1. **Activity heatmap** (`GET /v1/me/activity`) — a GitHub-style contribution
   calendar of study days.
2. **Leaderboard + my rank** (`GET /v1/leaderboard`) — social standing.
3. **Leaderboard opt-out** (`PATCH /v1/users/:id → leaderboardOptOut`) — privacy.

The spine of the redesigned home screen is one sentence:

> **See where I stand → know exactly what to do next → do it in one click.**

It should answer, above the fold: *Am I on track today? What's my streak? How many
cards are due? — and a single primary button to keep going.* Below that: the
motivational/social layer (heatmap, progress breakdown, leaderboard) and discovery
(suggested decks, quick actions).

```
   AM I ON TRACK?            WHAT NOW?               KEEP GOING
  ┌──────────────┐        ┌──────────────┐         ┌──────────────┐
  │ 🔥 streak    │  ───▶  │ N cards due  │  ───▶   │ heatmap      │
  │ daily goal   │        │ [Continue →] │         │ breakdown    │
  └──────────────┘        └──────────────┘         │ leaderboard  │
     /me/stats              /me/stats               └──────────────┘
                                                 /me/activity · /leaderboard
```

### The vocabulary (use these words in the UI)

| In the UI the user sees… | …which in the API is a… |
|---|---|
| **List** (a "vocabulary list") | **Deck** |
| **Word** | **Vocabulary** |
| **Streak** | consecutive `streakDays` |
| **Card / review** | a scheduled SRS item |

Keep labels consistent with the rest of the app — this brief assumes **"List"**,
**"Word"**, **"streak"**, **"cards due"**.

---

## 2. Where it lives (navigation)

The home screen is **Home** in the persistent left sidebar (`/dashboard`,
`HomeIcon`), the route the `(app)` layout redirects authenticated users to. It lives
in the **neutral, light/dark shadcn app shell** (§7) — *not* the mint "Sprout" theme
(scoped to `.learn-shell` on `/learn` only) and *not* the soft-accent admin style.

```
Sidebar (exists)
├── Home    /dashboard   ← THIS REDESIGN
├── Learn   /learn       (the mint "Sprout" study UI — the primary CTA jumps here)
├── Decks   /decks       (greyed "Soon" today)
└── Words   /words       (greyed "Soon" today)
```

The redesign is **page-level only** — the sidebar, mobile top bar
([app-nav.tsx](../../src/components/app/app-nav.tsx)), and the email-verify banner
([verify-email-banner.tsx](../../src/components/app/verify-email-banner.tsx)) are
owned by the `(app)` layout and stay as they are. The onboarding gate also already
lives in the layout: unonboarded users are redirected to `/onboarding` **before**
they ever reach `/dashboard`, so the home screen can assume `isOnboarded === true`
(see §8 for the one nuance this leaves).

---

## 3. What exists today (the starting point you're replacing)

The current page is [dashboard/page.tsx](../../src/app/(app)/dashboard/page.tsx): a
single centered column (`mx-auto w-full max-w-4xl … gap-8`) that fetches three
things in parallel on the server — `getMe()`, `getStats()`, `getSuggestedDecks()` —
and renders four components. Treat these as the **idioms to extend**, not sacred:

| Component | File | What it does today | Fate in the redesign |
|---|---|---|---|
| **TodayHero** | [today-hero.tsx](../../src/components/dashboard/today-hero.tsx) | Streak + goal line, adaptive heading/sub, today-progress bar, one primary CTA to `/learn?mode=daily`. | **Keep & elevate** — this is the "what now?" block. Fold streak + daily-goal into it (or split into a dedicated streak card). |
| **StatTiles** | [stat-tiles.tsx](../../src/components/dashboard/stat-tiles.tsx) | Four-up `new / learning / review / mastered` counts. | **Rework** into the progress breakdown (donut/segmented bar) — see §5. |
| **PracticeModes** | [practice-modes.tsx](../../src/components/dashboard/practice-modes.tsx) | 2×2 grid linking to `daily / review / topic / deck` sessions. | **Keep** as quick actions; consider demoting below the new motivational layer. |
| **SuggestedDecks** | [suggested-decks.tsx](../../src/components/dashboard/suggested-decks.tsx) | "Suggested for you" deck cards (`/me/decks/suggested`); renders nothing when empty. | **Keep** — this is the one deck-card idiom; reuse it everywhere. |

**Net-new** to design and build: the **activity heatmap** and the **leaderboard
snapshot** (plus their data fetchers — see §4). Everything else is a re-layout of
existing parts into a stronger hierarchy.

---

## 4. The data that drives the UI (the minimum to design around)

The redesign should stay cheap on load. Drive it from **two existing calls** plus
**two new ones**. Only the fields the UI reacts to are listed; full contracts in the
linked docs.

### 4.1 Already wired (data fetchers exist)

**Identity** — `GET /v1/auth/me` (via `getMe()`):

| Field | Drives |
|---|---|
| `username`, `avatarUrl` | greeting + header avatar |
| `isEmailVerified` | verify-email banner (already handled in the layout) |
| `leaderboardOptOut` | whether to show a rank or an "appear on leaderboard" prompt |

**Stats snapshot** — `GET /v1/me/stats` (via `getStats()`) →
`StatsResponse` ([types.ts](../../src/lib/me/types.ts)):

```jsonc
{ "streakDays": 14, "dueNow": 8, "reviewedToday": 12, "dailyGoalMinutes": 20,
  "counts": { "new": 5, "learning": 9, "review": 23, "mastered": 41 },
  "nextDueAt": "2026-06-10T14:00:00.000Z" }   // ISO of soonest future card, or null
```

| Field | Drives |
|---|---|
| `streakDays` | the **streak** flame/counter (0 → "No streak yet") |
| `dueNow` | the **primary CTA** ("Study N cards") and today-progress |
| `reviewedToday` + `dailyGoalMinutes` | daily-goal ring/progress |
| `counts {new,learning,review,mastered}` | the **progress breakdown** donut/bar (`total = sum`) |
| `nextDueAt` | "Next review in …" when `dueNow === 0` (`formatTimeUntil`, see [format.ts](../../src/lib/format.ts)) |

**Suggested decks** — `GET /v1/me/decks/suggested` (via `getSuggestedDecks()`) →
`DeckSummary[]`: `{ id, name, description, language, cefrLevel, vocabCount }`. Empty
array is normal (returns nothing rendered today).

### 4.2 Net-new (fetchers do NOT exist yet — build the data layer too)

**Activity heatmap** — `GET /v1/me/activity?from=&to=&tz=<device tz>`. Full doc:
[me_activity_heatmap.md](../api/me_activity_heatmap.md). The UI builds the grid;
the API returns only active days:

```jsonc
{ "from": "2025-06-11", "to": "2026-06-10", "timezone": "Asia/Ho_Chi_Minh",
  "totalReviews": 1840, "totalNewWords": 476, "activeDays": 211, "maxReviews": 92,
  "days": [ { "date": "2026-03-21", "reviews": 92, "newWords": 18 }, … ] }
```

- **Pass the device timezone** (`Intl.DateTimeFormat().resolvedOptions().timeZone`)
  so a cell matches the user's local day. Default range is the last 53 weeks.
- **Build the grid client-side:** index `days[]` into a `Map<date, …>`; any missing
  date is a 0 cell. Intensity = 4–5 buckets on `reviews` (fixed `0 / 1–3 / 4–6 /
  7–9 / 10+`, or quartiles of `maxReviews`).
- **Headline:** `"{totalReviews} reviews in the last year"`.
- **Tooltip:** `"{reviews} reviews · {newWords} new words on {date}"`; empty →
  `"No activity on {date}"`.
- This is a **client component** (tz-dependent, interactive tooltips). The streak
  in `/me/stats` reads the same source, so lit days and the streak count agree
  (modulo a ±1-day timezone edge around local midnight — don't try to reconcile it).

**Leaderboard snapshot** — `GET /v1/leaderboard?metric=words_mastered&window=all`.
Full doc: [community_leaderboard.md](../api/community_leaderboard.md):

```jsonc
{ "metric": "words_mastered", "window": "all", "limit": 50,
  "data": [ { "rank": 1, "userId": "…", "username": "alice_99", "avatarUrl": "…", "value": 320 }, … ],
  "me": { "rank": 87, "value": 14 } }   // me.rank is null if no activity / opted out
```

- For the home **snapshot card**, show `me` ("You're #87 · 14 words mastered") +
  the **top 3** (medal styling), with a link to the full board.
- **Only `metric=words_mastered&window=all` is live.** `metric=new_words` returns
  **501** until Phase 2 — if you design a board toggle, gate the "This week" tab as
  "coming soon".
- **`me.rank === null`** → user has no qualifying activity *or* has opted out
  (`leaderboardOptOut`). Show an "Appear on the leaderboard" / "Study a word to join"
  prompt instead of a rank.
- Server may cache ~1–2 min — don't poll; refetch on tab focus is plenty.

---

## 5. The home screen to lay out (recommended sections)

A single centered column on the neutral shell. Order top → bottom by "what the user
needs first". Spend the most attention on the **above-the-fold "am I on track + what
now"** block — that's the screen's job.

```
Welcome back, {username}                                    [avatar]
─────────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│  🔥 14-day streak        Goal · 12 / 20 min        (○ ring)       │  ← streak + daily goal
│                                                                   │
│  8 cards due now                                                  │  ← adaptive heading
│  Clear your queue to keep every word on schedule.                 │
│  [ ▶ Continue learning ]                                          │  ← PRIMARY CTA
└─────────────────────────────────────────────────────────────────┘

Activity                                   1,840 reviews in the last year
┌─────────────────────────────────────────────────────────────────┐
│  ▢▢▢▣▣▢▢▣▣▣▤▤▢▢▣… (53-week GitHub-style contribution grid)        │  ← 🆕 HEATMAP
└─────────────────────────────────────────────────────────────────┘

┌───────────────── Progress ─────────────────┐  ┌─── Leaderboard ───┐
│  (donut)   New 5 · Learning 9               │  │  🥇 alice_99  320  │
│            Review 23 · Mastered 41          │  │  🥈 bao_le    295  │  ← 🆕 LEADERBOARD
│            78 words total                   │  │  🥉 minh      270  │     snapshot
└─────────────────────────────────────────────┘  │  ── #87 · You 14 ─ │
                                                  │  See full board →  │
                                                  └───────────────────┘

Practice                                                    (quick actions)
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Daily  │ │ Review │ │ Topic  │ │ Deck   │
└────────┘ └────────┘ └────────┘ └────────┘

Suggested for you
┌──────────┐ ┌──────────┐ ┌──────────┐
│ deck     │ │ deck     │ │ deck     │
└──────────┘ └──────────┘ └──────────┘
```

| Section | Data source | Notes |
|---|---|---|
| **Greeting / header** | `getMe()` | `Welcome back, {username}`; optional avatar (`avatarUrl`, fallback to initial). |
| **Today / streak + goal + CTA** | `/me/stats` | The hero. Streak flame (`streakDays`), daily-goal ring (`reviewedToday` vs `dailyGoalMinutes`), adaptive heading from `dueNow`, one **primary** button → `/learn?mode=daily` (or `review` when ahead). Keep the "all caught up → next review in …" branch from today's hero. |
| **🆕 Activity heatmap** | `/me/activity?tz=` | Full-width card; `totalReviews` headline; 4–5 intensity buckets; hover tooltip; month labels + a small legend. Horizontally scrollable on mobile. |
| **Progress breakdown** | `/me/stats → counts` | Donut or segmented bar over `new/learning/review/mastered` with a legend + total. Replaces the flat four-tile row (or keep tiles as the mobile fallback). |
| **🆕 Leaderboard snapshot** | `/leaderboard?metric=words_mastered&window=all` | Top 3 + a pinned **"#{me.rank} · You · {me.value}"** row; link to the full board. Opt-out / no-rank → prompt instead. |
| **Practice / quick actions** | (navigation) | The existing 2×2 modes grid; consider adding Add-word / Browse-catalog / Pronounce entry points. |
| **Suggested decks** | `/me/decks/suggested` | The existing deck-card row; hide when empty. |

**Responsive intent:** one column on mobile; on `lg` the Progress + Leaderboard can
sit **side by side** (e.g. `lg:grid-cols-3` with progress spanning 2). The heatmap
stays full-width and scrolls horizontally on small screens.

---

## 6. Shared / net-new building blocks

### 6.1 Activity heatmap (net-new — the centrepiece)
A `Card` wrapping a contribution grid. Weeks as columns, days as rows (Sun/Mon
start). 4–5 intensity steps built from **neutral foreground tints** so it reads in
both themes — e.g. empty `bg-muted`, then `bg-foreground/15 → /35 → /60 → /90` (or
the `chart-*` ramp). Each cell ~`size-3` with `rounded-[3px]` and a `gap-1` grid.
Month labels along the top, weekday labels down the left, a "Less ▢▢▣▤ More" legend
bottom-right. Tooltip via shadcn `Tooltip`. **Colour must not be the only signal** —
the tooltip carries the exact count. Honour `prefers-reduced-motion` (no entrance
animation on hundreds of cells; fade the card in once at most).

### 6.2 Progress breakdown (rework of StatTiles)
A donut or stacked segmented bar over `counts`. Use the neutral `chart-1…chart-5`
tokens (greyscale ramp) for the four segments so it stays on-brand in light + dark;
add a legend with `tabular-nums` counts and a "N words total". Keep the four raw
tiles as the compact/mobile representation if a donut is too heavy there.

### 6.3 Leaderboard snapshot (net-new)
A `Card`: small header ("Leaderboard"), top-3 rows (avatar + username + `value`,
medal accent on rank 1–3), a divider, then the pinned **you** row
(`#{me.rank} · You · {me.value}`, `tabular-nums`), and a `ghost`/`link`
"See full board" affordance. Reuse the avatar treatment from the sidebar (initial
fallback). States: opted-out / `me.rank === null` → swap the you-row for an "Appear
on the leaderboard" prompt; empty `data` → still render the you-row.

### 6.4 Deck card (reuse as-is)
The existing "Suggested for you" card
([suggested-decks.tsx](../../src/components/dashboard/suggested-decks.tsx)) is the
**one deck-card family** — `Card` + `CardContent`, name, CEFR pill, clamped
description, `vocabCount` + chevron. Reuse it; don't invent a second deck card.

---

## 7. The design system to match (the neutral user app — shadcn, light + dark)

The home screen lives in the **authenticated app shell** (`(app)` group): persistent
left sidebar + centered content column. **Match the neutral shadcn look** — *not*
the mint "Sprout" theme of `/learn` (scoped to `.learn-shell`; see
[sprout_design_system_reference.md](sprout_design_system_reference.md) for that, and
do **not** pull mint/`lr-*` atoms in here) and *not* the admin accent style.

### 7.1 Layout & rhythm
- **Page container:** centered column — keep the current
  `mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10` (consider `max-w-5xl` if the
  side-by-side Progress + Leaderboard row feels cramped). Vertical rhythm `gap-8`
  between major sections (matches today).
- **Page heading:** `font-heading text-2xl font-semibold tracking-tight`
  ("Welcome back, {username}").
- **Section headers:** `font-heading text-lg font-medium tracking-tight`
  ("Activity", "Progress", "Practice", "Suggested for you").
- **Primary action** is the single high-emphasis button in the hero; everything else
  is a card or a neutral/ghost control. **One primary CTA per screen.**
- **Card grids:** `grid gap-3 sm:grid-cols-2 lg:grid-cols-3` (matches Suggested
  decks / Practice today).

### 7.2 Tokens & primitives (neutral oklch greyscale — verbatim from [globals.css](../../src/app/globals.css))
Both themes are **first-class — design for `.dark` too**. The root tokens:

```css
:root {                              .dark {
  --background:  oklch(1 0 0);         --background:  oklch(0.145 0 0);
  --foreground:  oklch(0.145 0 0);     --foreground:  oklch(0.985 0 0);
  --card:        oklch(1 0 0);         --card:        oklch(0.205 0 0);
  --primary:     oklch(0.205 0 0);     --primary:     oklch(0.922 0 0);   /* near-black ⇄ near-white */
  --muted:       oklch(0.97 0 0);      --muted:       oklch(0.269 0 0);
  --muted-foreground: oklch(0.556 0 0);--muted-foreground: oklch(0.708 0 0);
  --accent:      oklch(0.97 0 0);      --accent:      oklch(0.269 0 0);
  --border:      oklch(0.922 0 0);     --border:      oklch(1 0 0 / 10%);
  --ring:        oklch(0.708 0 0);     --ring:        oklch(0.556 0 0);
  --destructive: oklch(0.577 …);       --destructive: oklch(0.704 …);
  /* chart-1…chart-5: a light→dark greyscale ramp — use for the heatmap & donut */
}
```

- Colours are **Tailwind theme tokens** (not raw CSS vars like `.learn-shell`):
  `bg-background`, `bg-card`, `text-muted-foreground`, `bg-primary`,
  `border-border`, `ring-ring`, `bg-destructive`, `bg-chart-1…5`.
- **There is no brand accent colour here** — emphasis comes from `foreground` /
  `primary` contrast, not hue. The heatmap and donut should use the greyscale
  `chart-*` ramp / `foreground` opacity tints, not invented greens.
- **Components — reuse shadcn/ui, don't reinvent:** `Card` / `CardContent` /
  `CardHeader` (with `size="sm"` for compact tiles — see
  [card.tsx](../../src/components/ui/card.tsx); cards already carry
  `ring-1 ring-foreground/10` + `rounded-xl`), `Button` + `buttonVariants`
  (`default` / `outline` / `ghost`; sizes `sm`/`lg`/`icon`), `Tooltip` (heatmap
  cells), `Badge` (CEFR / metric pills), `Progress` or a hand-rolled bar (daily
  goal), `Skeleton` (loading), `Avatar` (header + leaderboard), `Tabs` (board
  toggle, if built).
- **Radii:** base `--radius` 0.625rem → cards `rounded-xl`, controls `rounded-lg`,
  small pills `rounded-md`. **Borders:** soft (`border-border/60`) over hard lines;
  hover lift on interactive cards = `transition-shadow group-hover:ring-foreground/20`
  (the existing card idiom).
- **Icons:** `lucide-react`. In use / suggested: `HomeIcon`, `FlameIcon` (streak),
  `PlayIcon` (CTA), `CalendarDaysIcon` / `RefreshCwIcon` / `TagIcon` / `LayersIcon`
  (practice modes), `TrophyIcon` / `MedalIcon` (leaderboard), `ChevronRightIcon`,
  `Volume2` (audio), `Plus` (add word).
- **Numbers:** `tabular-nums` everywhere a count or rank can change
  (streak, due count, leaderboard value/rank, totals). **Muted text:**
  `text-muted-foreground`.

### 7.3 Tone
Calm, clean, dense-but-readable. Neutral surfaces, soft borders, rounded corners,
restrained shadows (the `ring-1` is the card edge). The streak flame and the heatmap
are the only spots for a little warmth/celebration — keep it subtle and theme-safe.

---

## 8. States to design (empty / gated / loading / error)

The page fetches on the **server** for `me` / `stats` / `suggested`; the heatmap and
leaderboard are best as **client components** that fetch on mount (so design their
own loading + error states). Cover:

| State | Trigger | Treatment |
|---|---|---|
| **Brand-new user (no activity)** | `stats.counts` all 0, `dueNow: 0`, `streakDays: 0`; `/me/activity` → `totalReviews:0, days:[]` | Hero → "Ready to learn your first words?" + "Start your first session" (today's `total === 0` branch). Heatmap → full empty grid + "Start learning to light up your calendar." Hide the Progress donut (or show an empty hint). |
| **All caught up** | `dueNow === 0`, `nextDueAt` set | Hero → "You're all caught up" + "Next review {formatTimeUntil(nextDueAt)}" + a "Get ahead" CTA. |
| **No streak yet** | `streakDays === 0` | Muted flame + "No streak yet" (don't show a 0). |
| **Suggested decks empty** | `decks.length === 0` | Render nothing for that section (current behaviour). |
| **Leaderboard — opted out / no rank** | `me.rank === null` (opt-out or no qualifying activity) | Replace the rank with "Appear on the leaderboard" (→ profile setting) or "Study a word to join the board." Always still render the top-3. |
| **Leaderboard — `new_words` board** | `501` from `metric=new_words` | If a toggle exists, mark the "This week" tab "Coming soon" / disabled. |
| **Loading (client cards)** | heatmap / leaderboard fetch in-flight | `Skeleton` — a shimmer grid block for the heatmap, 3–4 skeleton rows for the board. |
| **Error** | `stats` null / fetch fails | Keep today's calm fallback card ("We couldn't load your progress right now. Refresh to try again."); per-card error + retry for the client cards — don't blank the whole page. |
| **`401` session expired** | any call 401s | Defer to the app-shell guard (redirect to `/login`); don't design a bespoke per-card auth state. |

> **Onboarding nudge — note:** the `(app)` layout redirects `!isOnboarded` users to
> `/onboarding` before `/dashboard` renders, so you generally **won't** need an
> onboarding card on the home screen. The capability map mentions one for
> completeness; treat it as out of scope unless the redirect changes. The
> **email-verify** banner is already rendered by the layout — don't duplicate it.

---

## 9. Constraints & edge cases to design a state for

- **Timezone:** always send the device `tz` to `/me/activity`; re-fetch if it
  changes. Heatmap day buckets (local `tz`) and streak (UTC day) can disagree by one
  day around local midnight — that's expected, don't reconcile.
- **Activity range:** default 53 weeks; range capped server-side (>366 days → `400`).
- **One source, two views:** the streak (`/me/stats`) and the heatmap
  (`/me/activity`) read the same `learning_activity` log — keep their copy
  consistent ("14-day streak" and a 14-cell tail should feel like the same fact).
- **Leaderboard freshness:** values cache ~1–2 min; refetch on tab focus, never poll.
- **Avatar may be null** (`avatarUrl: null`) → fall back to the username initial in a
  `bg-muted` circle (the sidebar already does this — reuse the idiom).
- **Counts are live-ish:** `dueNow` / `counts` change as the user studies; the home
  screen is a snapshot — re-fetch on navigation back rather than caching hard.
- **Errors to have states for:** `400` (bad range/params — shouldn't happen with the
  defaults), `401` (session → app-shell redirect), generic → per-card retry. Never
  let one failing card blank the page.

---

## 10. Design goals (the bar to hit)

1. **Answer "am I on track + what now" above the fold.** Streak, daily goal, due
   count, and one primary button — visible without scrolling on a laptop.
2. **One primary CTA.** "Continue learning" is the only high-emphasis button; every
   other action is a card or a neutral/ghost control.
3. **Make the motivational layer earn its space.** The heatmap, progress donut, and
   leaderboard should feel rewarding, not like filler — they're *why* this redesign
   exists.
4. **Stay native to the neutral user-app design system** (§7) — shadcn `Card` /
   `Button` / `Badge` / `Tooltip`, greyscale tokens, **light + dark both
   first-class**. No mint, no admin accents, no invented hues.
5. **One card family.** The deck card, stat cards, heatmap card, and leaderboard card
   share the same `Card` scaffold (`rounded-xl`, `ring-1 ring-foreground/10`, soft
   borders, `size="sm"` for compact tiles).
6. **Never blank the page on partial failure.** Each data source degrades to its own
   empty / loading / error state independently.
7. **Accessibility:** colour is never the only signal (heatmap tooltips carry
   counts; donut has a legend); honour `prefers-reduced-motion`; `tabular-nums` on
   all changing numbers.

---

## 11. Screen checklist for the designer

Design at minimum, in **both light and dark**:

- [ ] **Header + greeting:** "Welcome back, {username}" + avatar (null → initial).
- [ ] **Today hero:** streak flame, daily-goal ring/bar, adaptive heading
      (`due` / `caught-up` / `first-time`), single primary CTA, today-progress bar.
- [ ] **🆕 Activity heatmap card:** 53-week grid, intensity buckets, month/weekday
      labels, legend, hover tooltip; **empty** (no activity) + **loading** + **error**.
- [ ] **Progress breakdown:** donut/segmented bar over `counts` + legend + total;
      empty (all-zero) state.
- [ ] **🆕 Leaderboard snapshot card:** top-3 (medals), pinned "you" row, link to
      full board; **opted-out / no-rank** prompt; **loading** + **error**.
- [ ] **Practice / quick actions:** the modes grid (+ any added entry points).
- [ ] **Suggested decks:** reuse the deck-card row; hidden when empty.
- [ ] **Responsive:** single column (mobile) → side-by-side Progress + Leaderboard
      (`lg`); heatmap scrolls horizontally on small screens.
- [ ] **Cross-cutting:** the neutral `Card` family, per-card loading/empty/error
      states, `tabular-nums` numbers, reduced-motion compliance.

> Keep this file current: when the home screen's data sources or surfaced sections
> change, update §4–§5 here in the same PR (alongside
> [user_capabilities.md](../api/user_capabilities.md)).
