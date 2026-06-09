# Design brief — redesign the normal learning flow (`/learn`)

> **For:** a Claude design pass (e.g. `design-taste-frontend`).
> **Goal:** produce a fresh visual + layout design for the signed-in user's
> **vocabulary learning session**. The new design **may fully replace** the
> current `/learn` layout.
> **Source of truth for behavior:** [learn_session_ui_flow.md](../api/learn_session_ui_flow.md)
> (the screen-by-screen journey) and [learn_vocabulary_flow.md](../api/learn_vocabulary_flow.md)
> (the exact field shapes). This brief distills both for a designer — you do not
> need to read the backend contract to design, but everything here traces back to it.

---

## 1. What this is

A vocabulary-learning app (think Duolingo / Anki, web-first). A signed-in user
runs a **learn session**: a guided loop where the **server picks the words,
builds the questions, grades the answers, and schedules the next review**. The
client's whole job is four moves:

> **pick a source → start one session → render & answer each question → show a finish screen.**

You are redesigning the surface of that loop — the layouts, components, type,
color, motion, and feel. **You are not changing the loop itself**: the API
calls, the data shape, and the state transitions are fixed (see §7, out of scope).

## 2. Who it's for & the feeling

- **User:** a motivated language learner doing a short daily study burst (a few
  minutes, often on mobile, sometimes desktop). One question fills the screen at
  a time; they answer, get instant feedback, move on.
- **Current feel:** a playful, "study-card" aesthetic — a single white card
  centered on a soft grey field, mint-green accent, rounded everything, Nunito
  font, light gamification (streak flame, confetti on correct, shake on wrong).
- **Direction is open.** Keep the friendly/gamified energy, evolve it, or take it
  somewhere more refined — your call as the designer. The one hard requirement is
  that the **focus, calm, and one-question-at-a-time clarity** survive: this is a
  focus surface, not a marketing page. Avoid visual noise that competes with the
  question.

## 3. Tech & platform constraints (must respect)

- **Stack:** Next.js 16 (App Router) + React 19 + **Tailwind v4** + **shadcn/ui**.
  Design in terms that map to utility classes and shadcn primitives (Button,
  Badge, Progress, Popover, Dialog, Skeleton, etc.).
- **Theming:** the app ships **light and dark**. Colors are CSS variables in
  `oklch` (see `src/app/globals.css`). The `/learn` route currently layers a
  **scoped theme** (class `.learn-shell`) that overrides the shadcn tokens with a
  mint palette + Nunito and adds keyframes. You may restyle or replace this scoped
  theme, but stay token-driven so reused shadcn primitives inherit the look.
- **Responsive:** mobile-first. The session is a centered column, currently
  `max-w-3xl` card on desktop, full-bleed-ish on phones.
- **Motion:** respect `prefers-reduced-motion` (existing CSS already neutralizes
  animations under it — keep that contract).
- **Keyboard:** desktop users drive it by keyboard — `Enter` checks a ready
  answer / continues; `Space`/`Enter` flips a flashcard. Design states that read
  well without a pointer (clear focus rings, an obvious "ready to submit" state).
- **Accessibility:** legible contrast in both themes, real focus states, audio
  controls have labels, color is never the only signal for correct/wrong.

## 4. The journey — every screen/state to design

The session is a small state machine. Design **all** of these states; they are
the full surface area.

```
PICK_SOURCE ──(start session)──▶ LOADING
LOADING ──(no items)──▶ EMPTY(reason)
LOADING ──(has items)──▶ QUESTION(i)
QUESTION(i) ──(answer)──▶ FEEDBACK(i)   (reveal correct/incorrect)
FEEDBACK(i) ──(more in queue)──▶ QUESTION(i+1)
FEEDBACK(i) ──(queue drained)──▶ COMPLETE (summary)
QUESTION ──(question expired >30 min)──▶ EXPIRED (retry)
any ──(load failed)──▶ ERROR (retry)
```

