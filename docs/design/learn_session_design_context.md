# Design context — Learn session (round-based, game-like progression)

**Audience:** the Claude design pass on the `/learn` study screen.
**Goal:** make the learner *feel* the structure of a study session — that they are
climbing a ladder of question types, clearing one **stage** and levelling into the
next, the way a game moves you to the next step. The data already arrives in that
shape; the UI doesn't yet express it.

This is the **design brief**, not a contract. The behavioural source of truth is:
- Journey/state: [learn_session_ui_flow.md](../api/learn_session_ui_flow.md)
- Request/response fields, question types, scheduling: [learn_vocabulary_flow.md](../api/learn_vocabulary_flow.md)

Read those for *what the server sends*. This doc is *what we do with it on screen*.

---

## 1. The one idea this redesign is built on: **rounds are stages**

The session `items[]` is **type-major**. The server expands each picked word into a
difficulty-ordered ladder, then *interleaves by type*:

```
Round 1  (easiest)   word A · flashcard   word B · flashcard   word C · flashcard
Round 2              word B · cloze_mcq   word C · cloze_mcq    word A · cloze_mcq
Round 3              word C · listening   word A · listening    word B · listening
Round 4  (hardest)   …                                                      …
            ▲ word order re-shuffles each round; a word's steps are NOT adjacent
```

- **A round = a contiguous run of the same `item.type`.** You detect a new round when
  `item.type` differs from the previously-answered item's type. There is no `round`
  field — derive it.
- **Rounds ascend in difficulty.** Recognition (flashcard, picture/translation choice)
  → recall (typing, dictation, pronunciation) → the hardest band (sense disambiguation).
- **Requeued ladders** (`requeue.items`, a just-learned word coming back harder within
  the session) append to the back, so they read as *bonus later stages*.
- A single word's progress (`groupId`, `stepIndex`/`stepCount`) is a **vertical** thread
  through the rounds; the round is the **horizontal** sweep across all words.

**Design consequence:** the session is a sequence of named stages. Clearing a stage is a
moment. That moment is the headline deliverable of this work.

---

## 2. What exists today (don't rebuild — extend)

The runner is already built and the visual system is in place. Reuse it.

| Piece | File | What it does today | What design changes |
|---|---|---|---|
| Queue reducer | [session-machine.ts](../../src/app/(app)/learn/session-machine.ts) | `queue[0]` is on screen; `NEXT` pops it and appends requeue | Add derived "is this a round boundary?" — compare outgoing vs incoming `type`. Keep the reducer pure. |
| Runner | [session-runner.tsx](../../src/app/(app)/learn/session-runner.tsx) | Submits answers, rolls streak, fires FX, lands on summary | Insert a **round-transition interstitial** between `handleContinue` and the next card when the type changes |
| Shell chrome | [session-shell.tsx](../../src/app/(app)/learn/session-shell.tsx) | Top bar: exit · `TypePill` · `StepDots` · streak · settings; progress bar; the study card; per-card `learn-anim-in` entrance | Add a **round-map / stage progress** affordance; the type pill becomes the "current stage" label |
| Type pill | [type-pill.tsx](../../src/app/(app)/learn/_chrome/type-pill.tsx) | Human label + accent dot per type (`TYPE_META`) | Reuse `TYPE_META` labels/colors verbatim for the interstitial and the map |
| Step dots | [step-dots.tsx](../../src/app/(app)/learn/_chrome/step-dots.tsx) | Dots for one word's ladder | Keep — it's the *per-word* thread, distinct from the *round* progress |
| Feedback FX | [feedback-fx.tsx](../../src/app/(app)/learn/_chrome/feedback-fx.tsx) | Green/red radial flash + shake; confetti fired from shell | Reuse the same FX vocabulary; the stage-clear burst should feel like a bigger sibling |
| Summary | [session-summary.tsx](../../src/app/(app)/learn/session-summary.tsx) | End-of-session rollup (answered/correct/best streak) | The interstitial is a *mini* version of this beat — keep them visually related |

**Settings** ([settings-context.ts](../../src/app/(app)/learn/_chrome/settings-context.ts)) are display-only:
`autoplay`, `showPhonetic`, `showImage`. There is no "reduce gamification" toggle today —
if the interstitial should be skippable, add one setting (e.g. `stageTransitions`) rather
than overloading the existing three.

---

## 3. Visual system to stay inside (scoped to `.learn-shell`)

> **Colorful, not neutral.** This screen must feel vivid and playful — a game, not a form.
> **No gray/neutral theming for anything meaningful.** Gray is allowed *only* as faint ink
> for body text and as the resting "card paper" — never as the color of a stage, a state, a
> chip, an icon tile, or a progress segment. Whenever you'd reach for gray to mean
> "inactive / upcoming / muted", reach for a **tinted soft accent** (`--primary-soft`,
> `--violet-soft`, `--sky-soft`, `--amber-soft`) instead. Every round, every type, every
> celebration carries its own color. The session should read as a colorful ladder, not a
> monochrome quiz.

