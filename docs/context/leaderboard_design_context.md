# Design context — Leaderboard screen (`/leaderboard`)

A self-contained brief for **building the full Leaderboard screen** a signed-in,
non-admin user (`role = 'user'`) reaches from the **Leaderboard** sidebar entry and the
home **rank teaser**. This is the screen that [§9.2 of the homepage redesign
brief](homepage_redesign_design_context.md) spun off and seeded — **this file is the full
spec; that section was only the seed.** Everything a designer needs is here; you should
**not** need to read the codebase.

> **Status: built (words-mastered all-time).** [/leaderboard](../../src/app/(app)/leaderboard/page.tsx)
> now renders the medal-cards podium + ranked list + pinned "you" row, backed by
> [getLeaderboard](../../src/lib/me/leaderboard.ts). The home also reads the caller's own
> standing for its tiny teaser via `getMyRank` (`me` only). The opt-out switch lives in
> [/settings](../../src/app/(app)/settings/page.tsx). The weekly `new_words` tab is present
> but disabled ("Soon") until backend Phase 2.
>
> **Light theme only.** Like every branded user surface, this is a single, fully
> art-directed light theme. **Do not design a dark variant.**
>
> **Violet is this screen's accent.** App-wide, **color means something**: violet
> (`--violet`) owns *leaderboard / social*. The sidebar item, the medals, and the pinned
> "you" row all carry violet. (Mint stays the brand/CTA; amber = streak; sky = activity.)

> Source of truth for the *API behaviour*: [community_leaderboard.md](../api/community_leaderboard.md).
> Source of truth for the *brand system* (tokens, type, atoms, verbatim CSS):
> [sprout_design_system_reference.md](sprout_design_system_reference.md).
> The privacy opt-out contract: [users_profile.md](../api/users_profile.md). Shared
> conventions (base URL, `Authorization: Bearer`, error shape) live in
> [frontend_handoff.md](../api/frontend_handoff.md). **If a doc and this file disagree,
> the API doc / the live CSS wins.**

---

## 1. The big picture (what we're building)

`/leaderboard` is the app's **social proof-of-progress** screen: a ranked list of the top
learners, with the caller's own standing always pinned so they see where they stand even
when they're nowhere near the top. It exists to turn a solitary SRS habit into a *gently
competitive* one — "depth" first (total words mastered), with a weekly "race" board
arriving later.

The spine of the screen, one sentence:

> **See who's ahead → see exactly where *I* stand → feel the pull to study one more word.**

```
   WHO'S AHEAD?              WHERE AM I?                 WHAT BOARD?
  ┌──────────────┐         ┌──────────────┐           ┌──────────────────────┐
  │ 🥇 top 3      │  ───▶   │ #87 · You    │  ◀── tabs │ Mastered (all-time)  │
  │ medal podium  │         │ pinned row   │           │ This week (soon)     │
  └──────────────┘         └──────────────┘           └──────────────────────┘
     data[0..2]               me.rank                    metric / window toggle
```

### The vocabulary (use these words in the UI)

| In the UI the user sees… | …which in the API is a… |
|---|---|
| **Words mastered** | `value` when `metric=words_mastered` |
| **New words this week** | `value` when `metric=new_words` |
| **Rank** / **#N** | `rank` |
| **You** | the `me` row |

Keep labels consistent with the rest of the app — **"Word"**, **"mastered"**, **"streak"**.

---

## 2. Brand & color system (inherited, with violet foregrounded)

This screen lives inside the shared **`.app-shell`** brand scope (the same Sprout mint
tokens that power `/learn` and the home). Design against the live tokens — don't invent
hues. The full palette is in [sprout_design_system_reference.md §2](sprout_design_system_reference.md);
the ones that matter here:

