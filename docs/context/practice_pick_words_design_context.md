# Design context — Practice: pick the words to practise (queue builder), brand-forward

A self-contained brief for **designing the "pick words to practise" surface** of `/practice`
— the step *before* the learner produces language. The backend just shipped a dedicated
**queue picker** (it no longer reuses the raw "due" list), so the screen now builds a **set of
words** the learner runs one at a time. Everything a designer needs is here; you should **not**
need to read the codebase.

> **This is a Claude Design brief**, not a wire contract. It says *what is on screen, what data
> each state has, what to reuse, and the constraints the layout must respect.* The
> request/response shapes are the source of truth and live in the API doc below.

> **Design Read (taste pass).** Reading this as: **product UI — a session-setup / queue-builder
> surface for an existing learner**, inside the authenticated Sprout app shell, with a *calm,
> functional, brand-consistent* language. This is **not** a landing page, so the marketing dials
> stay low: **DESIGN_VARIANCE 4 · MOTION_INTENSITY 3 · VISUAL_DENSITY 4**. From the taste skill we
> keep only the parts that apply to product UI: **layout discipline, ruthless content density,
> real loading/empty/error states, accessibility, and the anti-slop tells** (no decorative dots,
> no eyebrow-on-every-section, no fake-precise numbers, **zero em-dashes**). We *don't* import its
> landing-page machinery (hero scale rules, marquees, scroll-hijack). Build against the existing
> Sprout system, don't invent a new visual language.

> Source of truth for the *wire contracts* (don't restate them — design to the field tables):
> [practice_pick_words.md](../api/practice_pick_words.md)
> (`GET /v1/me/practice/suggestions`, `POST /v1/me/practice/sets`). The catalogue the hand-pick
> list is drawn from: [`GET /v1/vocabularies`](../backend/api-endpoints.md) (paginated/filterable
> by `language`, `cefrLevel`, `topic`, `q`).
> The screen this **feeds into** (the word-anchored Write/Speak runner) and its shared brand
> language: [practice_tab_design_context.md](practice_tab_design_context.md). This file is its
> **prequel** — it owns *arrival + word selection*; that file owns *producing + scoring*.
> Source of truth for the *brand system* (tokens, type, atoms, verbatim CSS):
> [sprout_design_system_reference.md](sprout_design_system_reference.md).
> Shared conventions (base URL, `Authorization: Bearer`, pagination, errors):
> [frontend_handoff.md](../api/frontend_handoff.md).
> If a doc and this file disagree, **the API doc / the live CSS wins.**

> **Light theme only.** Like the rest of `/practice`, `/learn`, and the home, this is a single,
> fully art-directed light theme. **Do not design a dark variant.**

---

## 1. The big picture (what changed, and what we're building)

Previously the Practice hub was **anchored to one word** (it read the raw `GET /v1/me/progress/due`
list and dropped you onto a single lemma). The backend now exposes a **purpose-built picker**, so
the model shifts from *one word* to **a practice queue of N words** that the learner runs one at a
time. There are exactly **two ways to fill that queue** — and they map 1:1 to two endpoints:

1. **Quick start** — `GET /v1/me/practice/suggestions?count=N` → "just give me N words." The server
   picks from the learner's spaced-repetition state (words **due** for review + **new** words at
   their level) and, if that runs short, **tops up with random level-matched words** so the queue is
   never empty. Returns a list of `PracticeItem` + a `usedFallback` flag.
2. **Hand-pick** — `POST /v1/me/practice/sets` → "I ticked these words, validate them." The learner
   selects words from the catalogue checkbox list; you send the IDs; the server returns the
   **practiceable** ones (in sent order) plus `inaccessibleVocabularyIds` for any that are stale,
   private to someone else, or unapproved drafts.

> **The two paths produce the identical item shape (`PracticeItem`).** The *only* differences are
> how the learner expresses intent (one tap vs. ticking a list) and the post-pick signal each
> returns (`usedFallback` vs. `inaccessibleVocabularyIds`). Design them as **two doors into the
> same queue**, not two different products.

The spine of this surface, one sentence:

> **Arrive → get a set of words (quick or hand-picked) → glance at the queue → start practising.**

Then each word in the queue hands off to the **existing word-anchored runner** (Write a sentence /
Speak the word) documented in [practice_tab_design_context.md](practice_tab_design_context.md).
**This brief stops at "start"** — it does not redesign the Write/Speak panels.