| # | Screen / state | Purpose | Key content to design |
|---|---|---|---|
| 1 | **Source picker** | Choose what to study (`mode`) | Four sources: **Daily mix**, **Review** (only when cards are due), **Topic**, **Deck**. Daily/Review start immediately; Topic/Deck open a sub-picker. |
| 1a | **Topic picker** | Pick a topic | Grid/list of topics, each `{ name, iconUrl }`. Tap one to start. |
| 1b | **Deck picker** | Pick a deck | List of decks, each with `name`, `description`, and a `vocabCount` ("50 words"). May have a "suggested" headline row + a fuller catalog/own-decks list. |
| 2 | **Loading** | Session is being built | A skeleton of the study card (don't bounce layout when the real card arrives). |
| 3 | **Question runner** | The core study screen | One question at a time. See §5 — **12 question types**. Persistent chrome: question-type label, progress, streak, settings, audio. |
| 4 | **In-card feedback** | Grade reveal after answering | Correct vs. incorrect treatment; **always reveal the canonical correct answer** (especially when wrong); a "Continue" affordance. |
| 5 | **Empty state** | Session had nothing to run | Four reasons, each its own copy/illustration (see §6). |
| 6 | **Expired / Error** | Stale question or failed load | A calm retry panel ("this question expired — start a fresh session"). |
| 7 | **Session summary** | End-of-run (and mid-run peek) | Accuracy %, correct/total, best streak, "Study again" + "Back to dashboard". Currently a modal over a dimmed backdrop. |

There is also an upstream **Home / dashboard** that launches the session via a
primary CTA ("Review N cards" when `dueNow > 0`, otherwise "All caught up"). The
dashboard itself is out of scope for this brief, but design the session so it
feels like a natural continuation of a dashboard CTA.

## 5. The heart of it — the 12 question types

The runner renders **one signed question at a time**. The server decides which
type comes next; **the client never chooses** — it renders whatever `type`
arrives. Your runner layout must gracefully host all twelve. They fall into a few
interaction families:

| Type | Family | What's on screen | How the user answers |
|---|---|---|---|
| `flashcard` | **Study / self-rate** | Word (lemma) + IPA + part of speech + image tile; flips to reveal meaning(s): translation, gloss, definition, example, synonyms/antonyms; audio | Flip to reveal, then **self-rate**: `Forgot / Hard / Good / Easy` |
| `cloze_mcq` | **Multiple choice** | A sentence with a blank + a translation hint + optional audio | Pick one of the options |
| `meaning_in_context` | **Multiple choice** | A sentence with a **highlighted span** | Pick the right meaning/translation option |
| `sense_disambiguation` | **Multiple choice (match)** | Two example sentences + two candidate meanings | Pick the meaning that fits |
| `word_from_translation` | **Multiple choice** | A translation shown | Pick the matching word |
| `translation_from_word` | **Multiple choice** | A word shown | Pick its translation |
| `listening_cloze` | **Listening + MCQ** | Audio to play + sentence with a blank + hint | Play audio, pick the option |
| `listening_choice` | **Listening + MCQ** | Audio to play | Play audio, pick the matching word |
| `image_choice` | **Image + MCQ** | An image | Pick the word that matches the picture |
| `cloze_typing` | **Typed** | Sentence with a blank + hint + optional audio | Type the missing word |
| `dictation` | **Listening + typed** | Audio + a translation hint | Play audio, type what you heard |
| `pronunciation` | **Speak** | Word + IPA + reference audio | Tap to speak; client speech-to-text; submit transcript |

Design implications for the runner:
- **Shared scaffold, swappable body.** A consistent frame (type label, progress,
  streak, footer action) wrapping a body that morphs per family: option lists,
  a sentence-with-blank, a typing field, an audio orb, an image, a mic.
- **Reusable atoms to style:** an **option button/list** (default → selected →
  correct → wrong states), a **sentence-with-blank**, a **typed input**, an
  **audio play button** (with a "listening" pulse), a **hint chip**, a primary
  **Check / Continue button** in the footer.
- **Multiple choice is the dominant family** — invest most in the option-tile
  design (resting, hover/focus, selected, then post-grade correct/incorrect).
- **Data can be missing.** Audio, images, IPA, or translations may be absent — the
  layout must look intentional without them (e.g. no broken empty image box).

## 6. Empty states (design all four)

When a session returns no questions, show a reason-specific screen:

| Reason | Message intent |
|---|---|
| `no_due_cards` | "All caught up — come back at `<time>`." (a countdown to the next review) |
| `no_more_at_level` | "No new words at your level" — nudge to raise level or try a topic |
| `no_enrollment` | "Nothing to study yet" — prompt to pick a deck/topic |
| `deck_exhausted` | "You've finished this deck" — suggest another deck |

Each currently has an icon + title + body + a "Back to dashboard" action. They
deserve a bit of warmth (this is a *success* moment, not an error).

## 7. Progress, streak & feedback mechanics (drive the UI)

These come straight from the data and shape the chrome — design for them:

- **Overall session progress:** a position in the queue (e.g. a top progress bar /
  "3 of 12"). The queue can **grow mid-session** (a just-learned word gets
  re-queued), so progress is "answered vs. answered+remaining", not a fixed total.
- **Per-word step progress:** a word can be a short ladder of questions
  (`stepIndex` / `stepCount`, e.g. "Step 2 of 5"); consecutive steps of the same
  word share a group. Consider a sub-indicator for "still on the same word."
- **Streak:** a running count of consecutive correct answers; currently a small
  flame badge that appears once streak > 1. Gamification flourish, optional.
- **Correct / incorrect feedback:** on graded (non-flashcard) answers, a brief
  celebration on correct (confetti / green flash) and a gentle "miss" on wrong
  (shake / red flash) — **plus the revealed correct answer**. Flashcards are a
  calm self-rated browse with **no** win/lose FX.
- **Settings:** a small popover toggles display prefs — **auto-play audio**,
  **show phonetic (IPA)**, **show image**. Keep this lightweight and out of the way.

## 8. Data each screen receives (for realistic content)

Design with real shapes in mind (full tables in the linked contract docs):

- **Home stats** → `{ streakDays, dueNow, reviewedToday, dailyGoalMinutes,
  counts: { new, learning, review, mastered }, nextDueAt }`.
- **A question item** carries: `lemma`, `type`, `stepIndex`/`stepCount`, a
  `groupId`, and a **`prompt`** object whose fields depend on the type (see §5).
- **An answer response** carries: `correct` (bool), `correctAnswer` (the canonical
  answer to reveal), and scheduling fields you don't render directly.
- **Session summary** is **computed client-side** from the answers (words studied,
  accuracy, time) — there's no server rollup. Design it as a client-tallied recap.

## 9. Current implementation (what you're replacing / can reuse)

The flow is already fully built — study it for behavior, then redesign the
surface. Files under [src/app/(app)/learn/](../../src/app/(app)/learn/):

- **Page & flow:** [page.tsx](../../src/app/(app)/learn/page.tsx) (routes to picker
  or runner), [session-runner.tsx](../../src/app/(app)/learn/session-runner.tsx)
  (the client state machine), [session-machine.ts](../../src/app/(app)/learn/session-machine.ts).
- **Chrome:** [session-shell.tsx](../../src/app/(app)/learn/session-shell.tsx) (the
  card frame), [_chrome/](../../src/app/(app)/learn/_chrome/) (streak badge, garland
  decoration, feedback FX, settings popover, bottom nav).
- **Questions:** [questions/](../../src/app/(app)/learn/questions/) — one component
  per type + [_shared/](../../src/app/(app)/learn/questions/_shared/) atoms
  (option-list, sentence-blank, audio-button, hint-chip, check-button, card-footer).
- **Terminal screens:** [empty-state.tsx](../../src/app/(app)/learn/empty-state.tsx),
  [session-summary.tsx](../../src/app/(app)/learn/session-summary.tsx),
  [deck-picker.tsx](../../src/app/(app)/learn/deck-picker.tsx),
  [topic-picker.tsx](../../src/app/(app)/learn/topic-picker.tsx).
- **Scoped theme & keyframes:** the `.learn-shell` / `.learn-card` block in
  [src/app/globals.css](../../src/app/globals.css) (mint tokens, Nunito, fade-up,
  confetti, flash/shake, audio orb ring, summary burst). Current accent
  `#13a97b`, surface `#fff`, field `#eef0f4`, ok `#15a35e`, bad `#e23b54`.

## 10. In scope vs. out of scope

**In scope (redesign freely):**
- Visual system: color, type, spacing, radius, shadows, iconography, illustration.
- Layout of every screen in §4, and the per-type runner bodies in §5.
- Motion/feedback language (within the reduced-motion contract).
- The gamification treatment (streak, celebration, summary).

**Out of scope (do not change):**
- The **API contract** — endpoints, request/response field names, the signed
  question envelope, and the requirement to echo it back verbatim on answer.
- The **state machine** transitions and the set of states (§4).
- The **server's authority**: the client never picks words or question types, never
  grades, never reschedules. Don't invent screens that imply otherwise.
- The set of **12 question types** and what each needs to render/collect.

---

### TL;DR for the designer
Redesign a calm, focused, one-question-at-a-time **study session**: a source
picker → a question runner that hosts 12 question families (heavy on multiple
choice, plus typing, listening, image, speak, and a self-rated flashcard) →
instant correct/incorrect feedback with the answer revealed → graceful empty
states → a client-tallied summary. Light + dark, mobile-first, keyboard- and
reduced-motion-friendly, token-driven for shadcn. Keep the focus; the energy and
aesthetic are yours to set.