```css
/* social / leaderboard accent — THIS SCREEN'S signature */
--violet:      #7b6cff;
--violet-soft: #ece9ff;

/* brand + surfaces (shared) */
--primary:        #12bd8a;   /* mint — brand, kept for any "go study" CTA */
--surface:        #ffffff;   /* cards / rows */
--card-2:         #f6faf8;   /* sunken / secondary */
--app-bg:         #eaf1ed;   /* page field */
--ink:            #15241e;   --ink-2: #5b6b64;   --ink-3: #91a09a;
--line:           #e9efeb;   --line-2: #dde6e1;

/* medals (ranks 1–3) — warm metals over the violet screen */
--amber:   #ffb020;   /* gold-ish #1 */
/* silver #2 / bronze #3: derive from --ink-3 / --amber-2 (#ff7a1a) — keep them readable, not gaudy */
```

- **Accent rule:** violet is the *social* color. Medals, the "you" band, the active board
  tab, and rank flourishes lean violet (with warm metals for the top-3 podium only). Mint
  appears only if you add a "go study" nudge (e.g. on the empty/opted-out state).
- **Page field & header band** (same idiom as the home, §2.2 of the homepage brief), but
  the hero wash leans violet here:

```css
/* page field */
background:
  radial-gradient(120% 80% at 50% -10%, rgba(123,108,255,0.07), transparent 60%),
  var(--app-bg);

/* header band behind the title + board tabs — violet wash */
background:
  radial-gradient(120% 120% at 0% 0%, rgba(123,108,255,0.14), transparent 55%),
  radial-gradient(120% 120% at 100% 0%, rgba(18,189,138,0.10), transparent 55%),
  var(--surface);
```

### Type

- **Plus Jakarta Sans** — all UI text, labels, usernames, the board tabs.
- **Newsreader (serif)** — **display** moments: the screen title, the big **rank numbers**
  on the podium, and the "you" rank. The serif is what makes a ranked list feel *crafted*.
- **`tabular-nums` everywhere** a rank or value appears — the columns must align as values
  change.

### Radii, shadows, atoms

```css
--r-card: 30px;   --r-tile: 18px;   --r-chip: 999px;
```

- Container card / podium = `--surface`, `--r-card`, `--sh-md`/`--sh-lg`; list rows sit
  inside it on `--line` dividers.
- **Reuse the Sprout atoms** (verbatim CSS in [sprout_design_system_reference.md §4](sprout_design_system_reference.md))
  before inventing: `.lr-chip` / `.lr-typepill` (the board tabs, the "You" pill), `.lr-btn`
  (any CTA — e.g. "Appear on leaderboard"), `.lr-sk` (skeleton rows), `.lr-icon-btn`. Avatar
  fallback = username initial in a `--primary-soft` (or `--violet-soft`) circle, exactly as
  elsewhere.
- Motion: a light `.lr-stagger` reveal on rows is fine; **no** flashy rank animations.
  Honour `prefers-reduced-motion`.

---

## 3. The API this screen runs on

**One endpoint.** `GET /v1/leaderboard` — **JWT required**. Full contract:
[community_leaderboard.md](../api/community_leaderboard.md). Distilled:

### 3.1 Request

```http
GET /v1/leaderboard?metric=words_mastered&window=all&limit=50
Authorization: Bearer <accessToken>
```

| Query param | Default | Rules |
|---|---|---|
| `metric` | `words_mastered` | `words_mastered` \| `new_words` |
| `window` | depends | `words_mastered` → **only `all`** (others → `400`); `new_words` → `week` (also `month`) |
| `limit` | `50` | max `100` |

### 3.2 Response `200`

```jsonc
{
  "metric": "words_mastered", "window": "all",
  "periodStart": null, "periodEnd": "2026-06-19T09:00:00.000Z", "limit": 50,
  "data": [
    { "rank": 1, "userId": "9f1a…", "username": "alice_99", "avatarUrl": "https://…/a.png", "value": 320 },
    { "rank": 2, "userId": "3c2b…", "username": "bao_le",   "avatarUrl": null,             "value": 295 },
    { "rank": 3, "userId": "7d4e…", "username": "minh",     "avatarUrl": null,             "value": 270 }
  ],
  "me": { "rank": 87, "value": 14 }   // me.rank null → no activity / opted out
}
```