### Vocabulary (use these words in the UI)

| In the UI the user sees… | …which in the API is a… |
|---|---|
| **Word** | a `PracticeItem` (`vocabularyId`, `lemma`, `partOfSpeech`, `ipa?`, `audioUrl?`, `glosses[]`) |
| **Queue / set** | the ordered list of `PracticeItem` the session will run |
| **Extra practice** | a word added by the `usedFallback` top-up (already-seen, level-matched) |
| **Unavailable** | an id returned in `inaccessibleVocabularyIds` (stale / private / draft) |

---

## 2. The `PracticeItem` shape (what every word card renders)

Both endpoints return the **same lean item**. Design the word card/row to exactly these fields —
nothing else is in the payload:

| Field | Type | In the UI |
|---|---|---|
| `vocabularyId` | string (UUID) | identity / key; the handoff token to the runner. Never shown. |
| `lemma` | string | **the word** — the card's headline (serif, `.lr-word` at a small size). |
| `partOfSpeech` | enum | a small **neutral** chip (`noun · verb · adjective …`). |
| `ipa` | string \| null | pronunciation hint (`.lr-ipa`, italic). **Hide the row when null.** |
| `audioUrl` | string \| null | a small `.lr-orb` to hear it. **Hide when null.** |
| `glosses` | string[] (≤5) | up to 5 short meanings, most-salient first. **Show 1, maybe 2**; never dump 5. **May be empty** → show a muted "No definition yet," not blank space. |

> **Don't over-fetch.** Translations and examples are **not** in this shape. If a card ever needs
> the full entry, that's `GET /v1/vocabularies/:id` — but for picking, the lean item is enough.
> Resist adding fields the payload doesn't carry.

---

## 3. Where it lives & how the learner arrives (IA)

