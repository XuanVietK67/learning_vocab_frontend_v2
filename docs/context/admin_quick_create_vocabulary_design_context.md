# Design context — Admin AI-assisted vocabulary creation

A self-contained brief for designing the **admin "quick add word" + "bulk import words"** screens. Everything a designer needs is here — you do **not** need the codebase. It covers what the feature does, the exact data and async behaviour to design around, every UI state, the existing design system to stay consistent with, and the concrete screens to lay out.

> Source of truth for the API behaviour: [admin_quick_create_vocabulary.md](../api/admin_quick_create_vocabulary.md) (single) and [admin_bulk_quick_create_vocabulary.md](../api/admin_bulk_quick_create_vocabulary.md) (bulk). This file translates those into design requirements.

---

## 1. The big picture (what we're designing)

Today an admin creates a vocabulary word by hand-filling a long form: lemma, part of speech, IPA, every sense, every definition, translations, ≥2 example sentences, synonyms/antonyms, image. It's accurate but slow.

The backend now offers an **AI-assisted shortcut**. The admin gives only the *word(s)*; a background worker enriches each one (dictionary + an LLM called "Gemma") into fully-formed **draft** vocabularies. The admin then **reviews and approves** the drafts. Drafts are invisible to learners until approved.

There are **two entry points**, both ending in the same review-and-approve step:

| Flow | Admin gives | Produces |
|---|---|---|
| **Single quick-create** | one word | 1+ drafts (one per part of speech) |
| **Bulk quick-create** | a pasted list / uploaded file (optionally tagged with a topic) | many drafts |

**This is fundamentally asynchronous.** Submitting does **not** return a finished word — it returns a *job*. The drafts appear seconds-to-minutes later. The entire UX challenge is making waiting feel productive and making the review step fast.

### The mental model to communicate to the admin
```
   TYPE A WORD            WAIT (AI works)         REVIEW DRAFTS          PUBLISH
  ┌────────────┐         ┌─────────────┐         ┌────────────┐       ┌─────────┐
  │  "run"     │  ───▶   │  enriching… │  ───▶   │  run (verb)│ ───▶  │ approve │
  │            │         │  ▓▓▓▓░░░ 60% │         │  run (noun)│       │  each   │
  └────────────┘         └─────────────┘         └────────────┘       └─────────┘
    submit (202)            poll job              draft queue          published
```

---

## 2. Flow 1 — Single quick-create

The admin types **one word** and submits. Design four moments: **input → working → results → review handoff.**

### 2.1 API shape (what drives the UI)
- **Submit:** `POST …/vocabularies/quick` with `{ lemma, language? }` → returns a **job** immediately (HTTP 202).
- **Poll:** `GET …/vocabularies/quick/:jobId` every ~2s until done.
- Job object the UI reacts to:
  ```jsonc
  {
    "id": "8b1f…",              // jobId
    "lemma": "ephemeral",
    "language": "en",
    "status": "pending",        // pending | completed | failed
    "resultVocabularyIds": [],  // filled when completed — the draft ids
    "error": null               // a message when status = failed
  }
  ```

### 2.2 Inputs to design
- **Word (lemma)** — single-line text, required, 1–128 chars. The hero input; make it the focal point.
- **Language** — a select, defaults to English (`en`). Secondary, small. (Note for copy: non-English words skip the dictionary and get no IPA — an optional hint.)
- **Submit** — primary action ("Enrich" / "Add word" / "Generate").

### 2.3 The states to design (this is the important part)

