# Design context — User "Add a word" (create my own vocabulary)

A self-contained brief for designing the **end-user "add a word" surface** — the
screens a signed-in learner uses to create their own private words. It covers the
**three ways** to add a word, how they connect, and (with the most attention) the
**manual full form**. Everything a designer needs is here; you should **not** need
to read the codebase.

> Source of truth for the *API behaviour*: [me_create_vocabulary.md](../api/me_create_vocabulary.md)
> (the umbrella doc for all three ways) and its per-feature children —
> [me_vocabulary_quick_create.md](../api/me_vocabulary_quick_create.md) (Way 1),
> [decks_bulk_import.md](../api/decks_bulk_import.md) (Way 2). This file translates
> those into design requirements. **If a doc and this file disagree, the API doc wins.**
>
> Sibling brief — **don't re-spec these here:** the *list / deck / community*
> surfaces (My lists, list detail, bulk-into-a-deck, browse & clone) are owned by
> [user_create_vocabulary_list_design_context.md](user_create_vocabulary_list_design_context.md).
> This doc owns the **"Add a word" entry surface and the three creation paths**,
> and goes deep on the **manual full form**, which that doc does not.

---

## 1. The big picture (what we're designing)

A signed-in user has **three ways** to create their own words. All three create
**user-owned** words: `source: "user"`, **private**, owned by the caller,
**auto-approved** (usable immediately — no admin review). They differ only in how
much the user types and whether the result is instant or async.

| # | Way | Role in the UI | Effort | Result |
|---|---|---|---|---|
| **1** | **Quick-create one word** | **The default "Add word"** | type just the word | ⏳ async — `202` + poll a **job** |
| **2** | **Bulk import a list** | action on a deck the user owns | paste many words | ⏳ async — `202` + poll a **batch** |
| **3** | **Manual, full form** | **Advanced / fallback** | type every field | ✅ instant `201`, fully formed |

**Quick-create is the primary path** — the user only types the lemma and a
background worker fills the rest (parts of speech, IPA, definitions, examples,
CEFR, a translation, audio). The **manual full form is the advanced / fallback**
path — many inputs, kept because it's the only way to (a) add a word the AI can't
resolve and (b) author custom sense content. **Don't make the manual form the
first thing the user sees.**

### The mental model to communicate

```
   ADD A WORD                                         WHERE IT LANDS
  ┌────────────────────────────────────────┐        ┌──────────────────┐
  │  ◉ Quick add   "resilient"   [Add →]    │ ─────▶ │  My Words        │
  │  ○ Fill it myself (advanced)            │        │  (private, ready │
  └────────────────────────────────────────┘        │   to study now)  │
        │ AI can't resolve it / I want my own            └──────────────────┘
        ▼ content
  ┌────────────────────────────────────────┐
  │  Manual full form (pre-filled lemma)    │ ─────▶  instant, fully formed
  └────────────────────────────────────────┘
```

### How the three connect (design this handoff)

```
  Quick add (Way 1) ──▶ job completed, has results ──▶ word streams into My Words ✓
        │
        ├─ completed, EMPTY result  ──▶ "You already have this word"  (success, not error)
        │
        └─ FAILED  /  expected-new-but-empty
                 └──▶ surface "Add it manually" ──▶ opens the MANUAL FORM (Way 3)
                                                     pre-filled with the lemma typed
```

The **failed-quick-create → manual fallback** is the single most important
connection in this feature. When the AI returns nothing usable, the manual form is
the *only* way to add that word — wire a calm **"Add it manually"** affordance that
opens Way 3 with the lemma already filled in.

### Labels (use these words in the UI)

| The user sees… | …which in the API is a… |
|---|---|
| **Word** | **Vocabulary** |
| **List** | **Deck** |