| Field | Drives in the UI |
|---|---|
| `data[].rank` | row number (1-based, **sequential — no shared ranks**; ties broken by username) |
| `data[].username` / `avatarUrl` | row identity (avatar may be null → initial fallback) |
| `data[].value` | the metric count, right-aligned, `tabular-nums` |
| `me` | the **caller's** pinned "you" row (`{ rank, value }`); **always present** even when the caller isn't in `data` |
| `periodStart` / `periodEnd` | only relevant for `new_words` — caption "This week (Mon → now)"; `null` start for `all` |

- `data` lists **only eligible users with `value > 0`** (real `role=user`, active,
  **not** opted out). Don't render zero-value or opted-out users.
- `me.rank` is `null` and `value` `0` when the caller has **no qualifying activity** or has
  **opted out** — design that state (§6).

### 3.3 Status — what's live vs. coming soon

> **Build the board toggle now; gate the second tab on a live response.**

| Board (tab) | Query | Status |
|---|---|---|
| **Mastered (all-time)** | `metric=words_mastered&window=all` | ✅ **Live** — the default board |
| **New words this week** | `metric=new_words&window=week` | 🚧 **Not live** — returns **`501`** until Phase 2 (activity log). Render the tab as **"Coming soon"** / disabled. |

Phase 2 is tracked in [community_leaderboard_plan.md](../plans/community_leaderboard_plan.md).
When the `new_words` call stops returning `501`, the tab activates with **no redesign**.

---

## 4. The screen to lay out

A branded field (§2), a **header band** with the title + board tabs, then a **podium** for
the top 3 and a **ranked list** for the rest, with the **"you" row pinned**. Container
`max-w-3xl`–`max-w-4xl`, centered, `gap-8` rhythm (a leaderboard reads best narrow).

```
  ╭──────────────────────────────────────────────────────────────────╮
  │  HEADER BAND  (violet wash, §2)                                   │
  │  🏆 Leaderboard                                       (serif)     │
  │  See how your words-mastered rank stacks up.                      │
  │  ┌─────────────────────────┐  ┌──────────────────────┐           │
  │  │ ● Mastered (all-time)   │  │ This week · Soon (⌀)  │  ← tabs   │
  │  └─────────────────────────┘  └──────────────────────┘           │
  ╰──────────────────────────────────────────────────────────────────╯

  ┌──────────────────────── PODIUM (top 3) ─────────────────────────┐
  │              ╭─────╮                                             │
  │     ╭─────╮  │  🥇 │  ╭─────╮         #1 alice_99 · 320          │ ← serif ranks,
  │     │ 🥈 2│  │  1  │  │ 🥉 3│            medals, avatars          │   violet/metal
  │     ╰─────╯  ╰─────╯  ╰─────╯                                    │
  └─────────────────────────────────────────────────────────────────┘

  ┌──────────────────────── RANKED LIST (4 … N) ────────────────────┐
  │  #4   ◯ huy_tran                                      210        │
  │  #5   ◯ lan.pham                                      188        │
  │  …                                                              │
  │  #50  ◯ duc99                                          61        │
  └─────────────────────────────────────────────────────────────────┘

  ┌─ PINNED ── (violet-soft band, sticky at bottom of the list) ─────┐
  │  #87  ◯ You                                            14        │ ← me row
  └─────────────────────────────────────────────────────────────────┘
```

- **Board tabs** = the `metric`/`window` pair, styled as `.lr-typepill` segmented control.
  Active tab violet (`--violet-soft` fill, `--violet` text). The **"This week"** tab shows a
  **"Soon"** badge and is disabled until the `new_words` call succeeds (§3.3).
