# Design context — User-built vocabulary lists ("create a list")

A self-contained brief for designing the **user-facing screens that let a learner
build their own vocabulary lists** — create a list, fill it with words (one at a
time or in bulk), and optionally publish / browse / clone community lists.
Everything a designer needs is here; you should **not** need to read the codebase.

> Source of truth for the *flows* this distils: [user_vocab_lists_design.md](../api/user_vocab_lists_design.md).
> Source of truth for the *API behaviour*: the per-feature docs linked inline —
> [decks_share_and_clone.md](../api/decks_share_and_clone.md),
> [me_vocabulary_quick_create.md](../api/me_vocabulary_quick_create.md),
> [decks_bulk_import.md](../api/decks_bulk_import.md). This file translates those into
> design requirements. If a doc and this file disagree, the API doc wins.

---

## 1. The big picture (what we're designing)

Today a learner can only **study** seeded decks. This feature gives them the
**authoring** side: their own vocabulary lists, like the admin has, but for
personal study. The spine of the feature is one sentence:

> **Create a list → put words in it → study it (and optionally share it).**

A learner builds a list and fills it with words **without** hand-filling a long
form. They type just the word; a background worker enriches it (dictionary + AI)
into a fully-formed, private word — IPA, parts of speech, senses, definitions,
example sentences, a translation, audio. Two ways to add: **one word at a time**
(quick-add) or **paste many at once** (bulk import into a list).

```
   CREATE A LIST            ADD WORDS                ENRICH (async)          STUDY / SHARE
  ┌──────────────┐        ┌──────────────┐         ┌──────────────┐       ┌────────────┐
  │ "IELTS B7"   │  ───▶  │ type a word  │  ───▶   │ enriching…   │  ───▶ │ in my list │
  │ private      │        │ or paste 50  │         │ ▓▓▓░░ 60%    │       │ make public│
  └──────────────┘        └──────────────┘         └──────────────┘       └────────────┘
     deck form              quick / bulk            poll job/batch         deck detail
```

**This is fundamentally asynchronous.** Adding a word does **not** return a
finished word — it returns a *job* (or, for bulk, a *batch*). The enriched word
appears seconds-to-minutes later. The central UX challenge is making the wait feel
productive and never trapping the learner behind a spinner.

### The vocabulary (use these words in the UI)

| In the UI the user sees… | …which in the API is a… |
|---|---|
| **List** (a "vocabulary list") | **Deck** |
| **Word** | **Vocabulary** |

