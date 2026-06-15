# Design context — Learn page entry redesign (the "What's the plan?" hub)

A self-contained brief for **redesigning the `/learn` entry screen** — the screen a
signed-in user lands on *before* a study session starts (no `mode` in the URL).
Everything a designer needs is here; you should **not** need to read the codebase.

> Source of truth for the *brand system* (tokens, type, atoms, verbatim CSS):
> [sprout_design_system_reference.md](sprout_design_system_reference.md).
> Source of truth for the broader study flow: [learn_flow_design_brief.md](learn_flow_design_brief.md).
> If a doc and the live CSS disagree, the live CSS wins.

> **Light theme only.** `/learn` is a single, fully art-directed light theme (the
> **Sprout mint system**). **Do not design a dark variant.**

---

## 1. The big picture (what we're redesigning)

`/learn` (no `mode`) is the **launchpad into a study session**. Today it's a small
centered card stack titled *"What's the plan?"* offering four choices:

1. **Daily mix** — a balanced auto-picked set (hero, starts immediately).
2. **Review** — cards due for spaced repetition (shown only when some are due).
3. **By topic** — pick a theme.
4. **By deck** — study a saved word set.

The spine in one sentence:

> **Land on the study launchpad → see what I can study right now → start a session in
> one click.**

---

## 2. The problem with the screen today

The current entry is a **router, not a browser**. See the reference screenshot: a
mostly-empty viewport, vertically centered, with a Daily-mix hero and two tiles
("By topic", "By deck").

- **"By topic" and "By deck" are dead-ends.** They don't show anything — they navigate
  to a *second* screen (a topic picker / a deck picker) where the real choices live. So
  choosing a topic or a deck costs **2 clicks + a page load** to reach content that
  could have been on screen the whole time.
- **The layout wastes space.** It's `min-height` + vertically centered, so the entire
  lower half of the viewport is empty. It reads as "too simple / unfinished."
- **No sense of "what's here."** The user can't see *their* decks or the available
  topics at a glance — the screen hides the catalog behind generic category tiles.