- **Podium (top 3):** medal styling — **#1 gold** (`--amber`), #2 silver, #3 bronze — bigger
  avatars, **serif rank numbers**, value beneath. Optionally raise #1 a step. On a single
  source of truth: these are just `data[0..2]`; if fewer than 3 rows exist, degrade
  gracefully (no empty pedestals).
- **Ranked list (rank ≥ 4):** plain rows inside the container card — `#rank` (muted, serif
  or `tabular-nums`), avatar + username, **value right-aligned** (`tabular-nums`). Rows
  divided by `--line`; hover lift optional.
- **Pinned "you" row:** the `me` row on a **`--violet-soft`** band that **stays visible while
  the list scrolls** (sticky bottom). Format `#{me.rank} · You · {me.value}`. If `me` already
  appears within the visible `data`, **highlight that in-list row** with the violet band
  instead of duplicating it at the bottom (and you may skip the sticky copy).

**Responsive intent:** the podium stacks to a vertical 1-2-3 (or collapses into the top of
the list) on mobile; the list is full-width; the "you" row stays pinned. Single column
throughout — a leaderboard doesn't need a bento.

---

## 5. Behaviour & refresh

- **Default board:** load `metric=words_mastered&window=all` on entry. Switching tabs
  refetches with the new `metric`/`window`.
- **Don't poll.** The server caches ~1–2 min and values only drift as people study.
  **Refetch on tab focus / pull-to-refresh**, not on an interval.
- **`me` is always rendered** — even outside the top N, even when `data` is empty, even when
  opted out (as the prompt state, §6). The "you" row is the one element that must never be
  missing.
- **Avatar null → initial fallback** in a tinted circle (reused everywhere).
- The screen is a **read-only** leaderboard. The only action is the **board toggle** plus,
  in the opted-out/no-rank state, a link to **Settings**.

---

## 6. States to design

| State | Trigger | Treatment |
|---|---|---|
| **Loading** | fetch in-flight | `.lr-sk` shimmer — a podium skeleton + ~8 list rows + a "you" row skeleton. **Never** blank the screen. |
| **Populated** | `data.length ≥ 1` | Podium (top 3) + ranked list + pinned "you" row (§4). |
| **Thin board** | `1 ≤ data.length < 3` | Render what exists; **no empty pedestals** — collapse the podium to the rows you have, or skip straight to the list. |
| **Empty board** | `data` is `[]` (early days, esp. weekly) | Friendly line — Mastered: *"No one's reached mastery yet — be the first."* / Weekly: *"No one's studied yet this week — be the first."* **Still render the `me` row.** |
| **You, ranked** | `me.rank` is a number | Pin the violet "you" row; if `me.rank ≤ limit`, highlight the in-list row instead of a duplicate (§4). |
| **You, no rank / opted out** | `me.rank === null` | **Swap the "you" row for a prompt:** *"Study a word to join the board"* (no activity) **or** an **"Appear on the leaderboard"** CTA → **Settings** (`leaderboardOptOut`, §7). Don't show a fake `#— · You`. |
| **"This week" not live** | `metric=new_words` → **`501`** | Keep the tab visible but **disabled with a "Coming soon"** treatment; never surface a raw error. The all-time board stays the default. |
| **Bad combo** | `400` (e.g. `words_mastered` + `window=week`) | Shouldn't happen if tabs are wired to valid pairs — guard the toggle so an invalid `metric`/`window` is unreachable. |
| **Error** | fetch fails / network | Calm in-card fallback — *"We couldn't load the leaderboard right now."* + retry. **Don't** blank the page. |
| **`401` session expired** | any call 401s | Defer to the app-shell guard (redirect `/login`); no bespoke auth UI here. |

---

## 7. Privacy — the leaderboard opt-out

Appearing on the board is **opt-out**, controlled by the user, surfaced in **Settings** (not
on this screen, but this screen reflects it). Contract in
[users_profile.md](../api/users_profile.md):

- Field **`leaderboardOptOut: boolean`**, edited via **`PATCH /v1/users/:id`**. Current value
  is on the user object from `GET /v1/users/:id` and `GET /v1/auth/me`.