Pick one user-facing label and keep it consistent — this brief assumes **"List"**
and **"Word"**. (The routes/code use `deck`/`vocabulary`; that's fine internally.)

---

## 2. Where it lives (navigation)

These are **net-new** screens in the authenticated app. The left sidebar already
reserves two routes, today shown greyed-out with a **"Soon"** chip — this feature
lights them up:

- **Decks** → `/decks` (`LayersIcon`) — the user's lists. *Today: disabled "Soon".*
- **Words** → `/words` (`BookMarkedIcon`) — the user's words. *Today: disabled "Soon".*

Community discovery is new and needs a home — either a third sidebar entry
(e.g. **Community** / **Explore**) or a tab inside `/decks`. Surface this as a
design decision.

```
Sidebar
├── Home        /dashboard      (exists)
├── Learn       /learn          (exists — the mint "Sprout" study UI)
├── Decks       /decks          ← THIS FEATURE (My lists + Community)
│     ├── Deck detail  /decks/:id ──┬── Edit list (visibility)
│     │                             ├── Add word (quick)
│     │                             └── Bulk import
│     ├── Community  /decks/community ── Public preview ── Clone → My lists
└── Words       /words          ← THIS FEATURE (My words + Quick-add)
```

The dashboard already shows a **"Suggested for you"** deck row; reuse the same deck
card idiom there so cards feel like one family across the app.

---

## 3. The async pattern (design this once, reuse everywhere)

Enrichment is fire-and-forget on the server: submit returns `202` immediately and
the UI **polls** until done. Build one reusable "enrichment progress" treatment.

```
submit ──▶ 202 { id | batchId } ──▶ poll every 1–2s (backoff) ──▶ done
              │                          │
              └─ optimistic "Adding…"    └─ single: status === 'completed' | 'failed'
                                            batch:  pending === 0
```

- **Single word** (quick-add): poll `GET /v1/me/vocabularies/jobs/:jobId` until
  `status` is `completed` / `failed`.
- **Batch** (bulk import): poll `GET /v1/me/vocabularies/batches/:batchId` until
  `pending === 0`; drive a determinate bar from `completed / total`.
- **Always non-blocking.** The user can leave the screen; results land in the list /
  My Words regardless. A toast or badge announces completion.
- **Audio lags even after "done"** — a word can be `completed` while its `audioUrl`
  is still null for a few seconds (separate queue). Render the word immediately; show
  a speaker icon that lights up when audio arrives. Never block UI on `audioUrl`.
- **One word → many words.** A single lemma can resolve to several words (e.g. a
  noun *and* a verb). Never assume exactly one result.
- **Idempotent submit.** Re-submitting the same word while its job is still pending
  returns the *same* job — a double-click must not spawn a second "Adding…" row.

---

## 4. API shapes that drive the UI (the minimum to design around)

Just the fields the UI reacts to. Full contracts in the linked docs.

**A list (deck) summary/detail** carries two fields that decide its identity:

| Field | Type | Drives |
|---|---|---|
| `visibility` | `"system" \| "public" \| "private"` | the **badge** (see §5) |
| `ownerId` | `string \| null` | **ownership** → which controls show |
| `name`, `description`, `language`, `cefrLevel`, `vocabCount` | — | card body (`cefrLevel` may be null → hide chip) |

Ownership = `ownerId === currentUserId`. `visibility` only changes the **badge**,
never permissions.

**Quick-add a word** → `POST /v1/me/vocabularies/quick-create` with
`{ lemma, language?, translationLanguage? }` → `202 { id, status:'pending' }`.
Poll the **job**:

```jsonc
{ "id": "…", "lemma": "resilient", "status": "pending",   // pending | completed | failed
  "resultVocabularyIds": [],   // filled on completed — the new word id(s)
  "error": null }              // a message when failed
```

**Bulk import into a list** → `POST /v1/me/decks/:id/bulk-import` with
`{ lemmas[], language?, translationLanguage? }` → `202 { batchId, accepted, skipped }`.
Poll the **batch**:

```jsonc
{ "batchId": "…", "total": 3, "pending": 1, "completed": 2, "failed": 0 }
```

If `accepted === 0` (everything was already in the user's words), `batchId` is
**null** — there is nothing to poll.

**Publish / unpublish** → `PATCH /v1/me/decks/:id` with `{ visibility }`
(`private` | `public`; `system` is rejected). **Browse community** →
`GET /v1/decks/public` (no auth). **Clone** → `POST /v1/me/decks/:id/clone` → `201`
with the new private list.

---

## 5. Shared building blocks

### 5.1 List (deck) card — the unit that appears everywhere

Used in My lists, Community browse, Suggested decks, and the picker. A neutral
`Card` with a **visibility badge** as its identity cue.

```
┌────────────────────────────────────────────┐
│ IELTS Band 7 essentials          [Private] │  ← visibility badge top-right
│ 48 words · English · B2                     │  ← vocabCount · language · cefrLevel
│ "Words I drilled for writing task 2"        │  ← description, clamp 2 lines
│                                    [⋯ menu] │  ← owner-only actions
└────────────────────────────────────────────┘
```

- **Visibility badge** — three states:
  - `system` → "Catalog" (or no badge) — seeded list, `ownerId: null`.
  - `private` → "Private" + lock icon.
  - `public` → "Public" + globe icon.
- Show `vocabCount`, `language`, `cefrLevel` (hide the CEFR chip if null).
- The `⋯` menu only appears on **my** lists (ownership). On a community list there
  is no menu — only a **Clone** affordance.

> There is already a deck card in the dashboard ("Suggested for you") built from the
> shadcn `Card` + `CardContent`. **Extend that idiom** — add the badge and `⋯` menu —
> rather than inventing a new card. Note: the current summary type has no
> `visibility`/`ownerId` yet; the API is adding them.

### 5.2 Enrichment progress — the async "Adding…" treatment

One reusable inline state for "a word/list is being built". See §3 for the model.
Single word swaps an inline row; bulk shows a progress bar with counters.

---

## 6. The screens to lay out

The **primary spine** is §6.1 → §6.4 (create a list, fill it). §6.5–§6.7
(community / publish / clone) surround it; design them, but the creation spine is
where to spend the most attention.

### 6.1 My lists — `/decks`

The grid of the user's own lists, plus the entry point to create one.

```
My lists                                         [+ New list]
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ List card    │ │ List card    │ │ List card    │
│   [Private]  │ │   [Public]   │ │   [Private]  │
└──────────────┘ └──────────────┘ └──────────────┘
```

- `⋯` menu per **my** list: **Edit · Publish / Make private · Bulk import · Delete**.
- Tapping a card → **deck detail** (§6.3).
- States: **loading** (skeleton cards), **empty** ("Create your first list" → opens
  §6.2), **error** (retry).

### 6.2 Create / edit a list — the list form

A focused form (page or dialog) with the minimal fields plus a **visibility**
control.

```
New list
┌─────────────────────────────────────────────┐
│ Name        [ IELTS Band 7 essentials      ] │  required
│ Description [ Words I drilled for writing…  ] │  optional, multi-line
│ Language    [ English ▾ ]   CEFR [ B2 ▾ ]     │  optional
│                                               │
│ Visibility                                    │
│  (•) Private — only you can see it            │
│  ( ) Public  — anyone can find & clone it     │
│                                  [Create]     │
└─────────────────────────────────────────────┘
```

- Default visibility **Private**. Only `private`/`public` are selectable (never
  `system`).
- When switching **private → public**, show a one-line confirm: *"Publishing shares
  this list and its words with everyone."* (Publishing exposes the author's own
  words too — be honest about it.)
- Edit reuses the same form, pre-filled.

### 6.3 List detail — `/decks/:id`

The list and its words, with the two "add words" entry points and study CTA.

```
‹ My lists
IELTS Band 7 essentials  [Private]            [Study] [⋯]
48 words · English · B2
"Words I drilled for writing task 2"

[+ Add a word]                          [⤓ Bulk import]
─────────────────────────────────────────────────────
  resilient    /rɪˈzɪliənt/   adj   "able to recover…"   🔊
  tenacious    /təˈneɪʃəs/    adj   "holding firmly…"    🔇 ← audio pending
  …                                          (remove per row)
```

- **Owner controls** (this list is mine): Add word, Bulk import, remove words, Edit,
  Publish, Delete, Study.
- Word rows: lemma + IPA + POS + short gloss + speaker (greyed until `audioUrl`).
- `vocabCount` and membership **shift asynchronously** while an import runs — treat
  the count as live; re-fetch rather than caching hard.

### 6.4 Add a word — quick-add + inline progress

Lightweight entry (a field at the top of the list / My Words, or a FAB).

```
Add a word
┌───────────────────────────────┐
│ resilient                     │  ← lemma, 1–128 chars (the hero input)
└───────────────────────────────┘
  Language [en ▾]  Translate to [vi ▾]   (advanced / optional)   [ Add → ]
```

Then swap the row through the job lifecycle:

```
⏳ resilient — adding…                 (poll job; indeterminate, no %)
        │ completed
        ▼
✓ resilient   adj · /rɪˈzɪliənt/       → tap to open the full word
```

**States to design** (this is the important part):

| State | Trigger | Show |
|---|---|---|
| Idle | first load | the input + optional one-liner ("Type a word; we build it, you study it") |
| Submitting | click Add | button busy, brief |
| Adding / pending | `status: pending` | indeterminate "building **resilient**…", reassure it runs in background; user can keep adding |
| Completed — has results | `completed`, ids non-empty | the finished word row; if several ids, note "added 2 (noun + verb)" |
| Completed — empty | `completed`, ids empty | **success, not error**: "You already have this word." |
| Failed | `status: failed` | "Couldn't build that word" + **Retry** (re-submit same lemma); keep it calm |

- **Non-blocking & streaming:** the user can queue several words; finished words
  stream into the list / My Words. Don't full-screen-block on any one job.

### 6.5 My Words — `/words`

The flat list of every word the user owns (quick-created + manually created look
identical — both are just "my words", private, auto-approved).

- States: **loading** (skeleton rows), **empty** ("Add your first word" → opens
  §6.4), **error** (retry).
- This is also a good home for the standalone quick-add field.

### 6.6 Bulk import — sheet + batch progress

Opened from a list's `⋯` → **Bulk import** (the list must be the user's own).