| State | Trigger | What to show |
|---|---|---|
| **Idle** | first load | The input, language, submit. Optional one-line explainer of what happens ("AI drafts the word; you review before it goes live"). |
| **Submitting** | click submit | Button busy/disabled, brief. |
| **Working / pending** | job `status: pending` | A clear "We're building **ephemeral**…" working state. Indeterminate progress (we don't get a %). Reassure it runs in the background — the admin can navigate away and it keeps going. Show the word being processed. |
| **Completed — has results** | `status: completed`, `resultVocabularyIds` non-empty | Success. Show how many drafts were created and that one word can yield several (e.g. *"Created 2 drafts: a verb and a noun"*). Primary CTA → go review them. |
| **Completed — empty** | `status: completed`, ids empty | **This is a success, not an error.** Means every part of speech already existed in the catalog. Friendly "Nothing new to add — '{word}' is already covered." Offer: view the existing word / try another. |
| **Failed** | `status: failed` | Show `error`. Offer **Retry** and a **fall back to the full manual create form** link. Keep it calm — machine enrichment can just not find a word. |

### 2.4 Behaviour notes for the designer
- **Idempotent submit:** re-submitting the same word while a job is still pending returns the *same* job. So a double-click shouldn't spawn a second working card — design as one job at a time per word.
- **One word → many drafts.** Never assume a single result. Render results as a small list/stack.
- **Don't block the screen while polling.** The admin should be able to queue another word or leave. Consider a small "in progress" affordance that persists (a toast, a mini-queue, or a card list) rather than a full-screen blocker.

---

## 3. Flow 2 — Bulk quick-create (list / file import)

The admin imports **many words at once**, optionally tagging them all with a **topic**. This is a **mandatory two-step**: extract candidates → admin confirms the list → enrich. Never auto-run enrichment on raw extracted text (PDFs are noisy).

### 3.1 The four phases
```
 PICK SOURCE          REVIEW CANDIDATES        ENRICH (batch)          REVIEW DRAFTS
┌─────────────┐      ┌──────────────────┐     ┌──────────────┐       ┌────────────┐
│ topic?      │      │ ☑ ephemeral      │     │ 12 / 50 done │       │ draft queue│
│ paste / file│ ───▶ │ ☑ serendipity    │ ──▶ │ ▓▓▓░░░░░ 24%  │  ──▶  │ approve…   │
│ mode + lang │      │ ☐ the  ☐ a  (junk)│     │ trickling in │       │            │
└─────────────┘      └──────────────────┘     └──────────────┘       └────────────┘
   extract              confirm checklist        poll batch            (same as §4)
```

### 3.2 Phase 1 — Source & options (the input screen)
Design a form with:
- **Topic picker** *(optional)* — choose 0–many existing topics; every imported word gets tagged with them. Present as a searchable multi-select / chips. Copy idea: *"Pick a topic, then paste your list — everything you import lands in it."* (Only existing topics are valid; an unknown one fails the whole submit.)
- **Source** — two ways, mutually exclusive:
  - **Paste text** — a large textarea.
  - **Upload file** — `.txt`, `.csv`, `.xlsx`, `.pdf`, **max 5 MB**. Design a dropzone + file chip with size and a remove control.
- **Mode** — a toggle: **List** (default — each line/cell/comma entry kept as-is, phrases preserved) vs **Prose** (for articles — tokenises words, strips stopwords). Explain the difference inline; this choice materially changes results.
- **Language** — select, default `en`.
- **Action:** "Extract" / "Find words".

### 3.3 Phase 2 — Confirm the candidates (the curation screen)
Extraction returns a **candidate list + stats**:
```jsonc
{
  "lemmas": ["ephemeral", "serendipity", "ubiquitous"],
  "stats": {
    "extracted": 42,          // raw tokens/cells found
    "deduped": 7,             // duplicates collapsed
    "removedStopwords": 18,   // prose mode only
    "alreadyInCatalog": 14,   // already in the system, dropped
    "capped": false           // true if truncated to 1000
  }
}
```
Design:
- **An editable checklist** of candidate words — each tickable, all ticked by default; admin unticks junk. For long lists, design select-all / deselect-all, a count of selected, and ideally a quick search/filter. Words should be skimmable (chips or a dense list).
- **A stats summary** — a compact band of figures explaining what the extractor did: *"42 found · 7 duplicates merged · 18 stopwords removed · 14 already in catalog"*. If `capped` is true, show a clear warning: *"List truncated to 1,000 words."*
- **Editing:** allow removing words; nice-to-have: add a word the extractor missed.
- **Action:** "Enrich N words" (label reflects the selected count). Confirm if the count is large.

### 3.4 Phase 3 — Batch progress
Submitting the confirmed list returns a **batch**:
```jsonc
// submit response
{ "batchId": "9c2e…", "accepted": 2, "skipped": 1 }  // skipped = already had a job / already exists
// poll  GET …/quick/batch/:batchId  every ~3–5s
{ "batchId": "9c2e…", "total": 2, "pending": 1, "completed": 1, "failed": 0,
  "resultVocabularyIds": ["…"] }   // grows as words finish
```
Design:
- A **determinate progress bar** (completed+failed / total) — we *do* have counts here, unlike the single flow.
- **Live counters:** total / completed / pending / failed. Failed should be visually distinct but not alarming.
- A note that **drafts appear gradually** ("words are enriched one by one, rate-limited — a big batch can take minutes"). Don't imply instant completion.
- The admin can leave; the batch keeps running. Provide a way back to this progress (e.g. from a batches list or a persistent indicator).
- A "skipped" explainer when `skipped > 0`: *"3 already existed or were already queued — they were tagged with your topic but not recreated."*

### 3.5 Topic tagging subtlety (worth a tooltip)
When a topic is chosen, it's attached to **every word the import touches** — including words that were *skipped because they already exist* (they get tagged in place, even though they don't appear in `resultVocabularyIds`). So "I imported 50 words into 'Academic'" can be true even if only 10 new drafts were created. The copy should make this reassuring, not confusing.