**Goal:** turn the entry into a single **scannable, sectioned hub** that surfaces the
actual study options (topics, the user's decks) up front, so a session starts in **one
click** and the page feels full and alive.

---

## 3. Chosen direction (decided)

A single **scrollable page with clearly separated sections**, each section a
**horizontal scroll rail** (a snapping row of cards, carousel-style). This was chosen
over "inline everything in full grids" (can get very tall) and "preview + see all"
(keeps the dead-end). Rails stay compact vertically while still showing real content.

```
READY TO STUDY ─────────────────────────────────────────────  [ 🔥 3-day ]
What's the plan?

QUICK START
┌──────────────────────────────────────────────────────────────────────┐
│  ✦   Daily mix                                              [ Start → ]│   ← hero, full width, mint gradient
│      A balanced set picked for you today                               │
└──────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────┐
│  ↻   Review                                                 [ 12 due ] │   ← only when cards are due
│      Cards due for their next look                                     │
└──────────────────────────────────────────────────────────────────────┘

BY TOPIC                                                        See all →
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  🏷    │ │  🏷    │ │  🏷    │ │  🏷    │ │  🏷    │  →  (scrolls)      ← snapping rail of topic cards
│  Food  │ │  Work  │ │ Travel │ │ Sport  │ │  Tech  │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘

YOUR DECKS                                                      See all →
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  📖           │ │  📖           │ │  📖           │  →  (scrolls)       ← snapping rail of deck cards
│  Deck A       │ │  Deck B       │ │  Deck C       │
│  84 words·EN  │ │  40 words·EN  │ │  120 words·EN │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Section-by-section rules

- **Header** — eyebrow `READY TO STUDY`, H1 *"What's the plan?"*, and a streak badge
  (`🔥 N-day`) on the right **only when `streakDays > 0`**.
- **Quick start** — the **Daily mix hero** (full-width, mint gradient, always present)
  and below it the **Review** card (**render only when `dueNow > 0`**). Both start a
  session immediately.
- **By topic** — a horizontal rail of topic cards (icon tile + name). **Render the whole
  section only when topics exist.** Each card links **straight into a session** for that
  topic. `See all →` deep-links to the full topic picker.
- **Your decks** — a horizontal rail of the user's deck cards (icon + name + `N words ·
  language · CEFR badge`). Each card links **straight into a session** for that deck.
  `See all →` deep-links to the full deck picker. **When the user has no decks**, replace
  the rail with a single CTA card ("No decks yet — browse the community to add one").
- Every topic/deck card is **one click to start** — no intermediate picker.

### Behavior / responsive

- The page **scrolls top-aligned** (not vertically centered) — kill the empty lower half.
- Rails: hide the scrollbar, snap to card start, let cards **bleed to the page padding**
  on the right so it's obvious more cards exist. Touch-drag on mobile, trackpad/shift-wheel
  on desktop. Honor `prefers-reduced-motion`.
- One container max-width (~ `max-w-3xl`), comfortable section spacing.

---

## 4. Data available to the screen (already fetched server-side)

All three are fetched in parallel on the server and passed as plain props. Treat any as
possibly empty.

**Stats** (`StatsResponse | null`) — the quick-start + streak read:
```ts
{
  streakDays: number;     // streak badge; hide badge when 0
  dueNow: number;         // Review card + "N due"; hide Review when 0
  reviewedToday: number;
  dailyGoalMinutes: number;
  counts: { new: number; learning: number; review: number; mastered: number };
  nextDueAt: string | null;
}
```

**Topics** (`Topic[]`) — the "By topic" rail:
```ts
{ id: string; slug: string; name: string; description: string | null; iconUrl: string | null }
```

**Decks** (`DeckSummary[]`) — the "Your decks" rail (the caller's own decks, newest first):
```ts
{
  id: string;
  name: string;
  description: string | null;
  language: string;        // render via a language-label helper, e.g. "English"
  cefrLevel: "A1"|"A2"|"B1"|"B2"|"C1"|"C2" | null;  // small badge when present
  vocabCount: number;      // "N words"
  visibility: "system" | "public" | "private";
  ownerId: string | null;
}
```

### Where each action goes (URL contract — keep exact)

| Action            | Link                                   |
|-------------------|----------------------------------------|
| Daily mix         | `/learn?mode=daily`                    |
| Review            | `/learn?mode=review`                   |
| A specific topic  | `/learn?mode=topic&topicSlug=<slug>`   |
| A specific deck   | `/learn?mode=deck&deckId=<id>`         |
| Topic "See all"   | `/learn?mode=topic`  (full topic picker) |
| Deck "See all"    | `/learn?mode=deck`   (full deck picker)  |
| Empty-decks CTA   | `/community`                           |

---

## 5. Brand system — reuse, don't reinvent

The `/learn` routes already ship a complete **Sprout mint** design language (fonts +
tokens + card/atom CSS), scoped under `.learn-shell`. **Reuse it.** Full token + atom
reference: [sprout_design_system_reference.md](sprout_design_system_reference.md).
Key pieces this screen leans on (all already defined in `globals.css`):

- **Type:** `Plus Jakarta Sans` (UI), `Newsreader` serif (vocab/sentences). Headings are
  extra-bold, tight tracking.
- **Surface:** `.learn-card` — the soft white card (rounded, soft shadow). Cards lift on
  hover (`hover:-translate-y-0.5`).
- **Eyebrow:** `.lr-eyebrow` — the small uppercase tracked section label (`READY TO STUDY`,
  `QUICK START`, `BY TOPIC`, `YOUR DECKS`).
- **Streak chip:** `.lr-streak` + `.lr-flame.lit` — the amber flame pill.
- **Stagger-in:** `.lr-stagger` (entrance animation on rail children), `.learn-anim-in`
  (page fade-up).
- **Rail:** `.lr-rail` — the horizontal snapping scroll row (scrollbar hidden, edge bleed,
  children don't shrink).
- **Soft tints** for icon tiles: `--primary-soft` (mint), `--violet-soft`, `--sky-soft`,
  `--amber-soft`, each with a matching ink color. Cycle them across topic cards.
- **Hero gradient:** mint `#14c08c → #0ca576`, white text, `--sh-primary` shadow.

Icons: `lucide-react`. Current set — `SparklesIcon` (daily mix), `RefreshCwIcon`
(review), `TagIcon` (topic), `BookOpenIcon` (deck), `FlameIcon` (streak),
`ArrowRightIcon` / `ChevronRightIcon` (affordances).

---

## 6. Technical constraints (for an implementing pass)

- **Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4** (CSS-first,
  no JS config — tokens live in `globals.css` `@theme`). shadcn/ui for primitives.
- **Server Components by default.** The entry page fetches stats + topics + decks on the
  server and passes serializable props down. The hub itself is presentational and can be
  a Server Component (it's all `<Link>` navigation — no client state needed). Push any
  `"use client"` to a leaf only if a rail needs JS controls.
- Style with Tailwind utilities + the existing `.learn-*` / `.lr-*` classes; merge with
  the `cn()` helper. Prefer theme tokens over hardcoded values.
- The topic/deck **sub-pickers still exist** and are the `See all →` targets — don't
  delete them; the hub just makes them optional.

---

## 7. Acceptance (what "done" looks like)

- Landing on `/learn` shows a **full, sectioned page**, not a half-empty centered card.
- A user can start **Daily mix, Review, a specific topic, or a specific deck** each in
  **one click** — no intermediate picker for the common case.
- Topics and the user's decks are **visible on the entry** (in rails), not hidden behind
  category tiles.
- Empty/edge states handled: no streak (hide badge), nothing due (hide Review), no topics
  (hide section), no decks (CTA card).
- Reads as the **same product** as a Learn session — Sprout mint, same cards, same type.
- Light theme only; respects `prefers-reduced-motion`.
```

---

### Reference screenshot (today's screen)

Centered "What's the plan?" with a Daily-mix hero and two category tiles ("By topic",
"By deck") — the entire lower half of the viewport is empty. This is the screen being
replaced.