```
Bulk import into "IELTS Band 7 essentials"
┌───────────────────────────────────────────┐
│ resilient                                 │
│ tenacious                                 │  ← textarea / paste,
│ perseverance                              │     one word per line (1–500)
│ …                                         │
└───────────────────────────────────────────┘
  Language [en ▾]  Translate to [vi ▾]      [ Import 3 words → ]
```

Parse the textarea into `lemmas[]` (split on newlines/commas, trim, drop blanks,
cap 500); show the count on the button. Then a progress view (modal or inline
banner on the list):

```
Importing 3 words…                        [run in background]
████████████░░░░░░░  2 / 3              (completed / total)
✓ 2 added   ⏳ 1 building   ✕ 0 failed
```

- Poll the batch until `pending === 0`. Words land in the list **as they finish** —
  refresh incrementally on each poll where `completed` rises, or once at the end.
- **"Run in background"** dismisses the modal; a toast/badge announces completion.

**Bulk states:**

| State | Treatment |
|---|---|
| Accepted, polling | progress bar + counters |
| Some skipped (`skipped > 0`) | subtext "(2 already in your words — skipped)" |
| All skipped (`batchId: null`) | inline note, **no** progress view |
| Partial fail at end | "2 added, 1 couldn't be built" + **Retry failed** (re-submit the missing lemmas) |

