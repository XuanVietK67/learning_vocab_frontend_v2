# Design context — `pronunciation` question card redesign

**For:** a designer (or design agent) producing a new layout for the learn‑session
**pronunciation** card.
**Read first:** [learn_pronunciation_question.md](learn_pronunciation_question.md) — the API/behaviour spec this redesign serves. This file is the *design brief*: what is on screen, what data each state has, what to reuse, and the constraints the layout must respect. It does **not** restate the API contract; go to the spec for field tables.

---

## 1. Why this card is changing (one paragraph)

Today the pronunciation step is a thin wrapper around browser speech‑to‑text: the user taps a mic, we read back a transcript string, and the server grades that text leniently against the word. The new flow **records real audio, sends it to an acoustic scorer, and gets back a per‑phoneme breakdown** — overall `0–100`, plus each IPA sound labelled `good` / `practice` / `wrong`. The redesign's whole reason to exist is to **show that breakdown well**: the card stops being "did the recogniser spell the word" and becomes a small pronunciation coach. STT stays only as a fallback when scoring is unavailable.

Current implementation to evolve: [pronunciation-question.tsx](src/app/(app)/learn/questions/pronunciation-question.tsx).

---

## 2. The states to design

One card, four states (plus two error surfaces). The target word, its IPA, and the reference‑audio play button stay visible **throughout** — they are the constant header, not per‑state.

| # | State | Trigger | What it must show |
|---|---|---|---|
| **A** | **Record** | card opens | word + IPA + reference‑audio orb; a record affordance; a live mic level while recording; the two escape hatches (Skip, Use keyboard) |
| **A′** | **Scoring** | user stops recording | a brief "Scoring…" spinner over the record area (few hundred ms, can spike to ~8 s) |
| **B** | **Result** | `/score` returns | overall score + a copy phrase, **per‑phoneme chips coloured by label**, replay‑my‑recording control, optional audio‑quality warning, Try again + Continue |
| **C** | **Keyboard fallback** | user taps "Use keyboard", or device can't produce valid audio | a single text input (the existing STT/typed path) — must still be answerable |
| **E1** | **Recording error** | bad/too‑short audio (`400`), mic permission denied | inline, non‑blocking message + re‑record; if too short, say "hold a bit longer" |
| **E2** | **Service down** | `/score` returns `503` / times out | offer Retry **and** the keyboard fallback so the learner is never trapped |

The redesign should treat **A → A′ → B** as the happy path and make **B** the visual centrepiece. C/E1/E2 must exist but should be calm and secondary.

---

## 3. The data each state renders (design to the real shape)

Design to these fields — don't invent labels the data can't fill.

**Header (all states)** — from `item.prompt`:
- `lemma` (string, e.g. `"thin"`) — the big word.
- `ipa` (string | **null**, e.g. `"θɪn"`) — hide the row when null.
- `audioUrl` (string | **null**) — reference pronunciation; hide the play orb when null.

**Result state (B)** — from the `/score` response:
- `overallScore` — integer `0–100`.
- `phonemes[]` — left‑to‑right, each `{ phone, score (0–100), label, start_sec, end_sec }`.
- `label` ∈ `good` (≥75) | `practice` (45–74) | `wrong` (<45) — **drives chip colour directly**.
- `audioQuality` — `{ too_short, clipping, snr_db, … }`; only surface a warning when `clipping` or low `snr_db`.
- the user's own recorded clip — for a "play my recording" control.
- `start_sec` / `end_sec` — optional: highlight a chip's span while replaying.

Number of phonemes is small and variable (typically 2–6). Chips must lay out for 1 up to ~10 without wrapping into a mess.

**Map the overall band to copy, not just a number:** ≥75 "Great" · 45–74 "Getting there" · <45 "Let's try again", and match the colour to the same good/practice/wrong palette so the headline agrees with the chips. (Thresholds are tunable server‑side — the headline copy is a *design* affordance, not a grading source.)

---

## 4. Reuse the existing design system ("sprout" learn theme)

This card lives inside the learn study‑card shell. **Match it — do not introduce a new visual language.** Tokens and classes are defined in [globals.css](src/app/globals.css).

**Palette (CSS vars):**
- Primary / mint: `--primary` `#12bd8a`-family, `--primary-soft`, `--primary-soft-2`, `--sh-primary`.
- Ink: `--ink` `#15241e`, `--ink-2` `#5b6b64`, `--ink-3` `#91a09a`.
- Semantic — **use these for the phoneme labels**: `good` → `--ok` `#11a368` / `--ok-soft`; `practice` → `--amber` `#ffb020` / `--amber-soft`; `wrong` → `--bad` `#f1456a` / `--bad-soft`.
- Surfaces: `--learn-surface` (card), `--card-2`, `--line` / `--line-2` (hairlines).
- Radii: `--r-card 30px`, `--r-tile 18px`, `--r-chip 999px`, `--r-input 16px`. Shadows: `--sh-sm/md/lg`.
- Type: word + IPA use the **serif** (`--serif`, Newsreader); body/labels use the sans (Plus Jakarta).

