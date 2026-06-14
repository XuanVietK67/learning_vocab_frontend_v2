# Design context — Share a list & get lists from the community

A self-contained brief for designing the two screens/flows that turn the existing
private **Lists** feature into a social one:

1. **Share a list** — let an author publish one of their own lists to a public
   community catalog (and unpublish it again).
2. **Get a list from the community** — let anyone browse that catalog, preview a
   public list, and **clone** it into their own account as a fresh private list.

Everything a designer needs is here; you should **not** need to read the codebase.

> Source of truth for the *API behaviour*: [decks_share_and_clone.md](../api/decks_share_and_clone.md).
> Source of truth for the *creation spine this sits on top of*:
> [user_create_vocabulary_list_design_context.md](user_create_vocabulary_list_design_context.md)
> (My lists, list detail, add/bulk words). This file is the deep-dive on the
> **share + community** surfaces that brief only sketched at its §6.7.
> Visual system: [sprout_design_system_reference.md](sprout_design_system_reference.md).
> **If a doc and this file disagree, the API doc wins.**

---

## 1. The big picture (what we're designing)

Today the Lists feature is **private-only**: a learner creates lists and fills them
with words for personal study. This feature opens two doors:

> **Share a list → it lands in the community → someone else clones it → it becomes
> their own private list.** Sharing and getting both happen at the **list (deck)**
> level — never per single word. There is no "share one word" path.

```
   AUTHOR'S SIDE                                    LEARNER'S SIDE
 ┌──────────────┐    publish (toggle)            ┌────────────────┐
 │ My list      │ ───────────────────────────▶   │ Community grid │
 │ 🔒 Private   │    PATCH visibility:public      │ public lists   │
 └──────────────┘ ◀───────────────────────────   └────────────────┘
        ▲          unpublish (toggle back)                │ open a card
        │                                                 ▼
        │                                        ┌────────────────┐
        │            clone → fresh private copy  │ Public preview │
        └──────────────────────────────────────  │ read-only words│
            POST /clone → new 🔒 Private list      │ [Save / Clone] │
                                                  └────────────────┘
```

Three things make this feature what it is:

- **It's just `visibility` moving between `private` and `public`.** No new content
  model — publishing flips one field; the catalog reads the `public` ones; cloning
  copies one back to `private`. Design around that simplicity.
- **The community browse needs NO auth.** A logged-out visitor can see and preview
  public lists. **Cloning requires sign-in** — that's the one gate.
- **A clone is an independent private copy.** It lands under the learner's own lists
  and is theirs to edit/study; it does not stay linked to the original.

### The vocabulary (use these words in the UI)

| In the UI the user sees… | …which in the API is a… |
|---|---|
| **List** (a "vocabulary list") | **Deck** |
| **Word** | **Vocabulary** |
| **Community** / **Explore** | the public catalog (`GET /v1/decks/public`) |
| **Share to community** | publish (`visibility: "public"`) |
| **Save to my lists** / **Clone** | `POST /v1/me/decks/:id/clone` |