### 6.7 Community — browse, preview, clone

- **Browse** (`/decks/community`) — grid of public lists from
  `GET /v1/decks/public`, newest first, with `language` + `CEFR` filters, a search,
  and pagination. Each card shows `by @author`. Empty → "No public lists yet."
- **Public preview** — read-only ordered word list (`GET /v1/decks/:id`); the only
  write action is **Clone**. A private list 404s here → generic "This list isn't
  available."
- **Clone** → `POST /v1/me/decks/:id/clone` → `201` new private list. Optimistic
  "Cloned ✓ — open" toast deep-linking into My lists; the copy is fully editable and
  independent of the original.

---

## 7. The design system to match (the user app — neutral shadcn)

These screens live in the **authenticated app shell** (`(app)` group): a persistent
left sidebar + a centered content column. **Match the neutral, light/dark shadcn
look of the dashboard** — *not* the mint "Sprout" theme of `/learn` (that's scoped
to `.learn-shell` only) and *not* the soft accent-card admin style. Concretely:

### 7.1 Layout & rhythm
- **Page container:** centered column, `mx-auto w-full max-w-4xl px-4 py-8 sm:px-6
  lg:py-10` for focused pages; go wider (`max-w-6xl`) for dense grids if needed.
- **Page header:** `font-heading text-2xl font-semibold tracking-tight`, with a
  one-line muted description beneath. Section headers: `font-heading text-lg
  font-medium tracking-tight`.
- **Primary action** sits top-right of a list header ("+ New list", "Study").
- **Grid:** `grid gap-3 sm:grid-cols-2 lg:grid-cols-3` for card grids (matches the
  Suggested-decks row).

### 7.2 Tokens & primitives (shadcn base, light + dark both first-class)
- Colours are the **neutral root tokens** (oklch greyscale): `background`,
  `card`, `muted`/`muted-foreground`, `primary` (near-black in light / near-white in
  dark), `secondary`, `accent`, `border`, `ring`, `destructive`. **Both themes are
  first-class — design for `.dark` too.**
- **Components — reuse shadcn/ui, don't reinvent:** `Card`/`CardContent`, `Button`
  (`default` / `outline` / `ghost`; sizes `sm`/`lg`/`icon`), `Input`, `Textarea`,
  `Select`, `Dialog` / `Sheet` (for create-list and bulk-import), `DropdownMenu`
  (the `⋯` menu), `Badge`, `Progress` (the batch bar), `Skeleton` (loading), `Toast`/
  `Sonner` (async completion), `RadioGroup` (visibility).