This is the **front door of `/practice`** when the learner has **no word in hand** — i.e. they came
from the **sidebar `Practice`** entry or the **home launchpad Practice tile**. (The `?word=`
deep-link and "Practice this word" from a word's detail page **skip this surface** and land straight
in the runner — design for that bypass, don't block it.)

It renders inside the branded `.app-shell`, so it **already inherits the Sprout mint tokens** — design
against them.

```
  ╭──────────────────────────────────────────────────────────────╮
  │  Practice                                                      │
  │  Pick a few words and prove you can use them.                  │  ← one-line purpose, no eyebrow
  │                                                                │
  │  ┌───────────────────────────────────┐  ┌──────────────────┐  │
  │  │  ▶  Quick start                    │  │  Hand-pick        │  │
  │  │  8 words picked for you today      │  │  Choose words     │  │
  │  │  due reviews + new at your level   │  │  from your list   │  │
  │  │  [ Start practising ]   [ 8 ▾ ]    │  │  [ Browse → ]     │  │
  │  └───────────────────────────────────┘  └──────────────────┘  │
  │                                                                │
  │  In your queue · 8 words            mixed · today              │
  │  ◷ ephemeral  ◷ candid  ◷ resilient  ◷ ...   (review chips)    │
  ╰──────────────────────────────────────────────────────────────╯
```

**Layout recommendation (taste pass):**

- **Quick start is the hero of this screen, and it is asymmetric on purpose** — a wide primary panel
  paired with a slimmer secondary. Do **not** render Quick start and Hand-pick as two equal cards
  (the banned "two/three identical cards" tell). One is the default (≈60–66% width), the other is the
  deliberate alternative (≈34–40%). On mobile they **stack**, Quick start first.
- **One primary action.** The page has exactly one primary CTA: **Start practising**. Hand-pick's
  "Browse" is secondary (`.lr-btn--soft`/`--ghost`). Never two competing primary buttons.
- **The queue preview is the proof, not decoration.** Once a set exists, show it as removable word
  **chips** (or a compact list), so the learner can glance, trim, and commit. This *is* the content;
  give it room rather than a card-in-card-in-card.

---

## 4. Quick start (`GET /v1/me/practice/suggestions`)

The default path: one tap should produce a ready queue.

### 4.1 Data & rules

- **`count`** — `1–20`, default `10`. It is **capped at 20** to stay under the daily attempt cap
  (default **30/day**). Expose a small count control (a `[ 8 ▾ ]` stepper / segmented `5 · 10 · 15 ·
  20`), but **default to a sensible 8–10 and let one tap go** — don't force a config step.
- **`items`** — up to `count` `PracticeItem`s, **may be fewer** (or empty in the extreme case the
  catalogue has nothing for the learner's language).
- **`usedFallback`** — `true` when the SRS picker ran short and the list was **padded with random
  level-matched words** (which the learner may have already studied).

### 4.2 How to treat `usedFallback` (a tone decision, get it right)

This flag is **not an error** and must never read as one. It means "we ran low on due/new words, so
here's some extra level-matched practice." Recommended treatment:

- When `false` → say nothing special. The queue is "due reviews + new words."
- When `true` → a **calm, positive** framing: a small neutral tag like **"Extra practice"** on the
  padded words, or a one-line note *"You're caught up on reviews — here are a few extra at your
  level."* Mint/neutral styling, **never** the red/amber band colours (those mean *score*, see the
  runner brief). It's a *good* state: the learner is ahead.
- You **cannot** tell from the payload *which* individual items were the padding — `usedFallback` is a
  single boolean for the whole list. So either tag the **whole set** as "includes extra practice" or
  don't tag individual rows. Don't fake per-word precision.

### 4.3 States

| State | UI |
|---|---|
| **loading** | `.lr-sk` shimmer rows shaped like the final word chips — not a spinner. |
| **ready** (`items.length > 0`) | The queue preview + enabled **Start practising**. |
| **short set** (`items.length < count`) | Just start with what's there. Optionally a quiet "Found N words" — don't apologise. |
| **empty** (`items.length === 0`) | A composed empty state: *"No words to practise yet — learn a few first,"* with a button to `/learn`. **Never a blank screen.** |
| **`usedFallback: true`** | The positive "extra practice" framing above. |

### 4.4 Read-only — say so where it matters

Asking for suggestions **does not enrol** any word into the SRS schedule, and practising here **does
not move** a word's review schedule (only the learn/review flow does). The learner doesn't need a
banner about this, but **don't** add UI that implies "completing this queue advances your reviews" —
it doesn't. Keep the copy about *practising usage*, not *progressing the deck*.

---

## 5. Hand-pick (`POST /v1/me/practice/sets`)

The deliberate path: the learner browses the catalogue and ticks words.

### 5.1 Flow

1. **Render a checkbox list from [`GET /v1/vocabularies`](../backend/api-endpoints.md)** — already
   paginated and filterable by `language`, `cefrLevel`, `topic`, and a search `q`. This is a
   **selection list**, so lean on the *content-density* guidance: a clean **`divide-y` row list or a
   compact card grid** with a checkbox, the `lemma`, a one-line gloss, and POS — **not** a heavy
   bordered table, and **not** a 30-row wall with a hairline under every row. Put **search + filters
   at the top**; keep the row height tight.
2. **Collect ticked `vocabularyId`s** (1–50; duplicates are de-duped server-side; over-50 or a
   non-UUID is a `400` — gate the Submit button on a valid 1–50 selection).
3. **`POST /sets`** with `{ vocabularyIds }` → returns `items` (**in the order sent**) +
   `inaccessibleVocabularyIds`.

### 5.2 Selection affordances (taste pass)

- A **persistent selection summary** (a sticky footer bar or header pill: *"6 selected · max 50"*)
  with the **Add to queue / Validate** action — so the learner always sees the count and the cap, and
  the action doesn't hide below a long list.
- **Disable** the action at 0 selected and **block** past 50 (with an inline "50 max," not a
  post-submit error). The cap is a real constraint; surface it *before* the request.
- Preserve order: the response keeps **sent order**, so the queue reflects how the learner ticked —
  don't re-sort it.

### 5.3 Handling `inaccessibleVocabularyIds`

These are requested IDs that **don't exist, are someone else's private word, or are an unapproved
system draft**. Treat them as **stale, not errors**:

- **Uncheck them**, keep the valid `items`, and surface a **single calm toast/inline note**: *"2 words
  are no longer available and were skipped."* Then proceed with the good ones.
- Don't dead-end the whole selection because part of it went stale — the queue still forms from
  `items`.

### 5.4 States

| State | UI |
|---|---|
| **browsing** | The filterable checkbox list + live selection summary. |
| **validating** | Disable Submit, spinner on it; keep the selection visible. |
| **partial** (`inaccessibleVocabularyIds.length > 0`) | Add `items` to the queue, toast the skipped count, uncheck stale rows. |
| **all stale** (`items.length === 0`) | "None of those are available right now" + keep them on the list to re-pick. |
| **`400`** (empty / >50 / bad id) | Inline "Pick 1–50 words" — but you should have prevented this client-side. |
| **loading the catalogue** | `.lr-sk` shimmer rows. |

---

## 6. The queue (the shared payoff of both paths)

Both doors deposit `PracticeItem`s into **one queue**. Design this once:

- **Preview as removable chips or a compact ordered list** — `lemma` + POS, with a tiny **remove (×)**
  so the learner can trim before starting. Show the **count** (*"8 words"*).
- **Start practising** hands the **first** item to the word-anchored runner; the rest wait. A small
  **progress affordance** ("Word 1 of 8") belongs to the *runner*, but the queue order is set here.
- **Mind the daily cap.** Default **30 attempts/day**; Quick start caps `count` at 20 for this reason.
  If you let hand-pick stack up to 50, make clear that **not all may be practisable today** if the
  learner is near the cap — but the cap's hard enforcement (`429`) lives in the runner's submit, so
  here keep it to a gentle hint, not a blocker.
- **De-dupe across paths.** If the learner hand-picks a word already in the quick-start queue, merge
  rather than duplicate (match on `vocabularyId`).

---

## 7. Brand, type & atoms to reuse (don't invent)

This surface inherits the Sprout mint system already on `.app-shell`. Reuse before building:

| Element | Atom |
|---|---|
| Word / IPA | `.lr-word` (small here, ~24–28px) / `.lr-ipa` (italic; hide if null) |
| Hear-it | `.lr-orb` (mint; `--sm`) — hide when `audioUrl` null |
| POS / "Extra practice" / count tags | `.lr-chip` (neutral) |
| Buttons | `.lr-btn` (`--primary` mint = **Start practising**; `--soft`/`--ghost` = Browse, secondary) |
| Checkbox rows / filters | existing form atoms (`.lr-input` for search); standard checkbox |
| Loading | `.lr-sk` shimmer (shaped like word chips / list rows) |

- **Type:** Plus Jakarta Sans for all UI; **Newsreader (serif)** only for the `lemma` itself.
  `.lr-eyebrow` is available but **ration eyebrows** — at most one on this whole surface, and frankly
  it needs none. `tabular-nums` on the count and any number.
- **Colour discipline (inherited from the runner brief):** the **band scale (green/amber/red) is for
  scores only** and there are **no scores on this surface** — so **do not** use band colours here at
  all. Chrome stays mint; tags stay neutral. `cefr` filter values in hand-pick are **categorical**
  chips, never band colours.
- **Radii/shadows:** one radius system (`--r-card` / `--r-tile` / `--r-chip`); tinted shadows, never
  pure-black. Honour the global reduced-motion contract.

---

## 8. States, empty & error matrix (the whole surface)

| Situation | Path | Treatment |
|---|---|---|
| No due/new words, nothing to suggest | Quick start | Composed empty state → button to `/learn`. Never blank. |
| SRS ran short, list padded | Quick start | Positive "extra practice" framing (§4.2). Not an error. |
| Fewer than `count` returned | Quick start | Start with what's there; no apology. |
| Some hand-picked ids stale/private/draft | Hand-pick | Add valid `items`, toast skipped count, uncheck stale (§5.3). |
| All hand-picked ids inaccessible | Hand-pick | "None available right now," keep list for re-pick. |
| `400` (empty / >50 / non-UUID) | Hand-pick | Prevent client-side; if it slips through, inline "Pick 1–50 words." |
| Not onboarded (`400 mode=daily requires onboarding`) | Quick start | Route to onboarding (set `targetLanguage` + `proficiencyLevel`) first. |
| `401` on any call | Both | Defer to the app-shell guard (refresh/redirect); no bespoke per-panel auth UI. |
| Catalogue / suggestions loading | Both | `.lr-sk` shimmer, shaped like the result. |
| Backend cold/erroring | Both | Degrade to the empty/hub state, not a crash. One failing path never blanks the screen. |

---

## 9. Design goals & non-goals

**Goals**
1. **One tap to practise.** Quick start is the default; a learner who just wants to go should never
   have to configure anything. Hand-pick is the power path, visibly secondary.
2. **Two doors, one queue.** Both endpoints produce the same `PracticeItem`; the queue and the word
   card are designed **once** and shared.
3. **Same product family.** Sprout mint, serif `lemma`, the `.lr-*` atoms — no seam between this
   surface, the runner, `/learn`, and the home.
4. **Calm signals.** `usedFallback` reads as *positive* ("you're ahead"); `inaccessibleVocabularyIds`
   reads as *housekeeping* ("we skipped a couple"). Neither is an error.
5. **Respect the caps as guidance, not walls.** Surface `1–20` / `1–50` / `30/day` where they help the
   learner choose; let the runner enforce the hard `429`.
6. **Never dead-end.** Every empty/stale/error row has a concrete next action.
7. **Accessibility.** Checkboxes and the count/cap are announced; the queue's remove buttons have
   labels; focus survives the pick → start transition; `tabular-nums`; reduced motion honoured.

**Non-goals**
- Don't restate the wire contracts — design to the field tables in
  [practice_pick_words.md](../api/practice_pick_words.md).
- **Don't redesign the Write/Speak runner or its scoring** — that's
  [practice_tab_design_context.md](practice_tab_design_context.md). This brief hands off at "Start."
- Don't fetch full entries to enrich the picker — the lean `PracticeItem` is the contract.
- Don't use the **band scale** anywhere here (no scores on this surface).
- Don't add UI implying the queue advances SRS reviews (it doesn't — §4.4).
- Light theme only. No dark variant.