Keep labels consistent with the rest of the app: **"List"**, **"Word"**. (Routes/code
use `deck`/`vocabulary`; that's fine internally.)

---

## 2. What exists today vs. what's new (ground truth)

The current build (mint "Sprout" re-skin) already ships the **private** half. Reuse it.

| Surface | File | State today | This feature adds |
|---|---|---|---|
| My lists grid | [lists-screen.tsx](../../src/app/(app)/decks/lists-screen.tsx) | grid of `ListCard`, "New list", empty state | a **visibility badge** on each card; the `⋯` menu gains **Share / Make private** |
| List card | [list-card.tsx](../../src/app/(app)/decks/list-card.tsx) | accent bar, name, desc, `vocabCount`, language, `⋯` (Bulk import / Open / Delete) | badge top-right; menu items for publish |
| List detail | [list-detail-screen.tsx](../../src/app/(app)/decks/[id]/list-detail-screen.tsx) | header + word rows + add/bulk | the **Share toggle** lives in this header (owner only) |
| Community browse | — | **does not exist** | new route `/decks/community` (or `/explore`) |
| Public preview | the existing `/decks/[id]` is owner-only | **does not exist for non-owners** | a read-only preview with a **Clone** CTA |

> **The API contract is ahead of the types.** [types.ts](../../src/lib/me/types.ts)
> `DeckSummary` / `DeckDetail` currently have **no `visibility` and no `ownerId`** —
> the share/clone endpoints add them ([decks_share_and_clone.md](../api/decks_share_and_clone.md) §1).
> Design assuming those two fields exist; they are the only signal that tells the
> three list *kinds* apart.

---

## 3. The three list kinds (the one rule that drives every control)

Every list the API returns carries `visibility` + `ownerId`. Those two fields decide
**which badge** shows and **which controls** appear. There is no separate permission flag.

| Kind | `ownerId` | `visibility` | Badge | Controls to show |
|---|---|---|---|---|
| **Seeded / catalog** | `null` | `system` | "Catalog" (or none) | study only — **never** a share toggle |
| **My list** | me | `private` | 🔒 **Private** | full owner controls + **Share** toggle |
| **My shared list** | me | `public` | 🌐 **Public** | full owner controls + **Unpublish** + copy link |
| **Someone else's list** | other user | `public` | 🌐 **Public** (community) | read-only + **Clone**; **no** `⋯` menu |

- **Ownership** = `ownerId === currentUserId`. That alone decides owner-controls vs.
  read-only-with-Clone.
- **`visibility`** only changes the **badge** and the publish/unpublish wording —
  never what a *non*-owner can do.
- A `system` deck never gets a share toggle. Hide it; don't disable it.

---

## 4. API shapes that drive the UI (the minimum to design around)

Just the fields the UI reacts to — full contract in [decks_share_and_clone.md](../api/decks_share_and_clone.md).

**A list summary / detail** (community card + preview):

```jsonc
{
  "id": "8f1d…",
  "name": "IELTS Band 7 essentials",
  "description": "Words I drilled for the writing task",
  "language": "en",            // ISO 639-1 → languageLabel()
  "cefrLevel": "B2",           // A1–C2, may be null → hide the chip
  "vocabCount": 48,
  "visibility": "public",      // "system" | "public" | "private"  → badge (§3)
  "ownerId": "1111…"           // null for seeded → ownership (§3)
}
```

**Publish / unpublish** → `PATCH /v1/me/decks/:id` `{ "visibility": "public" }`
(or `"private"`). Owner + JWT. `200` returns the deck now carrying the new
`visibility`. `system` is rejected (`400`) — never offer it.

**Browse community** → `GET /v1/decks/public?language=en&cefrLevel=B2&page=1&limit=20`
— **no auth**. Returns the standard envelope; summary fields only, no words inlined:

```jsonc
{ "data": [ /* DeckSummary[] */ ], "page": 1, "limit": 20, "total": 3 }
```

Drive the pager from `total / limit`. Filters map straight to `?language=` and
`?cefrLevel=`. `total: 0` for a filter is a legitimate **empty state**, not an error.

**Preview a public list** → `GET /v1/decks/:id?translationLang=vi` — returns the
ordered `vocabularies[]`. A `private` deck you don't own returns **`404`**
(existence is hidden on purpose).

**Clone** → `POST /v1/me/decks/:id/clone` — JWT. `201` returns a **new private**
list (new `id`, `ownerId` = me, `visibility: "private"`, full ordered words).

| Status | Surface it as |
|---|---|
| `401` (clone) | not signed in → send to login, return here after |
| `404` (preview/clone) | list went private or was deleted since the grid loaded → toast "This list is no longer available" + refresh the grid |
| `400` | bad id / bad visibility — shouldn't happen from these UIs; log, don't surface |

---

## 5. Shared building blocks

### 5.1 Visibility badge — the identity cue on every card & header

Small `--r-chip` pill, `text-xs font-semibold`, tone-toned. Three states only:

```
🔒 Private   → muted: bg --muted, text --ink-3, LockIcon
🌐 Public    → mint:  bg --primary-soft, text --primary-ink, GlobeIcon
   Catalog   → seeded (ownerId null): plain --ink-3 text or no badge
```

Put it **top-right** of the `ListCard` body and inline next to the list name in the
detail header. Colour must not be the only signal — always pair the icon + label.

### 5.2 Community list card — extend the existing `ListCard`, don't reinvent

The community grid card is the **same `ListCard`** ([list-card.tsx](../../src/app/(app)/decks/list-card.tsx))
with three deltas:

- It carries the 🌐 **Public** badge.
- It has **no `⋯` menu** (you don't own it) — instead the whole card opens the
  preview, and the preview holds the **Clone** CTA.
- It may show a `by @author` line under the meta row (if the API exposes author).

Keep the accent bar, the `ListIcon` tile, name, description (clamped), and the
`vocabCount · language · CEFR` meta row identical so cards feel like one family
across My lists, Suggested, and Community.

### 5.3 Clone affordance — `Save to my lists`

Primary button on the public preview; reuse `lr-btn lr-btn--primary`. On success,
fire a **toast with a deep link** into the new list ("Saved to your lists — open").
If anonymous, the button routes to login first and returns.

---

## 6. The screens to lay out

### 6.1 Share toggle — on the owner's list detail (`/decks/:id`)

The publish control lives in the **detail header** ([list-detail-screen.tsx](../../src/app/(app)/decks/[id]/list-detail-screen.tsx)),
shown only when `ownerId === me` and `visibility !== "system"`.

```
‹ Lists
[icon] IELTS Band 7 essentials   🔒 Private        [ Add word ] [ Bulk import ] [ ⓘ Share ▸ ]
48 words · English · B2
"Words I drilled for the writing task"
─────────────────────────────────────────────────────────────────────────
 (word rows…)
```

The Share control is a **toggle** (or a button that opens a small share panel):

```
 toggled ON  → confirm dialog → PATCH { visibility:"public" } → 🌐 Public + copy-link row
 toggled OFF → PATCH { visibility:"private" }                 → 🔒 Private
```

When **Public**, reveal a shareable link to the public preview and an **Unpublish**
path (toggle back). Render the toggle state from `deck.visibility` (`public` = on).

**The privacy gate (required).** The **first** time a user publishes, show a confirm
dialog — publishing exposes **every word in the list, including their own
user-created words**, to anyone:

```
┌ Share "IELTS Band 7 essentials" with everyone? ──────────────┐
│ Anyone can find this list in the community and copy it —      │
│ including all 48 words, even the ones you added yourself.     │
│                                  [ Cancel ]  [ Share list ]   │
└──────────────────────────────────────────────────────────────┘
```

States to design: **Private (idle)** · **publishing… (button busy)** ·
**Public (with copy-link + Unpublish)** · **error (toast, revert toggle)**.

> Also surface **Share / Make private** as a `⋯` menu item on the `ListCard`
> ([list-card.tsx](../../src/app/(app)/decks/list-card.tsx)) so a user can publish
> without opening the list. Same confirm dialog gates it.

### 6.2 Community browse — `/decks/community` (new)

A filterable, paginated grid of public lists, newest first. **Renders for logged-out
visitors too** — only the clone action gates on sign-in.

```
Community                                            🔎 [ search          ]
Discover lists people have shared — copy any into your own.
Language [ English ▾ ]   Level [ Any ▾ ]
─────────────────────────────────────────────────────────────────────────
┌ ListCard 🌐 ┐ ┌ ListCard 🌐 ┐ ┌ ListCard 🌐 ┐
│ IELTS B7    │ │ Travel A2   │ │ Phrasal v.  │
│ 48 · en · B2│ │ 30 · en · A2│ │ 25 · en · A2│
│ by @lan     │ │ by @minh    │ │ by @sam     │
└─────────────┘ └─────────────┘ └─────────────┘
            ‹ Prev    page 1 / 4    Next ›
```

- Grid: same `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` rhythm as My lists.
- Filters → `?language=` / `?cefrLevel=`; debounce, **reset to page 1** on change.
- Pager driven by `{ page, limit, total }`.
- **States:** loading (skeleton cards), **empty** (`total: 0` → "No public lists yet
  for this filter." — not an error), error (retry). Logged-out is a normal state.

### 6.3 Public preview — read-only list (`/decks/:id` for a non-owner)

The community detail. Read-only ordered word list; the only write action is **Clone**.
Pass `?translationLang=` so each word shows the viewer's language.

```
‹ Community
[icon] IELTS Band 7 essentials   🌐 Public          [ ♥ Save to my lists ]
48 words · English · B2 · by @lan
"Words I drilled for the writing task"
─────────────────────────────────────────────────────────────────────────
 1. resilient   /rɪˈzɪliənt/   adj   — kiên cường
 2. mitigate    /ˈmɪtɪɡeɪt/    verb  — giảm nhẹ
 3. …                                                 (no per-row actions)
```

- Reuse the existing `WordRow` for the rows, but **without** owner edit/remove
  affordances — this is someone else's list.
- **Save to my lists** → clone (§5.3). Anonymous → login → return.
- A **`404`** here means the list went private or was deleted → "This list is no
  longer available" + bounce back to the community grid.

### 6.4 Clone result

`201` returns the new private list. Don't make the user hunt for it:

```
✓ Saved to your lists                              [ Open list → ]
```

Toast deep-links to `/decks/:newId`. The copy is a normal owned private list from
here on — fully editable, independent of the original.

---

## 7. The design system to match (mint "Sprout" `.app-shell`)

> ⚠️ These screens live in the authenticated app under **`.app-shell`** (the
> `(app)` layout root) — the **mint "Sprout" theme**, the same one the existing
> `/decks` screens use. **Match the real decks screens, not the neutral shadcn look.**
> (The older create-list brief described neutral shadcn; the shipped code is mint —
> follow the code.) Light theme only; no dark variant in `.app-shell`.

Full token table + atom CSS: [sprout_design_system_reference.md](sprout_design_system_reference.md)
and the `.app-shell` block in [globals.css](../../src/app/globals.css). The essentials:

### 7.1 Layout & rhythm (copy the existing screens)
- **Page container:** `mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10` for the
  community grid (matches [lists-screen.tsx](../../src/app/(app)/decks/lists-screen.tsx));
  `max-w-4xl` for the preview detail (matches [list-detail-screen.tsx](../../src/app/(app)/decks/[id]/list-detail-screen.tsx)).
- **Page header:** `font-heading text-2xl font-bold tracking-tight text-(--ink)` +
  a one-line `text-sm text-(--ink-2)` description. Primary action top-right.
- **Card grid:** `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`.

### 7.2 Tokens (CSS variables on `.app-shell`, consumed via Tailwind v4 arbitrary syntax)
- Ink: `--ink` `#15241e`, `--ink-2` `#5b6b64`, `--ink-3` `#91a09a` → `text-(--ink-2)`.
- Mint: `--primary` `#12bd8a`, `--primary-ink` `#07684b`, `--primary-soft` `#e0f6ee`.
- Surface/line: `--surface` `#fff`, `--card-2` `#f6faf8`, `--line` / `--line-2`, `--muted`.
- Radii: `--r-card` 30px, `--r-tile` 18px, `--r-chip` 999px, `--r-input` 16px.
- Shadows: `--sh-sm` / `--sh-md` / `--sh-lg` / `--sh-primary`.

### 7.3 Atoms — reuse these, don't invent
- **Card:** `.lr-card` (+ `.hoverlift` for the clickable community card).
- **Buttons:** `.lr-btn` with `--primary` (mint, the Clone/Share commit), `--soft`
  (secondary like the existing "Add word"), `--ghost`; sizes `--sm` / `--md` / `--lg`.
- **Menu:** the existing `Menu` component ([list-card.tsx](../../src/app/(app)/decks/list-card.tsx) import) for the `⋯`.
- **Badge:** small `--r-chip` pill, hand-rolled per §5.1 (no shadcn Badge in `.app-shell`).
- **Skeleton:** `.lr-sk` shimmer for loading cards/rows.
- **Toasts:** `sonner` `toast.success` / `toast.error` (already used in
  [lists-screen.tsx](../../src/app/(app)/decks/lists-screen.tsx)).
- **Numbers:** `.tnum` (tabular). **Serif** (`--serif`, Newsreader) for the word /
  IPA in the preview rows, matching `WordRow`.
- **Icons** (`lucide-react`): `GlobeIcon`/`LockIcon` (visibility), `Share2Icon`
  (share), `CopyPlusIcon`/`HeartIcon` (clone/save), `Compass`/`UsersIcon`
  (community nav), `SearchIcon`, `ChevronLeftIcon`, `Loader2Icon` (busy).

### 7.4 Tone
Calm, warm, rounded, soft mint shadows — identical in feel to the current Lists and
List-detail screens. The publish confirm and the clone success are the only moments
that earn a touch of emphasis (a mint accent / a celebratory toast).

---

## 8. Navigation — where Community lives

Community discovery is **net-new** and needs a home. Surface this as a design
decision; the natural options:

- a **new sidebar entry** ("Community" / "Explore", `Compass`/`UsersIcon`), or
- a **tab inside `/decks`** ("My lists" | "Community").

The author-side controls need no new nav — the **Share toggle** lives on the existing
list detail header and the `ListCard` `⋯` menu.

---

## 9. Constraints & edge cases to design a state for

- **Auth gate is clone-only.** Browse + preview render for logged-out visitors;
  only **Save/Clone** routes to login (then returns).
- **Privacy honesty.** First publish → confirm dialog spelling out that *all* words,
  including the user's own, become public. Unpublishing is always one tap back.
- **`system` decks never publish.** Hide the Share control entirely on seeded lists.
- **404 hides private lists deliberately.** A preview/clone `404` is "no longer
  available", **never** "forbidden" — don't imply the list exists.
- **Clone is independent & private.** Always lands as `private`, owned by the cloner,
  editable, decoupled from the source. (Caveat from the API: it references the same
  word rows, so if the original author *deletes* a word, it also vanishes from the
  clone — don't promise "frozen snapshot".)
- **Empty community is normal.** `total: 0` for a filter → friendly empty state.
- **`cefrLevel` may be null** → hide the CEFR chip; **`description` may be null** →
  show nothing (the card already handles "No description").
- **Pagination resets** on any filter/search change.

---

## 10. Design goals (the bar to hit)

1. **One signal, one rule.** `visibility` + `ownerId` decide every badge and control
   (§3) — make ownership and public/private instantly legible, never ambiguous.
2. **Be honest about publishing.** The user must understand their own words go public
   before it happens; unpublishing is trivially reversible.
3. **Discovery feels like the rest of the app.** The community card is the *same*
   list card family; the grid mirrors My lists' rhythm.
4. **Cloning is one tap and clearly lands somewhere.** Success deep-links to the new
   private list; the user never wonders "where did it go?".
5. **Logged-out is a first-class state**, gated only at the clone.
6. **Native to the mint `.app-shell` system** (§7) — reuse `.lr-card`, `.lr-btn`,
   `Menu`, `WordRow`, `sonner`; match the shipped Lists screens, not neutral shadcn.

---

## 11. Screen checklist for the designer

- [ ] **Visibility badge** — Private / Public / Catalog (§5.1), on card + header.
- [ ] **Share toggle on list detail** (§6.1): Private → confirm → Public (copy-link +
      Unpublish); busy + error states. Owner-only, hidden on `system`.
- [ ] **`⋯` menu item** on `ListCard`: Share / Make private (same confirm).
- [ ] **Community browse** (`/decks/community`, §6.2): grid + language/CEFR filters +
      search + pagination; loading / empty (`total:0`) / error; logged-out works.
- [ ] **Public preview** (§6.3): read-only word rows + Save-to-my-lists; 404 state.
- [ ] **Clone flow** (§6.4): anonymous → login gate; success toast deep-linking to
      the new private list.
- [ ] **Navigation decision** (§8): Community as sidebar entry vs. tab in `/decks`.