Keep "Word" / "List" consistent (routes/code use `vocabulary`/`deck` internally —
that's fine).

---

## 2. Where it lives (navigation & entry points)

These screens live in the authenticated **user app shell** (the `(app)` group):
persistent left sidebar + centered content column. The relevant home is **My
Words** → `/words` (sidebar `BookMarkedIcon`; today a greyed-out "Soon" stub this
feature lights up). Quick-created and manually-created words look **identical** in
My Words — both are just "my words", private, auto-approved.

The **"Add word"** entry point (a button at the top of `/words`, or a FAB) opens
the **Add-a-word surface**, which defaults to **Quick add**:

```
Sidebar                          /words  ──  My Words
├── Home    /dashboard           ┌─────────────────────────────────┐
├── Learn   /learn               │ My Words                [+ Add word]
├── Decks   /decks  (lists)      │ ─────────────────────────────────│
└── Words   /words  ← HERE       │  resilient  adj  /rɪˈzɪliənt/  🔊 │
                                 │  tenacious  adj  …             🔇 │
                                 └─────────────────────────────────┘
```

- **Default:** "Add word" opens **Quick add** (Way 1) — just type the word.
- **Advanced toggle:** an **"Advanced / fill it myself"** control on that surface
  opens the **manual full form** (Way 3). It is secondary — not the first thing
  shown.
- **Bulk import** (Way 2) does **not** live here — it's an action on a **deck**
  the user owns (its `⋯` menu), because bulk words land in that deck. It's
  specced in the [list design context](user_create_vocabulary_list_design_context.md);
  only summarised here (§5).

---

## 3. The async pattern (shared by Ways 1 & 2 — design once)

Ways 1 & 2 are fire-and-forget: submit returns `202` immediately; the UI **polls**
until done. Build **one** reusable "enrichment progress" treatment. (Way 3 is
synchronous and has no progress state.)

```
submit ──▶ 202 { id | batchId } ──▶ poll every 1–2s (backoff) ──▶ done
              │                          │
              └─ optimistic "Adding…"    └─ single: status === 'completed' | 'failed'
                                            batch:  pending === 0
```

- **Always non-blocking.** The user can leave; results land in My Words / the deck
  regardless. A toast/badge announces completion.
- **Audio lags even after "done."** A word can be `completed` while `audioUrl` is
  still null for a few seconds (separate queue). Render the word immediately; show a
  speaker icon that lights up when audio arrives. **Never block UI on `audioUrl`.**
- **One word → many words.** A single lemma can resolve to several words (e.g. a
  noun *and* a verb). Never assume exactly one result.
- **Idempotent submit.** Re-submitting the same lemma while its job is still
  pending returns the *same* job — a double-click must not spawn a second "Adding…"
  row.

> The list design context already specs this in depth (its §3 + §5.2). Reuse the
> **same** component here.

---

## 4. Way 1 — Quick add (the default) — *summary*

The hero path. The user types **just the word**; the worker enriches it.

- **Submit:** `POST /v1/me/vocabularies/quick-create` with
  `{ lemma, language?, translationLanguage? }` → `202 { id, status:'pending' }`.
- **Poll:** `GET /v1/me/vocabularies/jobs/:jobId` until `status` is
  `completed` / `failed`.

```jsonc
{ "id": "…", "lemma": "resilient", "status": "pending",  // pending | completed | failed
  "resultVocabularyIds": [],   // filled on completed — the new word id(s)
  "error": null }              // a message when failed
```

```
Add a word
┌───────────────────────────────┐
│ resilient                     │  ← lemma, 1–128 chars — the hero input
└───────────────────────────────┘
  Language [en ▾]  Translate to [vi ▾]   (advanced/optional)   [ Add → ]
  ↳ Advanced / fill it myself                                  (opens Way 3)
```

**States to design** (the important part):

| State | Trigger | Show |
|---|---|---|
| **Idle** | first load | the input + one-liner ("Type a word; we build it, you study it") + the "Advanced / fill it myself" link |
| **Submitting** | click Add | button busy, brief |
| **Adding / pending** | `status: pending` | indeterminate "building **resilient**…"; reassure it runs in the background; user can keep adding |
| **Completed — has results** | `completed`, ids non-empty | the finished word row; if several ids, note "added 2 (noun + verb)" |
| **Completed — empty** | `completed`, ids empty | **success, not error:** "You already have this word." |
| **Failed** | `status: failed` | calm "Couldn't build that word" + **Retry** *and* **"Add it manually"** → opens Way 3 pre-filled with the lemma |

> Full quick-add wireframes & states: list design context §6.4. The only thing to
> add **here** is the **"Add it manually"** escape hatch on `failed` / unexpected
> empty — see §6.

---

## 5. Way 2 — Bulk import into a deck — *summary*

Paste a list of words; each is enriched and **auto-added to a target deck**.

- **Submit:** `POST /v1/me/decks/:id/bulk-import` with
  `{ lemmas[], language?, translationLanguage? }` → `202 { batchId, accepted, skipped }`.
- **Poll:** `GET /v1/me/vocabularies/batches/:batchId` until `pending === 0`;
  drive a determinate bar from `completed / total`.
- The words land **in a deck**, so the user must pick/create a deck first. There is
  **no** standalone "bulk add without a deck." If `accepted === 0` (everything
  already owned), `batchId` is **null** — nothing to poll, show an inline note.

> **Fully specced in the [list design context](user_create_vocabulary_list_design_context.md) §6.6.**
> Listed here only so the "three ways" picture is complete; don't re-design it.

---

## 6. Way 3 — Manual full form — **the focus of this brief**

The full-control path: the user types the word header, every **sense**, and each
sense's **translations** and **examples**. The word is created the moment they
Save. **One request saves everything atomically** — there is no multi-step wizard
on the API side; if any part is invalid, nothing is saved.

- **Endpoint:** `POST /v1/me/vocabularies` (Bearer token + JSON) → `201` with the
  full hydrated word.
- **Open it when:** the user wants full control over content, **or** quick-create
  (Way 1) returned `failed` / an empty result. **Open it pre-filled with the lemma
  the user already typed.**

### 6.1 Data model (what's on screen)

```
NewWord
├─ language        required   (LANGUAGES select; ISO 639-1)
├─ lemma           required   (the word — 1–128)
├─ partOfSpeech    required   (enum select)
├─ ipa             optional   (1–128; mono font is a nice touch)
├─ cefrLevel       optional   (A1…C2 select)
├─ frequencyRank   optional   (integer ≥ 0)
├─ audioUrl        optional   (omit → auto-generate; see §6.3 audio control)
├─ topics[]        optional   (existing slugs only — picker backed by GET /v1/topics)
└─ senses[]        required   1..16   ── repeater
   └─ Sense
      ├─ gloss          optional   (short label, 1–128)
      ├─ definition     optional   (1–2000; char counter)
      ├─ imageUrl       optional   (upload / paste URL)
      ├─ synonyms[]     optional   (tag input, ≤32, each 1–64)
      ├─ antonyms[]     optional   (tag input, ≤32, each 1–64)
      ├─ translations[] optional   0..16  ── repeater (lang ▾ + text + note)
      └─ examples[]     required   **2..16**  ── repeater (sentence + optional translation)
```

A word has **1..16 senses**; each sense has **0..16 translations** and
**2..16 examples**. `senseOrder` is assigned by the server from the order you send
the senses (1-based) — so support reordering *before* save if you want control over it.

### 6.2 Layout (wireframe — adapt, don't copy verbatim)

A single scrollable form (a stepper is acceptable but not required), saved with one
**Save** button. Structure mirrors the body: a **Word header** block, then a
repeatable **Sense** block, each containing repeatable **Translation** and
**Example** rows.

```
‹ Back                         Add a word                          [ Save ]

┌─ Word ─────────────────────────────────────────────────────────────┐
│ Word (lemma) *  [ resilient                                     ]   │
│ Language *      [ English (en) ▾ ]        Part of speech * [ adj ▾ ] │
│ IPA             [ /rɪˈzɪliənt/ ]          CEFR            [ B2  ▾ ]  │
│ Frequency rank  [ 4821 ]      Topics  [ psychology ✕ ] [+ add]      │
│ Audio           (◉) Auto-generate   ( ) Paste URL [               ] │
└────────────────────────────────────────────────────────────────────┘

┌─ Sense 1 ───────────────────────────────────────────────  [⋯] [✕] ─┐
│ Gloss        [ able to recover                                  ]   │
│ Definition   [ Able to recover quickly from difficulties.       ]   │
│                                                        1 999/2000 ↧  │
│ Image        [ upload / paste URL — optional                    ]   │
│ Synonyms     [ tough ✕ ] [ hardy ✕ ] [+ add]                        │
│ Antonyms     [ fragile ✕ ] [+ add]                                  │
│                                                                     │
│  Translations (optional)                                            │
│   [ vi ▾ ]  [ kiên cường ]   note [            ]  ✕                  │
│   [+ add translation]                                               │
│                                                                     │
│  Examples *  (at least 2)                                           │
│   1. [ She is remarkably resilient. ]            ✕(disabled @ 2)     │
│      translation [ Cô ấy kiên cường…           ]                    │
│   2. [ A resilient economy bounces back fast. ] ✕(disabled @ 2)     │
│   [+ add example]                                                    │
└─────────────────────────────────────────────────────────────────────┘

[ + Add another sense ]
```

### 6.3 Field rules → UI behaviour (validate client-side before sending)

The backend rejects anything that breaks these with `400`. **Enforce them in the
form** for instant feedback and to avoid a round-trip.

| Field | Required | Rule | UI treatment |
|---|---|---|---|
| `language` | ✅ | ISO 639-1, `^[a-z]{2}(-[A-Z]{2})?$` (`en`, `vi`, `pt-BR`) | **select**, default the user's app language — never free text |
| `lemma` | ✅ | 1–128 chars | hero text input; pre-fill from quick-add when arriving via fallback |
| `partOfSpeech` | ✅ | `noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection, phrase, other` | **dropdown** (fixed enum) |
| `ipa` | — | 1–128 chars | text input (mono) |
| `cefrLevel` | — | `A1…C2` | **dropdown** (fixed enum) |
| `frequencyRank` | — | integer ≥ 0 | number input |
| `audioUrl` | — | 1–512 chars; **omit → audio auto-generated** | radio: **Auto-generate (default)** vs Paste URL |
| `topics` | — | ≤32 slugs, `^[a-z0-9-]+$`, **each must be an existing system topic** | **picker backed by `GET /v1/topics`** — no free text (unknown slug → `400`). Hide the field entirely if you don't want users assigning topics |
| `senses` | ✅ | **1–16** | repeater; start with **one** sense expanded |
| `senses[].gloss` | — | 1–128 | text input |
| `senses[].definition` | — | 1–2000 | textarea + **counter (2000)** |
| `senses[].imageUrl` | — | 1–512 | upload / paste URL |
| `senses[].synonyms` / `antonyms` | — | ≤32 items, each 1–64 | tag-style inputs |
| `senses[].translations` | — | ≤16; each needs `language` + `translation` (1–255); `note` (≤2000) optional | repeater: lang dropdown + text + **counter (255)** + optional note |
| `senses[].examples` | ✅ | **2–16**; each needs `sentence` (1–1000); `translation` (≤1000) optional | repeater: **seed 2 empty rows**, **disable remove below 2**, **counter (1000)** |

> ⚠️ **The two most common `400`s — catch them client-side:**
> 1. **Fewer than 2 examples per sense.** The minimum is **2** (the extra is held
>    out as a hidden test sentence by the learning module). **Seed every new sense
>    with two empty example rows and disable removing below two.** This is the
>    single most common mistake.
> 2. **A topic slug that doesn't exist.** Only offer existing slugs in the picker.
>
> Also: the API **rejects unknown fields** — don't send extra keys the form
> doesn't use.

### 6.4 Repeaters — interaction rules

- **Senses repeater.** Start with **one** sense expanded. Add / remove (bound
  1–16). Each sense is independent. If you support reorder, do it before save —
  send order decides `senseOrder`.
- **Examples repeater (per sense).** **Always seed two empty rows.** Remove is
  disabled while only two remain. Cap at 16. Each row: a sentence + an optional
  translation field.
- **Translations repeater (per sense).** Optional, 0–16. Each row = language
  dropdown + translation text + optional note. **Default the language dropdown to
  the user's native language** for convenience.
- **Synonyms / antonyms.** Tag-style inputs (chips), up to 32 each, 1–64 chars per
  tag.
- **Character counters** on `definition` (2000), `examples[].sentence` (1000),
  `translations[].translation` (255), and `note` (2000), to pre-empt length `400`s.

### 6.5 Save & response behaviour

- **Required-to-save:** `lemma`, `language`, `partOfSpeech` (the word header) +
  every sense having **≥2 examples**. **Block Save** until these hold; surface
  *why* it's blocked.
- **Atomic save.** One request saves everything. On `400`, **keep the whole form
  populated** and map `message` paths (e.g. `senses.0.examples`) back to the right
  sense / row — don't clear the form on error. `message` is *sometimes a string,
  sometimes an array of strings* — handle both.
- **On `201`:** the word appears in **My Words** immediately (`source: "user"`,
  private, ready to study — no approval). Use the returned `id` to navigate to its
  detail/edit page. **`audioUrl` is `null` right away** — show the speaker as
  "processing" and light it on a later re-fetch; never block the form on audio.
  `enrichmentStatus` is `null` for manual words.

### 6.6 States to design (Way 3)

| State | Trigger | Show |
|---|---|---|
| **Arrived fresh** | user picked "Advanced / fill it myself" | empty form, one sense expanded, two empty example rows, focus on lemma |
| **Arrived from failed quick-add** | the fallback link | same form, **lemma pre-filled**, a calm one-liner "We couldn't auto-build this — fill it in yourself" |
| **Editing / valid** | required fields filled | Save enabled |
| **Editing / blocked** | a sense has <2 examples, or a required header field empty | Save disabled with a clear reason; inline hints on offending rows |
| **Saving** | click Save | button busy ("Saving…"), brief; form stays interactive-disabled |
| **Validation error (`400`)** | server rejects | inline field errors mapped from `message` paths; **form stays populated** |
| **Duplicate (`409`)** | user already owns `(language, lemma, partOfSpeech)` | inline notice near the word header: **"You already have this word"** + a link to **open the existing entry** — *not* a generic toast |
| **Session expired (`401`)** | token invalid | trigger refresh / send to login (don't lose form state) |
| **Saved (`201`)** | success | toast + navigate to the new word; speaker shows "audio processing" |

### 6.7 Error map (Way 3)

| Status | Meaning | Frontend does |
|---|---|---|
| **400** | a field broke validation, an unknown body field was sent, or a `topics` slug doesn't exist | map `message` → offending field(s), inline errors, keep form |
| **401** | missing / expired token | refresh token or route to login |
| **409** | **this user** already has that `(language, lemma, partOfSpeech)` | inline "duplicate" near header + link to open the existing word (scoped to caller — another user's same word is not a conflict) |

---

## 7. The design system to match (neutral shadcn — the user app)

These screens live in the **authenticated user app shell**, not admin and not
`/learn`. **Match the neutral, light/dark shadcn look of the dashboard** — *not*
the mint "Sprout" theme of `/learn` (scoped to `.learn-shell` only) and *not* the
admin soft-accent-card style.

### 7.1 Layout & rhythm
- **Page container:** centered column, `mx-auto w-full max-w-4xl px-4 py-8 sm:px-6
  lg:py-10` for the focused form (it's tall — keep it a single readable column;
  go to 2-col only inside the header block on `sm:`).
- **Back link:** small muted "‹ Back" / "‹ My Words" at the top.
- **Page header:** `font-heading text-2xl font-semibold tracking-tight` + a
  one-line muted description. Section headers (Word / Sense N):
  `font-heading text-lg font-medium tracking-tight`.
- **Primary action** ("Save") sits top-right of the header **and/or** as a sticky
  bottom bar on long forms — the form is tall, so keep Save reachable.

### 7.2 Tokens & primitives (shadcn base, light + dark both first-class)
- Colours are the **neutral root tokens** (oklch greyscale): `background`, `card`,
  `muted`/`muted-foreground`, `primary`, `secondary`, `accent`, `border`, `ring`,
  `destructive`. **Design for `.dark` too** — both themes are first-class.
- **Components — reuse shadcn/ui, don't reinvent:** `Card`/`CardContent` (the
  Word block + each Sense block), `Button` (`default`/`outline`/`ghost`; sizes
  `sm`/`lg`/`icon`), `Input`, `Textarea` (definition), `Select` (language, POS,
  CEFR, translation language), `RadioGroup` (audio auto/URL), `Badge` (tags),
  `DropdownMenu` (sense `⋯`), `Dialog`/`Sheet` if you choose a modal form,
  `Skeleton`/`Sonner` for loading & toasts. A **tag/chips input** is needed for
  synonyms/antonyms (and the topic picker) — if none exists, build a small one
  on top of `Input` + `Badge`.
- **Radii:** `rounded-lg` / `rounded-xl` (base `--radius` 0.625rem). Subtle borders
  (`border-border/60`) over hard lines; light shadows; hover = `ring-foreground/20`.
- **Fonts:** `--font-heading` (Geist Sans) for titles; `font-sans` body; **mono
  (Geist Mono) is a good fit for IPA**.
- **Icons:** `lucide-react` — `Plus` (add sense/example/translation/tag),
  `Trash2`/`X` (remove rows/tags), `Sparkles` (the AI/quick-add cue),
  `Volume2`/`VolumeOff` (audio pending), `ChevronLeft` (back), `Loader2` (saving),
  `MoreHorizontal` (sense `⋯`).
- **Numbers:** `tabular-nums` (frequency rank, char counters). **Muted text:**
  `text-muted-foreground`.

### 7.3 Tone
Calm, clean, **dense-but-readable** — this is a form-heavy utility screen, closer
to a polished CMS detail view than a marketing page. Soft tints over hard borders,
rounded corners, restrained shadows. Make the **word header** read with more
presence than the senses (it's the subject), and keep "add" affordances quiet.

---

## 8. Constraints & edge cases to design a state for

- **Required minimum:** a word = header (`lemma` + `language` + `partOfSpeech`) +
  **≥1 sense**, and **every sense needs ≥2 examples**. Block Save otherwise.
- **Caps:** 1–16 senses; 2–16 examples/sense; 0–16 translations/sense; ≤32
  synonyms/antonyms (1–64 each); ≤32 topics. Enforce bounds in the repeaters.
- **Lengths:** `lemma`/`ipa` ≤128; `definition` ≤2000; `example.sentence` ≤1000;
  `translation` ≤255; `note` ≤2000. Show counters.
- **Enums are dropdowns, never free text:** `partOfSpeech`, `cefrLevel`,
  `language` codes (`^[a-z]{2}(-[A-Z]{2})?$`).
- **Topics:** only existing slugs (`GET /v1/topics`) — an unknown slug `400`s; no
  arbitrary typing.
- **Audio is always late.** `audioUrl` is `null` on `201`; light the speaker on a
  later re-fetch. Never block the form on it.
- **Atomic save:** a `400` saves nothing — keep the whole form, map errors back to
  rows. A `409` is a duplicate of the **caller's own** word — offer to open it.
- **Quick-add fallback:** `failed` or unexpected-empty quick-create must offer
  **"Add it manually"** → this form, lemma pre-filled.
- **Async truth (Ways 1 & 2):** results stream in; `audioUrl` and (for bulk) deck
  membership update after "done" — re-fetch, don't cache hard.

---

## 9. Design goals (the bar to hit)

1. **Quick add is the hero; the manual form is the safety net.** Default the
   surface to typing one word; keep "fill it myself" present but secondary.
2. **Wire the fallback so no word is a dead end.** A failed/empty quick-create
   always offers "Add it manually" with the lemma carried over.
3. **Make the long form feel calm and forgiving.** Clear required-vs-optional,
   never lose typed content on error, map server errors to the exact row,
   pre-empt the two classic `400`s (need 2 examples; real topic slugs only).
4. **Set honest expectations.** "Audio appears shortly", "this is saved instantly",
   "you already have this word" (empty result = success, not failure).
5. **One word family.** A word row looks the same whether quick-created or
   hand-authored, and matches the My Words / list rows elsewhere.
6. **Stay native to the neutral user-app design system** (§7) — shadcn `Card` /
   `Button` / `Select` / `Badge`, light + dark; not the mint or admin styles.

---

## 10. Screen checklist for the designer

Design at minimum:

- [ ] **Add-a-word surface** (entry from `/words`): defaults to **Quick add**, with
      a secondary **"Advanced / fill it myself"** toggle.
- [ ] **Quick add states:** idle → adding → completed (1+ results) → empty (already
      have it) → **failed (with "Add it manually")**. *(Detail in list ctx §6.4.)*
- [ ] **Manual full form (Way 3) — the focus:**
  - [ ] **Word header** block (lemma, language, POS, IPA, CEFR, frequency, topics
        picker, audio auto/URL).
  - [ ] **Sense repeater** (add/remove 1–16, optional reorder), each with gloss,
        definition (counter), image, synonyms/antonyms tags.
  - [ ] **Translations repeater** per sense (0–16; lang ▾ + text + note).
  - [ ] **Examples repeater** per sense (**seed 2, can't go below 2**, ≤16, counters).
  - [ ] **Save states:** valid/blocked, saving, `400` (inline, form kept), `409`
        (duplicate → open existing), `401`, `201` (toast + navigate, audio pending).
  - [ ] **Arrived-from-failed-quick-add** variant (lemma pre-filled + one-liner).
- [ ] **Cross-cutting:** the reusable enrichment-progress treatment (shared with
      Way 2), audio-pending speaker state, error mapping, light + dark.

> **Out of scope here** (owned by [user_create_vocabulary_list_design_context.md](user_create_vocabulary_list_design_context.md)):
> My lists, list detail, the create/edit-list form, bulk import into a deck, and
> the community browse / preview / clone surfaces. This brief is the **"add a
> word"** surface and the **manual full form**.