---

## 10. Open decisions to resolve (surface a recommendation for each)

1. **Default landing emphasis:** auto-run a quick set on arrival vs. show the two doors and wait for a
   tap. *(Lean: show the doors with Quick start pre-filled and one tap away — don't auto-consume.)*
2. **Count control shape:** stepper `[ 8 ▾ ]` vs. segmented `5 · 10 · 15 · 20` vs. hidden behind
   "advanced." *(Lean: segmented, default 8–10.)*
3. **`usedFallback` surfacing:** whole-set note vs. a per-word "extra" tag (remember you *can't* tell
   which items were padded). *(Lean: one whole-set note.)*
4. **Hand-pick entry:** inline expand on this screen vs. a dedicated `/practice/pick` route vs. a
   modal/sheet over the catalogue. *(Decide by how the catalogue list is already built.)*
5. **Queue persistence:** does the queue survive a refresh / back-from-runner, or rebuild each visit?
6. **Cross-path merge UX:** how a hand-picked word that's already in the quick queue de-dupes visibly.
7. **Daily-cap hint:** show "N of your 30 daily attempts left" on this surface, or only let the runner
   surface the `429`?

---

## 11. Screen checklist for the designer

Design at minimum (light theme):

- [ ] **Arrival:** the two-door hub (Quick start primary + Hand-pick secondary), asymmetric, not two
      equal cards; one primary CTA.
- [ ] **Quick start:** count control (1–20, default ~8–10), one-tap **Start practising**, `.lr-sk`
      loading, composed empty → `/learn`, **positive** `usedFallback` framing.
- [ ] **Hand-pick:** filterable catalogue checkbox list (search + `cefrLevel`/`topic`/`language`),
      tight rows (no hairline-per-row table), sticky selection summary with count + **1–50** cap,
      validate → `POST /sets`.
- [ ] **`inaccessibleVocabularyIds`:** uncheck stale, keep valid `items`, single calm toast.
- [ ] **Word card / `PracticeItem`:** serif `lemma` · POS chip · IPA (hide if null) · hear-it orb
      (hide if null) · 1 gloss (muted "no definition yet" if empty). No over-fetch.
- [ ] **Queue:** removable chips/list, count, sent order preserved, cross-path de-dupe, hands first
      item to the runner.
- [ ] **States:** every row of §8 has a concrete affordance; one path failing never blanks the screen.
- [ ] **Brand:** reads as the Sprout family; **no band colours** on this surface; tags neutral.
- [ ] **Cross-cutting:** `tabular-nums`, reduced motion, accessible checkboxes/labels, light only,
      **zero em-dashes**.

> Keep this file current: when the picker's params, returned fields, caps, or entry points change,
> update §2–§6 here in the same PR (alongside [practice_pick_words.md](../api/practice_pick_words.md)),
> and re-check the handoff line into [practice_tab_design_context.md](practice_tab_design_context.md).