- Settings shows it as an **"Appear on leaderboard"** switch (on = `leaderboardOptOut:false`).
- An opted-out user is **absent from everyone's `data`** *and* from the rank denominator;
  their own `me` returns `{ rank: null, value: 0 }`.
- On this screen, an opted-out caller hits the **"Appear on the leaderboard"** prompt state
  (§6) linking straight to Settings — turning the toggle on puts them back on the board.

---

## 8. Design goals (the bar to hit)

1. **It feels like the same product as `/learn` and the home.** Sprout mint shell, serif
   ranks, the Sprout atoms — with **violet** as the social signature.
2. **The "you" row is sacred.** Always present, always findable, pinned and violet — the
   user must see where they stand within one glance, no scrolling hunt.
3. **Top 3 feel earned.** A real podium with warm-metal medals and serif numbers, distinct
   from the plain ranked list below.
4. **Color means something.** Violet = leaderboard/social, app-wide-consistent; medals are
   the only warm exception. Label/medal shape carries rank, **not color alone** (§9).
5. **Honest about what's live.** All-time board ships; the weekly board is a visible but
   disabled "Coming soon" tab — never a raw `501`.
6. **Don't poll; refetch on focus.** Respect the server cache; the board is a snapshot.
7. **Never blank the screen.** Loading → skeleton; empty → friendly first-mover line; error
   → calm retry. The `me` row survives all of them.

---

## 9. Constraints & cross-cutting

- **Light only** — no dark variant.
- **Accessibility:** color is never the only signal — rank is carried by the **number** and
  the **medal shape/position**, not hue; `tabular-nums` on every rank and value; the board
  tabs are a real, keyboard-navigable segmented control; the disabled "This week" tab is
  marked `aria-disabled` with its "Coming soon" reason. Honour `prefers-reduced-motion`.
- **Sequential ranks, no ties** — the API guarantees 1-based sequential ranks (ties broken
  by username), so don't design shared-rank "T-3" styling.
- **Values are live-ish** — they change as people study; the screen is a snapshot, refetch on
  return rather than caching hard.
- **One endpoint, JWT-gated** — the whole screen is behind auth; an unauthenticated hit is an
  app-shell redirect, not a state to design.

---

## 10. Screen checklist for the designer

Design at minimum (light theme):

- [ ] **Brand pass:** violet-washed header band + page field (§2), serif title and rank
      numbers — reads as the Sprout family with the social accent.
- [ ] **Board tabs:** segmented `.lr-typepill` control; **Mastered (all-time)** active by
      default; **This week** present but **disabled "Coming soon"** (gated on a live
      `new_words` response).
- [ ] **Podium (top 3):** medal styling (gold/silver/bronze), larger avatars, serif ranks +
      values; graceful with < 3 entries.
- [ ] **Ranked list (≥ 4):** `#rank` + avatar + username + right-aligned `tabular-nums`
      value, `--line` dividers.
- [ ] **Pinned "you" row:** violet-soft, sticky, `#{rank} · You · {value}`; highlight the
      in-list row when `me` is in the visible page instead of duplicating.
- [ ] **States:** loading skeleton, populated, thin board, empty (first-mover line),
      you-ranked, **you-no-rank/opted-out prompt → Settings**, weekly-`501` coming-soon,
      generic error retry — the `me` row present in all.
- [ ] **Privacy tie-in:** the opted-out state links to the **"Appear on leaderboard"** switch
      in Settings (`leaderboardOptOut`, §7).
- [ ] **Responsive:** podium stacks, list full-width, "you" row stays pinned; single column.
- [ ] **Cross-cutting:** `tabular-nums`, color-never-alone, reduced-motion, refetch-on-focus
      (no polling), light only.

> Keep this file current: when the leaderboard's metrics, windows, or the Phase-2 weekly
> board change, update §3 here in the same PR (alongside
> [community_leaderboard.md](../api/community_leaderboard.md)).