- **Radii:** `rounded-lg` / `rounded-xl` (base `--radius` 0.625rem). Subtle borders
  (`border-border/60`) over hard lines; light shadows; hover = `ring-foreground/20`.
- **Badges:** small `rounded-md` pills, `text-xs font-semibold`, muted or tone-toned.
  Loading buttons = `Loader2Icon animate-spin` + busy label ("Importing…").
- **Icons:** `lucide-react`. In use / suggested: `LayersIcon` (lists),
  `BookMarkedIcon` (words), `Plus` (add), `Upload` (bulk import), `Lock`/`Globe`
  (visibility), `Copy`/`CopyPlus` (clone), `Sparkles` (AI enrich), `MoreHorizontal`
  (`⋯`), `Loader2`, `Volume2`/`VolumeOff` (audio), `ChevronRight`, `Search`.
- **Numbers:** `tabular-nums`. **Muted text:** `text-muted-foreground`.

### 7.3 Tone
Calm, clean, dense-but-readable. Neutral surfaces, soft borders, rounded corners,
restrained shadows. The async/progress moments are the only place for a little
warmth (a `Sparkles` cue for "AI is building this").

---

## 8. Constraints & edge cases to design a state for

- **Lemma:** 1–128 chars (quick-add and each bulk line).
- **Bulk:** 1–500 lemmas per import; show the live count on the button; cap at 500.
- **Language codes:** `^[a-z]{2}(-[A-Z]{2})?$`; **CEFR:** `A1`–`C2`. Validate
  client-side to avoid round-trip `400`s.
- **Empty-but-successful (not errors):** quick-add `completed` with no ids ("already
  have it"); bulk where everything was skipped (`batchId: null`).
- **Async truth:** `vocabCount` / list membership update during import — re-fetch,
  don't cache hard. Audio arrives after `completed`.
- **Ownership decides controls:** `ownerId === me` → full controls; otherwise
  read-only + Clone. A community list shows no `⋯` menu.
- **Errors to have states for:** `400` (validation), `401` (session expired → prompt
  sign-in), `403` (not your list — shouldn't be reachable from owned UI), `404`
  (job/batch/list unknown or another user's private list), generic → toast + retry.

---

## 9. Design goals (the bar to hit)

1. **Make the wait calm and non-blocking.** The async enrichment is the core of the
   feature — never trap the learner behind a spinner; let them keep adding and come
   back. Words stream in.
2. **Make "create a list and fill it" feel like one fluid spine**, not three
   disconnected screens. From an empty list to a populated one should feel quick.
3. **Set honest expectations.** Counts, progress, "this can take a moment", "audio
   appears shortly", "publishing shares your words".
4. **Reassure on the confusing bits.** Empty result = success; one word can become
   several; skipped ≠ failed; a clone is independent.
5. **One card family.** The list card and word row look the same in My lists,
   Community, Suggested, and the picker.
6. **Stay native to the neutral user-app design system** (§7) — shadcn `Card` /
   `Button` / `Badge` / `Dialog`, light + dark, not the mint or admin styles.

---

## 10. Screen checklist for the designer

Design at minimum:

- [ ] **My lists** (`/decks`): grid + "New list", loading / empty / error.
- [ ] **Create / edit list form:** name, description, language, CEFR, visibility +
      publish confirm.
- [ ] **List detail** (`/decks/:id`): header, word rows (audio-pending state),
      Add-word + Bulk-import entry points, owner `⋯` menu, Study CTA.
- [ ] **Quick-add a word:** idle → adding → completed (1+ results) → empty → failed.
- [ ] **My Words** (`/words`): list, loading / empty / error.
- [ ] **Bulk import:** paste sheet (count on button) → batch progress (bar +
      counters + skipped/failed notes) → run-in-background.
- [ ] **Community:** browse grid + filters, public preview (read-only), clone toast.
- [ ] **Cross-cutting:** list (deck) card with visibility badge + ownership menu,
      the reusable enrichment-progress treatment, error toasts, empty states, and a
      persistent "in-progress" affordance so async work is never lost.
