# Design context — Practice tab (write a sentence & speak the word), brand-forward

A self-contained brief for **designing the `/practice` screen** — the *production*
surface where a learner takes a word they've studied and proves they can **use it**: write
a sentence with it (an LLM judge scores the sentence) or say it aloud (an acoustic scorer
returns a per-phoneme breakdown). This is a **new, first-class screen** in the branded app
shell — the sidebar's `Practice` entry and the home launchpad's `Practice` tile both land
here. Everything a designer needs is here; you should **not** need to read the codebase.

> **This is a Claude Design brief**, not a wire contract. It says *what is on screen, what
> data each state has, what to reuse, and the constraints the layout must respect.* The
> request/response shapes are the source of truth and live in the API docs below.

> Source of truth for the *layout/UX behaviour* this distils:
> [practice_vocabulary_design.md](../api/practice_vocabulary_design.md).
> Source of truth for the *wire contracts* (don't restate them — design to the field tables):
> **Write** → [practice_submit_sentence.md](../api/practice_submit_sentence.md)
> (`POST /v1/me/practice/attempts`, `GET …/:id`); **Speak** →
> [pronunciation_score.md](../api/pronunciation_score.md) (`POST /v1/pronunciation/score`,
> `GET /v1/pronunciation/attempts`).
> Source of truth for the *brand system* (tokens, type, atoms, verbatim CSS):
> [sprout_design_system_reference.md](sprout_design_system_reference.md).
> The closest **sibling** already designed — match its Speak/result language:
> [learn_pronunciation_redesign_context.md](learn_pronunciation_redesign_context.md).
> Shared conventions (base URL, `Authorization: Bearer`, pagination, errors):
> [frontend_handoff.md](../api/frontend_handoff.md).
> If a doc and this file disagree, **the API doc / the live CSS wins.**

> **Light theme only.** Like `/learn` and the redesigned home, Practice is a single,
> fully art-directed light theme. **Do not design a dark variant.**

---

## 1. The big picture (what we're building)

`/learn` teaches *recognition* (multiple choice, cloze, match). **Practice is where the
learner produces language.** Two modes, anchored to one target word:

1. **Write a sentence** — the learner types (or dictates) a sentence using the word; an LLM
   judge returns a rubric (grammar / word-usage / naturalness / relevance), an overall
   `0–100`, a demonstrated CEFR, feedback, and an optional improved sentence. **Async**:
   submit → poll.
2. **Speak the word** — the learner records themselves saying the word; an acoustic scorer
   returns an overall `0–100` plus a **per-phoneme** score + coarse label. **Synchronous**:
   the POST returns the full result.

> **The two modes are separate backends with different timing models.** Writing is queued
> and **polled**; speaking returns **inline**. Don't build one loading/polling abstraction
> for both — the split is real and the component design must keep it.

The spine of the screen, one sentence:

> **Pick (or arrive at) a word → choose a way to produce it → get a clear, encouraging
> breakdown of how you did → try again or move on.**

Practice must feel like *the same product* as `/learn` and the home — the **Sprout mint
identity**, the serif word, the audio orb, the mic. It renders inside the branded
`.app-shell` (the scope the redesigned home + sidebar use), so it **already inherits the
Sprout mint tokens** — design against them, don't invent a new language.

### Vocabulary (use these words in the UI)

| In the UI the user sees… | …which in the API is a… |
|---|---|
| **Word** | a `vocabulary` (`vocabularyId`, `lemma`, `ipa`, `audioUrl`) |
| **Attempt** | one scored submission (a written sentence or a recording) |
| **Score** | the `0–100` overall (write `score` / speak `overallScore`) |
| **Sound** | a phoneme chip (`phone` + `score` + `label`) |

---

## 2. Where it lives & how the user arrives (IA)

Practice is **always anchored to one target word** — `{ vocabularyId, lemma, ipa?, audioUrl? }`.
Entry points:

- the home launchpad **Practice tile** and the **sidebar `Practice`** entry → land on the
  **Practice hub** (no word in hand yet — see below),
- a **word's detail page** ("Practice this word") → lands with the word already chosen,
- the **learn session** (the `pronunciation` question already records audio — that card is
  the sibling at [learn_pronunciation_redesign_context.md](learn_pronunciation_redesign_context.md)).

> **The genuinely new design surface vs. the learn card: the Practice hub.** When the user
> arrives from the sidebar/home with *no word selected*, the screen must **pick or offer a
> word to practice** (a due/recently-learned word) and let them **search/switch** to another.
> The learn pronunciation card never had this — design how the user lands on a word here.
> (Speak mode can also score **free-text** with no `vocabularyId`; treat that as a power-user
> path, not the default.)

```
  ╭─────────────────────────────────────────────────────────────╮
  │  ← Practice                              search / switch word │
  │                                                               │
  │   ephemeral   /əˈfem(ə)rəl/                    🔊 reference   │  ← WORD HEADER (shared,
  │   adjective · “lasting a very short time”                     │     stays mounted across tabs)
  │                                                               │
  │   ┌──────────────┐  ┌──────────────┐                          │
  │   │ ✍  Write     │  │ 🎙  Speak    │      ← MODE TABS          │
  │   └──────────────┘  └──────────────┘                          │
  │   ───────────────────────────────────────────────────        │
  │                                                               │
  │                  ( active mode panel — §6 / §7 )              │
  │                                                               │
  │   Your attempts  ▁▂▅▇▅  72 · 81 · 88            see all →      │  ← per-word history strip (§8)
  ╰─────────────────────────────────────────────────────────────╯
```

The **mode tabs map 1:1 to the two endpoints.** The word header (lemma, IPA, reference-audio
orb, short gloss) is **shared** and stays mounted when the user flips tabs.

---

## 3. Brand & color system (shared with `/learn` and the home)

Practice adopts the **Sprout mint identity** — the exact tokens that power `/learn`. They
are already declared on `.app-shell` (the authenticated user scope), so reused atoms and
shadcn primitives inherit mint automatically. **Design against these; don't invent hues.**

### 3.1 Palette (light only — verbatim from the live system)

```css
/* brand core */
--primary: #12bd8a;  --primary-press: #0ca576;  --primary-ink: #07684b;
--primary-soft: #e0f6ee;  --primary-soft-2: #c8eede;

/* surfaces + ink */
--app-bg: #eaf1ed;  --surface: #ffffff;  --card-2: #f6faf8;
--ink: #15241e;  --ink-2: #5b6b64;  --ink-3: #91a09a;
--line: #e9efeb;  --line-2: #dde6e1;

/* the SCORE band scale — see §9 (this is the screen's most important encoding) */
--ok:  #11a368;  --ok-soft:  #dcf4e7;  --ok-ink:  #0a6e44;   /* good   ≥75  → green  */
--amber: #ffb020; --amber-2: #ff7a1a; --amber-soft: #fff0d4; /* practice 45–74 → amber */
--bad: #f1456a;  --bad-soft: #fde4ea;  --bad-ink: #b51f42;   /* wrong  <45  → red   */

/* section accents (consistent app-wide — color means something) */
--sky: #1f9fd1;  --sky-soft: #e0f1fa;     /* Practice's section tint (matches the home tile) */
--violet: #7b6cff; --violet-soft: #ece9ff; /* the "listening" orb family */
```

**Accent rules — don't break these:**
- **Scores are owned by the band scale** (green/amber/red, §9). Never recolour a score ring
  or a phoneme chip with anything else.
- The **rubric criteria** (0–5 dots/bars) are a *neutral* scale — **do not** recolour them
  with the band thresholds.
- **`cefr` is categorical** (A1–C2), not a score — neutral chip styling, never band colours.
- Practice chrome stays **mint** (brand). A light **sky** tint may mark the Practice section
  (matches the home launchpad Practice tile) — but it never competes with a score colour.

### 3.2 Type

- **Plus Jakarta Sans** — all UI text, labels, buttons, counters. (`--font-jakarta`)
- **Newsreader (serif)** — the **word** (`.lr-word`), **IPA** (`.lr-ipa`, italic), example
  sentences (`.lr-sentence`), and the **big score number**. (`--serif`)
- Eyebrows use `.lr-eyebrow` (12px, 700, `0.12em`, uppercase, `--ink-3`).
- **`tabular-nums`** on every score, counter, and phoneme number.

### 3.3 Radii, shadows, motion

```css
--r-card: 30px;  --r-tile: 18px;  --r-chip: 999px;  --r-input: 16px;
--sh-sm; --sh-md; --sh-lg; --sh-primary (mint glow); --sh-amber (celebration glow);
```

Reduced motion is honoured globally (the `.app-shell` / `.learn-shell` reduced-motion block)
— keep any new motion inside that contract.

### 3.4 Atoms to reuse (before inventing — verbatim CSS in the Sprout reference §4)

| Element | Atom |
|---|---|
| Eyebrow ("Say the word" / "Write a sentence") | `.lr-eyebrow` |
| Target word / IPA | `.lr-word` (e.g. `text-[40px]`) / `.lr-ipa` (hide if `ipa` null) |
| Reference-audio play · "play my recording" | `.lr-orb` (mint; `--sm`/`--lg`, `.playing` rings) |
| Record control | `.lr-mic` (+ `.recording`, `.pulse`) — idle white→mint, recording red+pulse |
| Sentence textarea / dictate input | `.lr-input` (+ `.is-correct`/`.is-wrong`) |
| Buttons | `.lr-btn` (`--primary` mint = go, `--amber` = commit/celebrate, `--ghost`/`--soft` = secondary; `--lg/md/sm`, `--block`) |
| Chips / pills | `.lr-chip`, `.lr-typepill` (mode tabs can ride this footprint) |
| Scoring placeholder | `.lr-sk` shimmer |
| Progress bar shell (e.g. a score bar) | `.lr-progress` |

**New atoms to design** (don't exist yet — build on the `.lr-chip`/`.lr-progress` footprint):
- **Per-phoneme chip** — pill, recoloured by `label` via §9; shows the IPA glyph + score
  number (colour never the only signal); tappable to replay its span.
- **Overall score gauge/ring** — `0–100`, coloured by band; serif number in the centre.
- **Mode tabs** — two pills that swap only the panel below the shared header.

---

## 4. The word header (shared, stays mounted)

The constant top of the screen across both tabs and all states:

- **Word** — `lemma` in `.lr-word` (large serif).
- **IPA** — `ipa` in `.lr-ipa` (italic). **Hide the row when `ipa` is null.**
- **Reference audio** — `.lr-orb` that plays `audioUrl`; **hide when null**.
- **Short gloss line** — part of speech + a one-line sense ("adjective · lasting a very short
  time"), `--ink-2`.
- **Back / switch word** — a back affordance to the hub + a way to search/pick another word.
- A compact **history affordance** (§8) linking to this word's past attempts.

---

## 5. Mode tabs (Write ↔ Speak)

Two tab pills that map 1:1 to the endpoints; the header stays mounted, only the panel swaps.
Each **result card offers a one-tap jump to the other mode** ("Switch to Speak 🎙" /
"Switch to Write ✍") so producing → pronouncing the same word is frictionless. On mobile,
decide tabs-vs-stacked (open decision §12).

---

## 6. Mode A — Write a sentence (async)

### 6.1 Layout

```
┌─ ✍ Write a sentence using “ephemeral” ───────────────┐
│  ┌─────────────────────────────────────────────────┐ │
│  │ Her fame proved ephemeral, fading within a      │ │  ← textarea, 1–280 chars
│  │ single week.|                                   │ │
│  └─────────────────────────────────────────────────┘ │
│                                          52 / 280      │  ← live counter
│  [ Submit for scoring ]                  🔥 23/30 today │  ← daily-quota hint
└────────────────────────────────────────────────────────┘
```

- **Textarea** — one sentence, hard limit **280 chars** with a live `count / 280`. Disable
  Submit when empty or over (`text` is `1–280`; over-length is a `400`).
- **Dictate (optional)** — a mic button may fill the textarea via the browser's speech-to-text;
  it's **still text-scored** (pronunciation is *not* judged here — that's Mode B). Sends
  `modality: "speaking"` vs `writing`, but the result is identical.
- **Daily quota** — a per-user cap (default **30/day**). Optionally show a counter; a `429`
  means out for the UTC day → render a calm "come back tomorrow" state and disable Submit.

### 6.2 State machine

```
idle ─Submit─▶ submitting ─202─▶ scoring (poll) ─┬─ scored ─▶ result card (§6.3)
                   │                              └─ failed ─▶ error + Retry
                   └─ 400/401/429/503 ─▶ inline error (stay in idle)
```

| State | UI |
|---|---|
| **idle** | Editable textarea + enabled Submit. |
| **submitting** | Disable inputs, spinner on the button; keep the returned `attemptId` on `202`. |
| **scoring** | Replace the form with a "Scoring your sentence…" placeholder (skeleton rubric, `.lr-sk`). **Poll** `GET …/:id` with backoff **1.5s → 3s → 5s** until `status !== 'pending'`. After ~60s stop auto-polling and offer **"Check again"** (the attempt is still queued and will resolve). |
| **scored** | Render the result card. |
| **failed** | Show `error` + **Retry** (a fresh `POST`). |

> Scoring runs on a rate-limited shared free-tier model — seconds normally, longer when
> saturated. **Never block the UI synchronously**; the loading state must be cancellable.

### 6.3 Result card (`status: scored`)

```
┌─ Result ───────────────────────────────────  88 / 100 ─┐
│  Demonstrates: B2          ✓ uses “ephemeral”           │
│  Grammar      ●●●●●  5/5                                 │
│  Word usage   ●●●●●  5/5                                 │
│  Naturalness  ●●●●○  4/5                                 │
│  Relevance    ●●●●●  5/5                                 │
│  “Natural, correct use of ‘ephemeral’. Strong sentence.”│
│  Suggested:  Her fame proved ephemeral, fading within…  │  ← only if correctedSentence present
│  [ Try another sentence ]      [ Switch to Speak 🎙 ]   │
└──────────────────────────────────────────────────────────┘
```

Design to these fields (full shapes in [practice_submit_sentence.md](../api/practice_submit_sentence.md)):

- **`score`** (0–100) — the big number / ring, coloured by band (§9).
- **`cefr`** — a small **neutral** chip labelled *"Demonstrates"*. ⚠️ This is the level of
  **this one sentence**, **not** the user's proficiency — never present it as a certified
  level, and never derive it from `score` (or vice-versa).
- **`rubric.usesTargetWord` / `correctUsage`** — a green check / amber warning chip.
- **`rubric.criteria.{grammar,wordUsage,naturalness,relevance}`** — four **0–5** dot/bar rows
  (neutral scale — *not* band-coloured).
- **`feedback`** — the learner-facing line (quote it).
- **`rubric.correctedSentence`** — a "Suggested" block **only when present** (it's omitted
  when the sentence was already good).

---

## 7. Mode B — Speak the word (synchronous)

> **Match the sibling.** The learn-session pronunciation card already designs this exact
> result language (orb, mic, phoneme chips) —
> [learn_pronunciation_redesign_context.md](learn_pronunciation_redesign_context.md). Practice's
> Speak mode should read as the same component, just outside the session shell.

### 7.1 Layout

```
┌─ 🎙 Say the word: “ephemeral” ────────────────────┐
│              ╭───────────────╮                     │
│              │      ●        │   ← record (.lr-mic) │
│              │   tap to rec  │                      │
│              ╰───────────────╯                      │
│              ▁▂▅▇▅▂▁  00:00.8     ← live level meter │
│   🔊 Hear it first  |  ⟳ Re-record  |  ▶ Play       │
│   [ Score my pronunciation ]                        │
└─────────────────────────────────────────────────────┘
```

- **Record button** (`.lr-mic`) — request mic permission on first use; show a clear
  permission-denied fallback.
- **Reference audio** — let the user hear the target (`audioUrl`) before recording.
- **Re-record / playback** of the captured clip before sending; keep **retry first-class**
  (one tap, not a reset).

> ⚠️ **Engineering note the designer should know (it shapes the record affordance):** the
> scorer accepts **WAV / FLAC / OGG ≤ 5 MB only** (browser `MediaRecorder`'s default
> `webm/opus` is rejected). Capture is an engineering concern — just assume a valid clip is
> produced; don't design the encoding pipeline.

### 7.2 State machine

```
idle ─rec─▶ recording ─stop─▶ preview ─Score─▶ uploading ─201─▶ result (§7.3)
                                 │                 └─ 400/401/404/503 ─▶ inline error
                                 └─ Re-record ─▶ recording
```

Unlike Mode A this is **synchronous** — the POST returns the full result (`201`) in a few
hundred ms once warm. Show a **brief spinner, not a polling state**. The backend times out at
~8s → `503` → show **Retry**.

### 7.3 Result — phoneme breakdown (`201`)

```
┌─ Pronunciation ──────────────────────────────  72 / 100 ─┐
│     θ          ɪ          n        ← per-phoneme chips     │
│   ┌────┐     ┌────┐     ┌────┐                             │
│   │ 64 │     │ 88 │     │ 65 │     ← colour = label (§9)    │
│   amber      green      amber                              │
│   practice   good       practice                          │
│   ▶ Play  ·  tap a sound to hear that span                 │
│   ⚠ A bit quiet (SNR 12 dB) — try a louder, closer take.   │  ← audioQuality, conditional
│   [ Re-record ]            [ Switch to Write ✍ ]           │
└────────────────────────────────────────────────────────────┘
```

Design to these fields (full shapes in [pronunciation_score.md](../api/pronunciation_score.md)):

- **`overallScore`** (0–100) — headline ring/number, coloured by band (§9).
- **`phonemes[]`** — one chip per sound, **left-to-right in array order**; each has `phone`,
  `score`, and **`label`** (`good` ≥75 / `practice` 45–74 / `wrong` <45) → **chip colour =
  label**. Typically 2–6 sounds; lay out cleanly for 1 up to ~10 without a messy wrap.
- **`start_sec` / `end_sec`** — the clip span of each sound; use to **highlight during
  playback** and let the user **tap a chip to replay just that span**.
- **`transcriptPhonemes`** — the canonical IPA sequence the word was scored against (show as
  the "target" reading).
- **`audioQuality`** — a **non-blocking** warning when `clipping` or low `snr_db`. (A
  `too_short` clip is a `400` "audio too short" → handle as an error, not a warning.)
- **Map the band to copy, not just a number** (consistent with the sibling): ≥75 "Great" ·
  45–74 "Getting there" · <45 "Let's try again", in the matching band colour.

---

## 8. Shared — history & progress

Both modes have a per-word history (newest first, paginated `page`/`limit`):

- **Speak**: `GET /v1/pronunciation/attempts` (filter by `vocabularyId`/`word`) → rows with
  `overallScore` + `phonemeScores[]`. A **sparkline of `overallScore` over time** in the
  header strip is a natural reuse.
- **Write**: poll-by-id only today; if you keep a client list, store each `attemptId` + its
  last projection.

Design a compact **"Your attempts"** strip on the word header (sparkline + last few scores)
linking to a fuller list.

---

## 9. Visual encoding (the one band scale — design's most important rule)

Keep **one** colour scale across both modes so a "72" reads the same everywhere.

| Band | `score` / `overallScore` | Phoneme `label` | Colour |
|---|---|---|---|
| **Good** | **75–100** | `good` | green — `--ok` / `--ok-soft` / `--ok-ink` |
| **Practice** | **45–74** | `practice` | amber — `--amber` / `--amber-soft` |
| **Needs work** | **0–44** | `wrong` | red — `--bad` / `--bad-soft` / `--bad-ink` |

- Rubric `criteria.*` are a **0–5** neutral scale (dots/bars) — **don't** recolour with band
  thresholds.
- `cefr` is a **categorical** chip (A1–C2) — neutral, never band colours.
- **Colour is never the only signal** — always pair with the number (and/or an icon).

---

## 10. States, empty & error matrix

| Situation | Mode | Treatment |
|---|---|---|
| **No word selected** (arrived from sidebar/home) | Both | The **hub**: pick/offer a due word + search/switch. Never a blank screen. |
| Mic permission denied | Speak | Replace recorder with "Enable microphone to practice speaking" + retry. |
| `400` audio too short / bad word | Speak | Inline "Recording too short — hold a bit longer." + Re-record. |
| `503` scorer busy/timeout | Speak | "Scoring is busy, try again." + Retry. |
| `429` daily limit | Write | Disable Submit, "You've used all N practice sentences today — come back tomorrow." |
| `failed` status | Write | Show `error`, offer a fresh submit. |
| Auto-poll exceeded ~60s | Write | Stop auto-poll, "Still scoring…" + manual **Check again**. |
| `401` on any call | Both | Defer to the app-shell guard (refresh/redirect); no bespoke per-panel auth UI. |
| Free-text word (no `vocabularyId`) | Speak only | Allowed via `word`; Write requires a real `vocabularyId`. |
| Loading (history / hub) | Both | `.lr-sk` shimmer. |

One failing panel must **never blank the screen** — the word header + the other mode stay usable.

---

## 11. Design goals & non-goals

**Goals**
1. **Same product family.** Sprout mint, serif word, the orb + mic, the `.lr-*` atoms — no
   seam between `/learn`, the home, and Practice.
2. **The breakdown is the hero.** The phoneme chips (Speak) and the rubric (Write) are the
   payoff — make the result state the visual centrepiece, not the form.
3. **Keep the two timing models distinct** — Write is polled, Speak is inline. Don't blur them.
4. **Retry is first-class and cheap** — re-recording / trying another sentence is one tap.
5. **Never dead-end the learner** — a way out of every error; the other mode always reachable.
6. **Colour means something** — band scale owns scores; `cefr`/criteria are neutral; colour
   is never the only signal.
7. **Accessibility** — clear `aria-label`s + state on the mic/record control; `tabular-nums`
   on all numbers; focus survives the form→result transition; honour `prefers-reduced-motion`.

**Non-goals**
- Don't restate the wire contracts — design to the field tables in the API docs.
- Don't design the audio-capture/encoding pipeline (engineering — assume a valid clip).
- Don't redesign the sidebar/shell (that's the homepage redesign — already done).
- Don't show or let the user edit raw score thresholds; don't present `cefr` as proficiency.
- Light theme only.

---

## 12. Open decisions to resolve (surface a recommendation for each)

1. **Hub word-pick:** auto-pick a due/recent word vs. a chooser-first screen; how search/switch
   reads.
2. **Tabs vs. stacked on mobile:** two mode tabs, or a single scroll with both panels.
3. **Record affordance:** press-and-hold vs. tap-to-start/stop.
4. **Live recording feedback:** simple level meter vs. waveform vs. just the pulse ring.
5. **Phoneme chip interaction:** always show the number vs. reveal on tap; behaviour where
   hover doesn't exist.
6. **Retry cap & which attempt counts:** unlimited vs. N; last vs. best; where the counter lives.
7. **Daily-quota display (Write):** always-on counter vs. only-near-limit.

---

## 13. Screen checklist for the designer

Design at minimum (light theme):

- [ ] **Brand pass:** Practice reads as the Sprout family (mint, serif word, orb/mic), inside
      the branded app shell.
- [ ] **Hub / arrival:** how the user lands on a word with none in hand (pick/offer + search).
- [ ] **Word header:** lemma (serif) · IPA (hide if null) · reference-audio orb (hide if null)
      · gloss · back/switch · history strip — stays mounted across tabs.
- [ ] **Mode tabs:** Write ↔ Speak, header stays, each result jumps to the other mode.
- [ ] **Write mode:** 280-char textarea + counter, async submit→poll (backoff + 60s cap →
      Check again), rubric result with `score` ring (band) / neutral `cefr` chip / four 0–5
      criteria / feedback / conditional Suggested sentence.
- [ ] **Speak mode:** mic record + level meter + hear-it/re-record/play, **synchronous** result,
      per-phoneme chips coloured by `label`, tap-to-replay span, target IPA reading, conditional
      audio-quality warning. (Match the sibling pronunciation card.)
- [ ] **One band scale** (green/amber/red) for all scores; `cefr`/criteria neutral.
- [ ] **History:** per-word attempts strip (sparkline) → fuller list.
- [ ] **Every error row in §10** has a concrete affordance; one panel failing never blanks the
      screen.
- [ ] **Cross-cutting:** `tabular-nums`, colour never the only signal, reduced-motion, light only.

> Keep this file current: when the practice modes' data, surfaced sections, or entry points
> change, update §2–§9 here in the same PR (alongside
> [practice_vocabulary_design.md](../api/practice_vocabulary_design.md)).