All tokens live in [globals.css](../../src/app/globals.css) under the `.learn-shell` scope.
**Do not introduce new hues** — but **do use the full accent set generously**; compose these.

- **Brand / correct:** `--primary` `#12bd8a` (mint), `--primary-press`, `--primary-ink`,
  `--primary-soft`, `--primary-soft-2`.
- **Accent hues (use them — this is the colorful palette):** `--violet` (listening),
  `--sky` (picture), `--amber` / `--amber-2` (recall / speak), `--bad` (rose, wrong only),
  each with its `*-soft` tint for fills and chips (`.lr-chip--mint/violet/sky/amber/bad`).
- **Ink (text only, never theming):** `--ink` (headings), `--ink-2` (body). Avoid `--ink-3`
  for anything load-bearing — prefer a soft accent tint over gray.
- **Surfaces:** `--learn-surface` (card paper), `--learn-bg`, `--learn-field-2`; cards use
  `.learn-card`. Lift them with **colored soft washes** (the existing
  `linear-gradient(--primary-soft …)` patterns), not flat white-on-gray.
- **Buttons:** `.lr-btn` with `--primary` / `--ghost` / `--lg` / `--block`. Primary actions
  stay full-color mint; don't gray-out the main CTA.
- **Existing motion to reuse / echo** (all in `globals.css`, all behind
  `@media (prefers-reduced-motion: reduce)`):
  `learn-fadeUp` (card entrance), `learn-pop`, `learn-flash` + `learn-flashShake`,
  `learn-fall` (confetti), `learn-ring` (audio orb), `learn-burst` (summary pop).

**Accent per round** — map difficulty bands to the existing accents so the color itself
signals "things just got harder":

| Band | Types | Accent |
|---|---|---|
| Recognition | flashcard, cloze_mcq, meaning_in_context, word/translation choice | `--primary` (mint) |
| Listening | listening_cloze, listening_choice, dictation | `--violet` |
| Picture | image_choice | `--sky` |
| Recall / speak | cloze_typing, pronunciation | `--amber` |
| Mastery | sense_disambiguation | rich mint, deepened toward `--primary-ink` (a "gold tier" feel) |

Don't let the easiest rounds read as plain — even the mint recognition band should sit on a
colored soft wash, not flat white.

---

## 4. The deliverable: the **stage-clear → next-stage** interstitial

When the learner answers the last item of a round and taps Continue, **before** the first
card of the next round mounts, play a short interstitial. This is the "next step in a game"
beat the redesign is for.

### 4.1 When it fires
- `handleContinue` advances the queue; the **new** `queue[0].type` ≠ the **just-answered**
  type → it's a round boundary → show the interstitial.
- Never fire on the very first card (no round was cleared yet).
- Never fire mid-word: rounds change on `type`, and a word's steps are spread across rounds
  anyway, so a `type` change is always a true stage change.
- The **final** Continue (queue drained) goes to the full summary, not the interstitial.

### 4.2 What it shows (one calm, ~1.2s beat)
A centered overlay over a dimmed/blurred backdrop (reuse the `Overlay` pattern already in
`session-runner.tsx`), containing, top to bottom:

1. **Stage cleared** — a checkmark burst (echo `learn-burst` + a softer confetti than the
   per-answer one) and the round just finished, by its `TYPE_META.label`, e.g.
   "Flashcards — cleared".
2. **A one-line stat for that round** — computed client-side: correct/total for the round,
   or the current streak. Keep it to one number; this is a breath, not a report.
3. **Next stage preview** — the next type's `TYPE_META.label` + accent dot, with a clear
   "harder" cue (a small up-arrow / "Step up" tag, an accent shift from mint → violet/amber).
   "Next: Type the word".
4. **A stage map** (see §5) showing the dot for the cleared stage filling and the next dot
   becoming current — this is what makes it feel like advancing on a level track.

### 4.3 How it advances
- **Auto-advance** after ~1.0–1.4s, OR the learner taps "Continue" / presses Enter/Space to
  skip it immediately. Never trap them — a fast learner should be able to blow through it.
- Honor `prefers-reduced-motion`: collapse to an instant, static swap (no burst, no
  confetti, the map just updates) — the same discipline every existing keyframe follows.
- If a `stageTransitions` setting is added and off → skip entirely, go straight to the card.

