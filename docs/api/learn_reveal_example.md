# Backend change — normalize the reveal example onto the session item

**Area:** `POST /v1/me/learn/session` → each `SessionItem` (`QuestionBuilderService`)
**Type:** Additive contract change, build-time. Backward compatible.

## Goal

On every question type, the answer reveal should show the studied word **in a real example sentence + its translation**, not just the bare lemma.

Today the example translation is already computed at session-build time, but it lands in **type-specific fields** and only for the sentence-based builders:

| Question type | Field carrying the example translation | Fallback |
|---|---|---|
| `flashcard` | `example.translation` inside each sense view | none (sent as-is, may be null) |
| `cloze_mcq` / `cloze_typing` / `listening_cloze` | `hintTranslation` | falls back to the sense-level word translation |
| `meaning_in_context` / `sense_disambiguation` | `sentenceTranslation` | null |

The recognition types (`word_from_translation`, `translation_from_word`, `listening_choice`, `image_choice`, `pronunciation`) carry **no example at all**, so their reveal can only show the lemma.

## Why not the `/answer` response

The example is already in hand inside `QuestionBuilderService` at build time (e.g. the flashcard builder reads `ex.sentence`/`ex.translation`; the cloze builder does `hintTranslation: example.translation ?? hint`). Adding it to `/answer` would force the answer handler to re-load an example the builder already had. So normalize it **on the item, at build time** instead.

## Contract change

Add an optional, **unsigned** `example` object to every `SessionItem` (render data, alongside `lemma`/`prompt` — not part of the HMAC-signed envelope):

```jsonc
{
  "sessionItemId": "…",
  "vocabularyId": "…",
  "lemma": "fleeting",
  "type": "word_from_translation",
  // …signed envelope fields…
  "signature": "…",
  "example": {                     // NEW — null when the word has no example
    "sentence": "Fame can be fleeting and unpredictable.",
    "translation": "Danh tiếng có thể phù du và khó lường.",  // null if unavailable
    "highlightedSpan": { "start": 13, "end": 21 }             // null if not locatable
  },
  "prompt": { /* … */ }
}
```

### Field rules

| Field | Type | Rule |
|---|---|---|
| `example` | object \| null | `null` when the word has no stored example. Populate on **all** types, including the recognition ones. |
| `example.sentence` | string | The example sentence in the **target language**. Required when `example` is non-null. |
| `example.translation` | string \| null | Translation of `sentence` in the session's `translationLang`; `null` when none is stored. Reuse the same value already fed to `hintTranslation`/`sentenceTranslation`/the flashcard sense — but **without** the sense-level word fallback (this field is specifically the *sentence* translation; use `null` if the sentence itself has none). |
| `example.highlightedSpan` | `{start,end}` \| null | Inclusive-start / exclusive-end char offsets of the studied word in `sentence`, for emphasis. `null` when it can't be located. Same convention as `meaning_in_context.highlightedSpan`. |

### Which example to pick

- Prefer the example the question was built from — the item's **`exampleId`** — so the reveal matches the sentence the learner saw (cloze/context types).
- When the question wasn't built from a sentence (recognition types, `exampleId: null`), fall back to the word's **primary/first** sense example.
- No new data source: this is the same `example` the sentence builders already read — just also attached to the envelope for the recognition types and normalized into one shape.

## Rules & notes

- **Unsigned.** `example` is render-only; it does **not** join the signed field set and is **not** echoed to `/answer`. No signature/expiry impact.
- **All types, incl. a wrong answer.** The reveal shows it regardless of `correct`.
- **Respects `translationLang`**, like the existing translation fields.

## Non-goals

- No change to grading, scheduling, `requeue`, or question selection.
- Not removing the existing `hintTranslation` / `sentenceTranslation` / flashcard `example` fields — those still drive in-question hints and the flashcard study card (see cleanup below).

## Frontend status

**Already implemented, forward-compatibly** — the client renders `item.example` under the correct/incorrect strip on every type ([example-reveal.tsx](../../src/app/(app)/learn/questions/_shared/example-reveal.tsx), passed through [card-footer.tsx](../../src/app/(app)/learn/questions/_shared/card-footer.tsx) from [session-runner.tsx](../../src/app/(app)/learn/session-runner.tsx)). Until the backend populates `example`, it renders nothing — no regression. The moment the field ships, every reveal gains the sentence + translation.

### Follow-up cleanup (after this ships)

Once `example` is live, the in-card `SentenceGloss` reveals on the `cloze_*` / context types duplicate the footer example and can be retired for a single, uniform reveal block — a small frontend-only PR, tracked separately so it doesn't gate this change.

## Acceptance criteria

1. A `word_from_translation` item now includes `example.sentence` (+ `translation` when stored) → its reveal shows the word in a sentence, not just the lemma.
2. A word with no stored example returns `example: null` and the reveal is unchanged.
3. `translation` matches the session's `translationLang`; `null` when unavailable (no sense-word fallback here).
4. `highlightedSpan` (when present) bounds the studied word within `sentence`.
5. `example` is present on every item in the session, all question types.