---

## 4. Shared step — Review & approve the drafts

Both flows produce **draft vocabularies** (`isApproved: false`). This is where quality is enforced, so it deserves real design attention — it's the step admins repeat most.

### 4.1 What a draft is
A normal, fully-populated vocabulary row, just unapproved and hidden from learners. It has: lemma, part of speech, IPA, CEFR level, senses (each with gloss, definition, translations, ≥2 examples, synonyms/antonyms), topics. **Quality is machine-generated and can be wrong** — IPA and example sentences especially. The review UI's job is to make errors easy to spot and fix.

### 4.2 Actions per draft
- **Edit** — fix any field (uses existing granular editors).
- **Approve** — publishes it. On approve, audio + per-sense images generate **in the background**, so they're usually still missing right after approval (re-fetch later to see them). Design for "approved but media pending."
- **Reject** — delete the draft.
- Approving is **idempotent** and per-draft. Nice-to-have: **approve several at once** (admins often import a batch and want to bulk-approve the good ones).

### 4.3 Review states
- **Queue with drafts** — the list of pending drafts (with the source flow's words highlighted, ideally). Each draft skimmable enough to judge without opening.
- **Reviewing one draft** — detail/edit view with clear "Approve" / "Reject".
- **Approved (media pending)** — published, audio/image still generating.
- **Empty queue** — nothing to review.

---

## 5. Existing design system (match this exactly)

These screens live inside the existing **admin** area. Stay visually consistent with it. This is a clean, modern, **light/dark** dashboard built with Tailwind + shadcn/ui. Below is the actual vocabulary of the existing admin screens.

### 5.1 Layout & rhythm
- **Page container:** centered, `max-w-3xl` for focused forms (create/import) and `max-w-6xl` for list/table screens. Generous padding (`px-4 sm:px-6`, `py-8 lg:py-10`), vertical stack with `gap-5/6`.
- **Back link:** small muted "‹ Vocabulary" link at the top of detail/form pages.
- **Page header:** `font-heading`, 2xl, semibold, tight tracking, with a one-line muted description beneath.
- **Primary actions** sit top-right of list headers ("Import", "New word" buttons).

### 5.2 The signature pattern — accent SectionCard
Forms are built from **soft-tinted, left-accent-bordered section cards**, each with a colored icon chip + title + description. This is the house style — reuse it for the new screens.
- Card: `rounded-xl border border-l-4 p-5 shadow-sm`, soft tinted background.
- Icon chip: `size-9 rounded-lg`, tinted bg + matching icon color.
- **Accent palette** (cycled to distinguish sections/senses): **indigo, violet, sky, emerald, amber, rose**. Each has a light + dark variant. Examples:
  - indigo — bg `indigo-50/40`, chip `indigo-100/indigo-600`
  - emerald — used for "Senses"
  - violet — used for "Topics"
- The **New word** page uses a gradient hero header: icon in a `indigo→violet` gradient square, title + description, on a soft `indigo→violet→sky` tinted card. The new AI flows could echo this with a **Sparkles** icon to signal "AI-assisted."

### 5.3 Components & tokens already in use
- **Buttons:** shadcn variants — `default` (primary, solid), `outline`, `ghost`; sizes `sm`, `lg`, `icon-sm`. Loading state = spinner (`Loader2Icon animate-spin`) + busy label ("Importing…").
- **Inputs/selects:** `h-8`, `rounded-lg`, subtle border, focus ring (`ring-3 ring-ring/50`). Labels above fields.
- **Badges:** small `rounded-md` pills with inset ring, tone-colored. Status uses a tiny colored dot + label:
  - **Approved** = emerald dot + "Approved"
  - **Pending** = amber dot + "Pending" ← drafts use this
  - CEFR levels and source ("system"/"user") are also badge-toned.
- **Tables:** light, `rounded-xl ring-1`, muted header row, zebra `even:bg-muted/20`, row hover. Columns are compact (`px-3 py-2.5`). The vocab table shows: lemma (+IPA beneath), image thumbnails (with "+N" overflow chip), POS, language, CEFR, source, status, sense count, topics, updated date, row actions (edit ✏ / delete 🗑 ghost icon buttons).
- **Empty states:** dashed-border rounded box, centered muted text (e.g. "No vocabularies match these filters.").
- **Filter bar:** inline row of search input + small selects + a "Clear" ghost button.
- **Icons:** `lucide-react`. In use: BookOpen, Layers, Tags, Plus, Upload, Sparkles, Search, Pencil, Trash2, ChevronLeft, Image, Loader2. Use **Sparkles** for AI enrichment, **Upload** for file, **ListChecks** for the confirm step, etc.
- **Typography:** a heading font (`font-heading`) for titles; system/sans for body. Muted text via `text-muted-foreground`. Numbers use `tabular-nums`.
- **Color semantics:** `primary` for main actions, `destructive` for delete/errors, `muted` for secondary surfaces/text. Success surfaces use `primary/10` or emerald tints.

### 5.4 Tone
Calm, dense-but-readable, professional. Soft tints over hard borders. Rounded corners (`rounded-lg`/`rounded-xl`). Subtle shadows. Light and dark mode both first-class.

---

## 6. Where these screens fit (navigation)

- The vocab **list page** (`/admin/vocabularies`) currently has top-right **Import** and **New word** buttons. The new AI flows need entry points here — e.g. a **"Quick add"** (single) and **"Bulk import"** (the new AI extract flow) alongside / replacing the existing buttons. *Design decision to surface:* there is already a separate legacy "Import" page that pastes **raw JSON** to upsert words — that is **not** this AI flow. Consider how to present "manual JSON import" vs "AI quick import" without confusing admins (e.g. group AI options under a "Quick add ✨" menu, keep JSON import as an advanced/secondary path).
- The **review queue** is the existing list filtered to `isApproved=false` (pending drafts). It can be a dedicated "Review drafts" view or a filter chip on the main list — your call; a dedicated, more review-optimized surface is the better experience when a batch produces dozens of drafts.

---

## 7. Constraints, caps & edge cases to design for

- **Single:** lemma 1–128 chars. Idempotent while a job is pending.
- **Bulk file:** `.txt/.csv/.xlsx/.pdf`, **≤ 5 MB** (show a 413/too-big error state).
- **Bulk extract:** capped at **1,000 candidates** (`stats.capped` → warn).
- **Bulk enrich:** **1–500 lemmas** per submit; each 1–128 chars.
- **Topics:** 0–32 slugs, must already exist — an unknown topic **fails the whole bulk submit (400)**. Design the picker to only offer real topics (no free text) to avoid this.
- **Throughput:** enrichment is **rate-limited** (shared LLM key). A 200-word batch can take many minutes — the progress UI must set that expectation; drafts arrive in a trickle, not all at once.
- **Not lemmatised:** "running" imports as "running", not "run". The confirm step is where the admin catches this.
- **Errors to have a state for:** 400 (validation / unknown topic), 401 (session expired), 403 (not an admin — screen shouldn't be reachable), 404 (job/batch id unknown — may have been deleted), 413 (file too big), and `status: failed` jobs.
- **Empty-but-successful:** single completed with no ids, and bulk where everything was skipped (`batchId: null`) — both are "nothing new," not failures.

---

## 8. Design goals (the bar to hit)

1. **Make waiting calm and non-blocking.** The async wait is the core of this feature — never trap the admin behind a spinner; let them keep working and come back.
2. **Two-phase bulk must feel deliberate, not tedious.** The confirm step is a feature (it saves a rate-limited pipeline) — frame it as "review before we spend effort," and make unticking junk fast.
3. **Set honest expectations.** Counts, progress, "this can take minutes," "drafts appear gradually," "media generates after approval."
4. **Make review fast.** Skimmable drafts, obvious approve/reject, ideally bulk-approve. Surface the fields most likely to be AI-wrong (IPA, examples).
5. **Reassure on the confusing bits.** Empty results = success; skipped words still got tagged; one word can become several drafts.
6. **Stay native to the admin design system** (§5) — soft accent cards, badges, the existing table/empty-state/button vocabulary.

---

## 9. Screen checklist for the designer

Design at minimum:

- [ ] **Entry points** on the vocab list (how Quick add / Bulk import are surfaced vs the existing buttons).
- [ ] **Single quick-create:** input → working → results → empty → failed.
- [ ] **Bulk — phase 1:** topic + source (paste/upload) + mode + language.
- [ ] **Bulk — phase 2:** candidate checklist + stats + capped warning.
- [ ] **Bulk — phase 3:** batch progress (bar + counters + skipped note).
- [ ] **Review queue:** list of pending drafts with approve / reject (+ bulk approve).
- [ ] **Draft detail/review:** edit + approve/reject, "media pending after approve" state.
- [ ] **Cross-cutting:** error toasts/banners, empty states, a persistent "in-progress jobs/batches" affordance so async work is never lost.