### 4.4 Tone
Colorful, soft, rounded, encouraging — playful but premium, **not** a loud neon arcade and
**not** a flat gray modal. Each interstitial wears the **next round's accent** (mint →
violet → sky → amber → mastery mint), so the celebration itself carries color and the
"harder ahead" shift is felt through hue. It should read as the same product as the study
card, just one notch more celebratory than the per-answer green flash and one notch less
than the end-of-session summary. Three escalating, all-colored beats:
**answer flash → stage clear → session summary.**

---

## 5. Supporting affordance: the stage map (persistent progress, re-read)

The top progress bar today is a flat `current / total` fill. Re-frame it (or sit a thin
companion under it) as a **stage track**: one segment per round, like a level select.

```
●────●────◉────○────○
 done done  now  next  …
flash mcq listen type  sense
```

- Segments derive from the **distinct `type` runs** in the queue (answered + remaining).
  Because the session is type-major and difficulty-ascending, this is a stable left-to-right
  difficulty ladder.
- States, **all colored — no gray segments**: **cleared** (filled with that round's own
  accent, mint/violet/sky/amber), **current** (pulsing/active in its accent, slightly
  brighter), **upcoming** (the round's accent at low opacity or its `*-soft` tint — a *faded
  color*, never `--ink-3` gray). A learner glancing at the track should see a rainbow of
  stages, with the finished ones saturated and the coming ones softly tinted.
- Requeued ladders extend the track to the right as they're spliced in — that's fine; it
  reads as "bonus rounds unlocked."
- The existing **`StepDots`** stays as a *separate, smaller* indicator for the active word's
  own ladder ("Step 2 of 5") — don't merge the two; they answer different questions
  (where am I in this *stage* vs. in this *word*).

Keep it honest: total can grow when requeues splice in. Animate the track widening rather
than letting the numbers jump.

---

## 6. Per-question-type intent (so each round *feels* different)

The frontend renders whatever `type` arrives — it never chooses. But each round should have
its own posture so moving between them is felt, not just labelled. Existing leaf components
live in [questions/](../../src/app/(app)/learn/questions/).

- **flashcard** — calm, self-rated browse (`forgot`/`hard`/`good`/`easy`). No win/lose FX
  (already suppressed in `scoreFeedback`). This is the "warm-up" stage; keep it serene.
- **cloze_mcq / meaning_in_context / sense_disambiguation / word·translation choice** —
  option-list rounds; tap → reveal. Emphasize the *highlighted span* and the reveal of the
  canonical `correctAnswer`.
- **listening_cloze / listening_choice / dictation** — audio-led; the violet round. Lean on
  the audio orb (`learn-ring`) so the shift to "listening mode" is obvious the moment the
  stage opens.
- **image_choice** — the sky round; picture-forward.
- **cloze_typing / dictation** — typing recall; Enter submits (wired already).
- **pronunciation** — amber, mic-led; client speech-to-text, graded leniently. The "speak
  it" round should feel like the boss stage of recall.

Data gaps (no audio/image/translation) just drop a type → fewer rounds. Never hardcode the
set of rounds; always derive from the queue.

---

## 7. Hard constraints (do not violate)

- **Server owns the ladder.** Render the `type` that arrives, in queue order. No client-side
  reordering, no inventing rounds, no skipping types.
- **Echo signed fields verbatim** on `/answer`; the design never recomputes
  `stepIndex`/`stepCount`. (Runner already does this — don't regress it.)
- **`progress` is `null` on non-final steps** — that's normal, not an error. Don't gate any
  celebration on a populated `progress`; gate stage-clear on the *type changing*.
- **`requeue` is in-session** — splice and re-surface; never call `/session` again to
  re-show a just-learned word.
- **Signature expiry (~30 min)** → the existing `expired` retry panel. The interstitial must
  not block or delay an expiry from surfacing.
- **Accessibility:** every motion beat needs a reduced-motion fallback; the stage map needs
  text/`aria` labels ("Stage 3 of 5, listening"); auto-advance must always be skippable by
  keyboard.
- **Stay in `.learn-shell` tokens, but stay colorful.** No new hues — and no neutral/gray
  theming. Gray is text-and-paper only; states, stages, chips, icon tiles, and progress all
  use the mint/violet/sky/amber/rose accents (+ their `*-soft` tints).

---

## 8. Definition of done (design intent)

- Finishing a question type plays a clear, brief, skippable **stage-clear → next-stage**
  beat that reads as advancing in a game, and is visibly *harder ahead*.
- A persistent **stage map** lets the learner see how many stages remain and that they climb
  in difficulty.
- The three celebratory beats (answer flash · stage clear · session summary) form a coherent
  escalating family, all in the mint study-card language.
- **The screen reads as colorful end to end** — each round/stage carries its own accent,
  nothing load-bearing is gray, and the stage track looks like a rainbow ladder.
- Reduced-motion and keyboard users get the same information with no motion and no traps.
- Nothing about the server contract, queue order, or signed-field handling changes.