**Components / classes already built — prefer these over new ones:**
- `.lr-orb` (+ `--sm`/`--lg`, `.playing` rings) — the audio orb, via [audio-button.tsx](src/app/(app)/learn/questions/_shared/audio-button.tsx). Reuse for **both** the reference‑audio play button and a "play my recording" control (a second tone or a distinct icon would read as "yours vs reference").
- `.lr-mic` (+ `.recording`, `.pulse`) — the round mic button, already styled for idle/recording. The redesign can keep it or replace the affordance, but the recording‑pulse treatment exists.
- `.lr-word`, `.lr-ipa`, `.lr-eyebrow` — heading scale for word / phonetic / kicker.
- `.lr-input` (+ `.is-correct` / `.is-wrong`) — the fallback text field.
- `.lr-btn` (+ `--primary` / `--amber` / `--ghost`, `--lg`, `--block`) — buttons. Note the footer Continue is **amber** by house style (see §5).
- `.lr-chip` (pill) — a base for the phoneme chips, but phoneme chips are new and likely need their own variant (colour by label, show score on tap/hover, a "selected" state synced to playback).

There is **no dark mode** for the learn theme — design light only. Card width is capped (`max-w-140`); design for a narrow, centred, mobile‑first column.

---

## 5. Integration constraint — how the card talks to the runner footer

This is the one non‑obvious thing and it shapes where buttons live. The card does **not** own its primary action button. The session runner ([session-runner.tsx](src/app/(app)/learn/session-runner.tsx)) wraps every question in a shell with a shared **footer** ([card-footer.tsx](src/app/(app)/learn/questions/_shared/card-footer.tsx)):

- The question component reports its current answer via `onAnswerChange(answer | null)`.
- While `result === null`, the footer shows a **Check** button, enabled only when an answer has been reported.
- After submit, `result` is set; the footer swaps to a reveal strip + an **amber Continue / Finish**.
- The card also receives `disabled` (lock inputs while a submit is in flight) and `result` (switch to reveal mode).

**What that means for this redesign.** Pronunciation has an extra phase no other question has: a **record → score** sub‑flow that happens *before* an answer exists. Map it like this:

1. **A / A′ (record, scoring):** no answer yet → footer Check is disabled. Recording and scoring are driven by controls **inside the card body**, not the footer.
2. **B (result):** the score came back → the card reports the chosen `attemptId` via `onAnswerChange`, which **enables the footer's Check button** — that is the "Continue / submit this attempt" action in the §7 mockup. So the mockup's "Continue →" is the runner footer; it does not need to be drawn inside the card.
3. **Try again** *is* a card‑body control (it re‑records → new `/score` → new `attemptId`, and re‑reports it). Each retry replaces the reported answer; the user only commits when they press the footer's Check.

Design the card body for record + score + chips + retry; assume the commit button is the shell footer. If you want a different footer label for this type ("Continue" instead of "Check"), call that out as a proposed change — it's a shared component.

---

## 6. Design goals & non‑goals

**Goals**
- Make the **per‑phoneme breakdown the hero** of the result state — it is the entire payoff of the backend change. Colour by `label`, reveal the number on tap/hover, and (stretch) flash a chip's `start_sec`–`end_sec` span while the user's recording replays.
- Keep **retry first‑class and cheap** — re‑recording should feel like one tap, not a reset.
- Keep the card **a member of the family**: same shell, tokens, type scale, orb, and motion as the other 11 question types. A learner shouldn't feel they left the app.
- **Never dead‑end the learner.** Skip and the keyboard fallback must always be reachable, including from the `503` error state.
- Honour `settings.showPhonetic` (the IPA row is gated by a learner setting) and standard a11y: the mic/record control needs clear `aria-label`s and state, colour is never the *only* signal on a chip (pair with the score number / an icon), and focus order survives the A→B transition.

**Non‑goals**
- Don't redesign the surrounding shell, progress bar, streak FX, or summary.
- Don't design the audio‑capture pipeline (WAV/FLAC encoding is an engineering concern — see spec §5); just assume a blob is produced.
- Don't show or let the user edit the raw score‑to‑grade thresholds; pass/fail comes from the `/answer` response, not the card.

---

## 7. Open decisions to resolve in the design

Surface a recommendation for each rather than leaving them implicit:

1. **Record affordance:** press‑and‑hold vs tap‑to‑start/stop. (Hold reads as "say one short word"; tap is more forgiving on flaky touch.)
2. **Retry cap:** unlimited, or N attempts? If capped, where does the counter live, and which attempt is submitted (last vs best)?
3. **Live feedback while recording:** simple level meter, scrolling waveform, or just the pulse ring? Keep it lightweight.
4. **Chip interaction:** tap to expand the number, or always show it? Behaviour on small screens where hover doesn't exist.
5. **Where the escape hatches sit** (Skip / Use keyboard) so they're discoverable but don't compete with Record.
6. **Scoring‑spinner placement:** in place of the record control, or as a card‑level overlay — and what the ~8 s worst case looks like.

---

## 8. Reference — the spec's own sketch

The behaviour spec already proposes a rough two‑state layout in [learn_pronunciation_question.md](learn_pronunciation_question.md) §7 (Record state A, Result state B) plus design notes in the same section. Treat it as a **starting point to improve on**, not a target to copy — it predates this brief and doesn't account for the shared footer (§5) or the sprout component set (§4).
