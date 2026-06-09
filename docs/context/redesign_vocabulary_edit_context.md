# Edit Vocabulary — Redesign Context

A design brief for redesigning the **admin "Edit vocabulary" screen**. Read this
before touching any layout so the redesign matches the data, interactions, and
design system already in place — and breaks none of the wiring.

---

## 1. What this screen is

The single-word admin editor at route `/admin/vocabularies/[id]`. An admin opens
it to **edit one vocabulary entry** and its full sense tree (definitions,
translations, examples), assign topics, and — for AI-generated drafts — approve &
publish. It is a **dense, form-heavy utility screen**, not a marketing page.

Two states share the same layout:
- **Published word** (`isApproved: true`) — normal edit.
- **Unapproved AI draft** (`isApproved: false`) — an amber "approve & publish"
  banner appears at the top; drafts are invisible to learners until approved.

---

## 2. Files (component map)

| File | Role |
|---|---|
| [page.tsx](src/app/(admin)/admin/vocabularies/[id]/page.tsx) | Server component. Page shell, data fetch, composes the sections below. |
| [vocab-fields-form.tsx](src/app/(admin)/admin/vocabularies/[id]/vocab-fields-form.tsx) | Header (lemma + badges + Save/Delete) and the top-level **Details** field form. |
| [draft-approve-banner.tsx](src/app/(admin)/admin/vocabularies/[id]/draft-approve-banner.tsx) | Amber draft banner with "Approve & publish". |
| [sense-list.tsx](src/app/(admin)/admin/vocabularies/[id]/sense-list.tsx) | Ordered list of senses + an "add sense" form. |
| [sense-card.tsx](src/app/(admin)/admin/vocabularies/[id]/sense-card.tsx) | One editable sense: fields, reorder ▲▼, delete, sub-editors. |
| [translation-editor.tsx](src/app/(admin)/admin/vocabularies/[id]/translation-editor.tsx) | Per-sense translations: list + delete + add. |
| [example-editor.tsx](src/app/(admin)/admin/vocabularies/[id]/example-editor.tsx) | Per-sense examples: list + delete + add. |

Types live in [types.ts](src/lib/admin/types.ts) (`VocabularyDetail`,
`AdminSense`, `AdminTranslation`, `AdminExample`). Server Actions live in
`src/lib/admin/actions.ts` and `src/lib/admin/quick.ts`.

---

## 3. Data model (what's on screen)

```
VocabularyDetail
├─ lemma              string        (headword — the title)
├─ partOfSpeech       string        (noun, verb, …)
├─ language           enum          (LANGUAGES select)
├─ cefrLevel          A1…C2 | null
├─ ipa                string | null
├─ frequencyRank      number | null
├─ audioUrl           string | null
├─ source             "system" | "user"   (badge)
├─ isApproved         boolean             (drives draft banner)
├─ enrichmentStatus   pending | enriched | failed | null
├─ topics[]           { slug, name }      (checkbox grid)
└─ senses[]           ordered
   └─ AdminSense
      ├─ senseOrder       number   (1-based index chip)
      ├─ gloss            string | null   (short label)
      ├─ definition       string | null
      ├─ imageUrl         string | null
      ├─ translations[]   { language, translation }
      └─ examples[]       { sentence, translation? }
```

A word has **1..N senses**; each sense has **0..N translations and 0..N
examples**. Senses are reorderable.

---

## 4. Current layout (wireframe)

Single centered column, `max-w-3xl`, stacked cards:

```
← Vocabulary                                    (back link)

┌─ [amber banner — only for unapproved drafts] ──────────────┐
│ ✦  Unapproved AI draft                    [Approve & publish]│
└────────────────────────────────────────────────────────────┘

 abandon                              [Save changes] [Delete word]   ← header
 (verb) (English) (B2) (system)                                      ← badges

┌─ Details ──────────────────────────────────────────────────┐
│  Lemma            | Part of speech                          │
│  Language         | CEFR level                              │
│  IPA              | Frequency rank                          │
│  Audio URL (full width)                                     │
└────────────────────────────────────────────────────────────┘

┌─ Topics ───────────────────────────────────────────────────┐
│  [✓] Travel  [ ] Food  [ ] Business  …   (2–3 col checkbox) │
│  [Save topics]                                              │
└────────────────────────────────────────────────────────────┘

┌─ Senses (N) ───────────────────────────────────────────────┐
│  ┌─ sense card ───────────────────────────────────────────┐│
│  │ (1)                                       ▲  ▼  🗑       ││
│  │ Gloss · Definition · Image URL   [Save sense]           ││
│  │ TRANSLATIONS   vi: bỏ rơi  ✕                            ││
│  │   [vi ▾] [____] [Add]                                   ││
│  │ EXAMPLES   │ "He abandoned…" — …  ✕                     ││
│  │   [_______] [translation] [Add example]                ││
│  └────────────────────────────────────────────────────────┘│
│  … more sense cards …                                       │
│  ┌─ dashed "Add a sense" form ────────────────────────────┐│
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

---

## 5. Interactions & behavior to preserve

This screen uses **many independent forms**, each saving its own slice via a
Server Action. Do **not** collapse them into one giant form.

- **Header "Save changes"** lives *outside* the Details `<form>` and submits it
  via the HTML `form={FORM_ID}` attribute (`FORM_ID = "vocab-fields-form"`).
  Pending state comes from `useActionState`, not `useFormStatus`. Keep this
  decoupling — the button can sit anywhere visually but must keep `form={...}`.
- **Each sense card** has its own "Save sense" form; translations, examples,
  reorder, delete, and "add" are each **separate forms** posting hidden
  `vocabularyId` / `senseId` / row id fields. Preserve every hidden input.
- **Reorder ▲▼** posts the *entire* reordered id list (not a delta). First sense
  has ▲ disabled, last has ▼ disabled.
- **Destructive actions** (delete word / sense / translation / example) go
  through `ConfirmButton` (native confirm). Keep the confirm step.
- **Feedback**: success → `sonner` toast; field errors → inline
  `role="alert"` text. Keep both.
- **Draft approve** is a client action that toasts then `router.refresh()`.

---

## 6. Design system — reuse, don't reinvent

Tailwind v4 + shadcn/ui, neutral grayscale theme, light/dark via `.dark`. Tokens
in [globals.css](src/app/globals.css). **Use semantic tokens, never hard-coded
colors** (the one allowed exception is the amber draft banner, which is
intentionally off-palette to signal "unpublished").

- **Fonts**: `--font-heading` (= Geist Sans) for the lemma title; `font-sans`
  body. Mono = Geist Mono (good candidate for IPA).
- **Color tokens**: `background / foreground`, `card / card-foreground`,
  `muted / muted-foreground`, `primary`, `border`, `input`, `ring`,
  `destructive`. Radius scale `--radius` = 0.625rem (`rounded-lg` etc.).
- **Primitives already in use** — prefer these:
  - `Card / CardHeader / CardTitle / CardContent`, `Button`, `Input`, `Label`
    from `@/components/ui/*`.
  - Admin helpers: `ActionForm` (wraps a Server Action + toast/reset),
    `AdminSubmit` (submit button with pending spinner), `ConfirmButton`.
  - Local `Badge` with tones via `cefrTone` / `sourceTone` / `toneClass` from
    `@/lib/admin/badge-tones`.
  - Native `<select>` styled with the shared `selectClass` string (h-8, rounded-lg,
    focus ring) — match it if you add selects.
- Icons: `lucide-react` (`ChevronLeft/Up/Down`, `Trash2`, `X`, `Loader2`,
  `Sparkles`, `Check`).

---

## 7. Hard constraints (must NOT break)

1. Keep it a **Server Component page** (`page.tsx`) composing client islands; the
   header form and banner are the client pieces. Don't make the whole page a
   client component.
2. Keep **every Server Action wiring**: action names, hidden inputs, `name`
   attributes, `FORM_ID`, the `form={FORM_ID}` cross-form submit.
3. Preserve **accessibility**: `<Label htmlFor>` pairings, `aria-label` on
   icon-only buttons, `role="alert"` errors, visible focus rings.
4. **Responsive**: must work from ~360px up. Details grid is 1-col on mobile →
   2-col `sm:`. Topics 2-col → 3-col `sm:`. Don't introduce horizontal scroll.
5. Keep **light + dark** parity.
6. The amber draft banner must stay clearly distinct from published state.

---

## 8. Redesign goals (the problem to solve)

The current screen is functional but flat and monotonous — four stacked cards of
equal weight, a long scroll, and sense cards that get visually noisy once
translations + examples fill in. Improve **clarity and scannability** without
losing density:

- Give the **header / identity** (lemma, IPA, badges, audio) more presence — it's
  the subject of the whole page but currently reads like plain text.
- Make **sense cards** easier to parse: clearer separation between the sense's own
  fields and its translations/examples sub-sections; calmer "add" affordances;
  better empty states.
- Reduce the feeling of one endless column — consider grouping, sticky save, or a
  two-region layout (identity/meta vs. senses) **on wide screens only**, while
  staying single-column on mobile.
- Tighten the **visual rhythm**: consistent spacing, heading scale, and use of
  muted vs. foreground so the eye lands on lemma → senses → actions.
- Keep edits **low-friction**: saving any slice should feel obvious; pending and
  success feedback should be unmistakable.

Aim: a clean, confident **admin/editorial** feel — closer to a polished CMS
detail view than a generic form dump. Not playful, not marketing.

---

## 9. Out of scope

- Backend/contract changes, new fields, or new Server Actions.
- The list page, review queue, quick-create, bulk, or import screens.
- `synonyms` / `antonyms` (present in the type but not edited here today).
- The `/learn` mint theme (a separate scoped design system — do not pull it in).
```
