# Speaking Room — design context (UI brief for build)

This is the **design brief** that turns the four Speaking Room API docs into screens.
It is the "what to build & how it should look" layer; the request/response shapes are
authoritative in the per-feature docs and are only summarised here.

- **Admin authoring (Phase 1):** [admin_create_scenario.md](admin_create_scenario.md) · [admin_draft_scenario.md](admin_draft_scenario.md)
- **Learner practice (Phase 2):** [speaking_browse_scenarios.md](speaking_browse_scenarios.md) · [speaking_practice_session.md](speaking_practice_session.md)
- **Design system this brief reuses:** [globals.css](../../src/app/globals.css) (Sprout tokens + `.lr-*` atoms), the homepage memory `homepage-redesign-trophy-room`, and the practice/learn screens already shipped.
- **Working with an external design tool (no repo access)?** Hand it [speaking_room_design_system.md](speaking_room_design_system.md) — a self-contained transcription of the fonts, exact token values, and `.lr-*` atom CSS — together with this brief.

> **Hard rule for this feature: it is colourful. No neutral / grey shadcn theme.**
> Every Speaking Room surface — *including the admin authoring screens* — renders inside a
> branded Sprout scope, never the default grey `(admin)` chrome. Grey is reserved only for
> disabled states and hairline borders. If a surface looks like default shadcn, it is wrong.

---

## 0. The whole feature in one picture

```
                    ADMIN (Phase 1 — authoring)                 LEARNER (Phase 2 — practice)
   ┌─────────────────────────────────────────────┐   ┌────────────────────────────────────────────┐
   │  /admin/scenarios            (list + status) │   │  /speaking            (browse scenario cards)│
   │      │  "Draft with AI" ───► prefill form    │   │      │  pick a scenario card                 │
   │      ▼                                        │   │      ▼                                        │
   │  /admin/scenarios/new        (author form)   │   │  /speaking/[id]       (scene card + pick words)│
   │      │  POST → draft                          │   │      │  Start session                        │
   │      ▼                                        │   │      ▼                                        │
   │  /admin/scenarios/[id]       (edit + publish) │   │  /speaking/[id]/session  (live conversation) │
   │      │  publish → published / retire          │   │      │  turn ⇄ reply  …  End                 │
   └──────┴──────────────────────────────────────┘   │      ▼                                        │
                                                       │  report (feedback) ── on End                 │
                                                       └──────────────────────────────────────────────┘
```

A **scenario** is authored once by an admin (setting, roles, goal, opening line) and
practised by many learners as a **live, turn-based AI conversation**. Phase 2a is
**text-only**; the same screens will later carry audio (STT in, TTS out) — design the
voice affordances now even though they fall back to text + `SpeechSynthesis`.

---

## 1. Brand identity — the Speaking Room palette

The app already assigns meaning to colour (see `.app-shell` tokens in [globals.css](../../src/app/globals.css)):
mint = core/learn, **violet = social/voice**, amber = streak/gamification, sky = info, rose/`--bad` = correction.
The Speaking Room is the app's **conversation** surface, so it leans on the parts of the
palette that already mean "voice" and "people" and pushes them to the front.

| Role in the Speaking Room | Token(s) | Why |
|---|---|---|
| **Signature band / hero wash** | `--violet` → `--sky` gradient | the "talk" identity; distinct from mint Learn and amber gamification |
| **AI partner** (persona, its bubbles, its orb) | `--violet` / `.lr-orb.violet` | the partner has a voice + personality |
| **Learner** (their bubbles, their mic, primary CTAs) | `--primary` mint / `.lr-mic` | the learner is the actor; primary actions stay mint app-wide |
| **Corrections** (the quiet teaching channel) | `--amber` / `--amber-soft` | gentle coaching, *never* the alarming red — corrections are not errors |
| **Target words** (to weave in) | mint chips → tick to `--ok` when used | progress you can watch fill live |
| **Live / recording** | `--bad` coral / `.lr-mic.recording` | the only place red appears: an active hot mic |
| **CEFR level badge** | per-level ramp (A=sky, B=violet, C=amber) | scannable difficulty, colour-coded |
| **Scenario status** (admin) | draft=`--amber`, published=`--ok`/mint, retired=`--bad-soft` rose | lifecycle you can read at a glance — no grey "inactive" pills |

### Introduce a `.speak-shell` scope

Mirror the existing `.learn-shell` / `.app-shell` blocks in [globals.css](../../src/app/globals.css):
add a `.speak-shell` selector that **inherits the Sprout token block** (so every reused
`.lr-*` atom and shadcn primitive is already branded) and adds the Speaking Room flourishes:

```css
/* the conversation field — violet/sky wash, NOT app-bg grey */
.speak-field {
  background:
    radial-gradient(120% 90% at 0% -10%, rgba(123, 108, 255, 0.10), transparent 55%),
    radial-gradient(120% 90% at 100% -10%, rgba(31, 159, 209, 0.10), transparent 55%),
    var(--app-bg);
}
/* hero band behind a scenario / the live header */
.speak-band {
  background:
    radial-gradient(120% 120% at 0% 0%, rgba(123, 108, 255, 0.16), transparent 55%),
    radial-gradient(120% 120% at 100% 0%, rgba(31, 159, 209, 0.14), transparent 55%),
    var(--surface);
}
```

**The learner screens** (`/speaking/*`) live in the `(app)` group, so they already get
`.app-shell`; wrap their root in `.speak-shell .speak-field` for the conversation identity.

**The admin screens** (`/admin/scenarios/*`) live in the `(admin)` group, which today has
**no** Sprout scope — it would render grey. **Wrap the scenario admin pages in
`.app-shell .speak-shell` explicitly** so authoring is just as colourful as the learner side.
This is the deliberate exception to the neutral admin chrome and the whole point of "no grey."

---

## 2. Reuse map — don't reinvent atoms

Everything below already exists in [globals.css](../../src/app/globals.css) and is colour-correct
inside the Sprout scope. Build the Speaking Room by composing these, the same way
`practice-hub.tsx` does.

| Need | Reuse |
|---|---|
| Card surface | `.lr-card` + `.hoverlift` |
| Buttons | `.lr-btn` (`--primary` / `--amber` / `--soft` / `--ghost`, sizes `--lg/--md/--sm`) |
| Chips (seed phrases, target words, topic tags) | `.lr-chip` + accent variants `.lr-chip--violet / --sky / --amber / --mint` |
| The AI "speaking" orb | `.lr-orb.violet` with `.playing` ring (drives `SpeechSynthesis`) |
| The learner mic | `.lr-mic` + `.recording` + `.pulse` (Phase 2a: a text-send affordance can sit beside it) |
| Filter selects (topic / level) | `.lr-select` |
| Provenance / status badges | `.prov` family + new status tones |
| Progress / turn meter | `.lr-progress` |
| Empty / loading | `.lr-sk` skeletons + composed empty states (see `QuickStartEmpty`) |
| Eyebrow / serif display / tabular nums | `.lr-eyebrow`, `.serif`, `.tnum` |
| Data layer | render-safe reads with `apiRequest`+token that **degrade to empty, never throw** (see [queue.ts](../../src/lib/me/practice/queue.ts)); mutations via Server Actions with `authedRequest`. New modules under `src/lib/admin/scenarios/` and `src/lib/me/speaking/`. |

---

## 3. ADMIN — Author scenarios (Phase 1)

API: [admin_create_scenario.md](admin_create_scenario.md) · [admin_draft_scenario.md](admin_draft_scenario.md).
Role-gated to `admin` (the `(admin)` layout already redirects non-admins).

### 3.1 `/admin/scenarios` — list + lifecycle

A gallery of scenario cards (not a grey table). Each card is a `.lr-card` showing
`title`, a **CEFR badge**, the **topic** chip, a one-line `setting`, `estTurns`, and a
**status pill**:

- `draft` → amber pill "Draft"
- `published` → mint/`--ok` pill "Live"
- `retired` → rose `--bad-soft` pill "Retired"

Header band = `.speak-band` with the title "Speaking scenarios" and a primary
**+ New scenario** button. Filter row reuses `.lr-select` for `topic` / `cefrLevel` /
`status`, plus pagination (`page`/`limit`). Newest first.

Card actions: **Edit**, **Publish/Unpublish**, **Retire** (soft-delete, `DELETE` → 204).
Publishing a draft makes it learner-visible; editing a *published* scenario bumps `version`
server-side — surface a subtle "editing a live scenario" note so the admin knows in-flight
sessions stay on the old version.

### 3.2 `/admin/scenarios/new` — the author form (+ Draft with AI)

Two-column on desktop, single column on mobile. **Left = the form, right = a live
"scene card" preview** that renders exactly what a learner will see (§4.2) — this preview
is the reason to keep the screen colourful and is the admin's best feedback loop.

**Draft with AI (top of the form):** a `.speak-band` strip with a brief input
("café ordering, B1") + optional level/topic pins, and a **violet** "Draft with AI" button.
- It's a synchronous LLM round-trip (a few seconds): show a loading state on the button and
  disable it while in flight.
- On 200, **prefill every form field** from the response (`title`, `topic`, `cefrLevel`,
  `setting`, `aiRole`, `userRole`, `goal`, `openingLine`, `seedPhrases`, `estTurns`,
  `introVideoScript`) and let the admin edit. Show the `model` as a small "drafted by …" footnote.
- On **503** (helper unconfigured or model failed/timed out): show an inline amber notice
  "AI drafting is unavailable — fill the form manually" and keep the manual form fully usable.
  The AI helper is convenience, **never** a dependency.

**The manual form** maps 1:1 to the create body. Group it so it reads like a story, not a
spreadsheet:
- **The scene** — `title`, `topic` (slug, lowercase `[a-z0-9-]`), `cefrLevel` (A1–C2 or "Any"), `setting` (textarea).
- **The cast** — `aiRole` and `userRole` side by side, drawn as two facing avatar chips (violet = AI, mint = learner) so the role-play reads instantly.
- **The mission** — `goal` (textarea), `openingLine` (the AI's scripted turn 0 — preview it in a violet bubble).
- **Useful phrases** — `seedPhrases` as an editable mint chip list (≤ 20, add/remove).
- **Pacing & extras** — `estTurns` (1–100), optional `introVideoScript`.

Validation is strict (unknown fields → 400; field rules in the API doc) — validate inline
with the existing form helpers ([forms.ts](../../src/lib/forms.ts)). Submit → `POST` → lands in
`draft`. `introVideoUrl` is attached separately and **not rendered in Phase 1**.

### 3.3 `/admin/scenarios/[id]` — edit + publish

Same form as `new`, prefilled from `GET …/:id`, plus the lifecycle controls (Publish /
Unpublish / Retire) and the version note. Keep the live scene-card preview.

---

## 4. LEARNER — Browse & start (Phase 2)

API: [speaking_browse_scenarios.md](speaking_browse_scenarios.md). Any logged-in user; only
**published** scenarios are ever returned.

### 4.1 `/speaking` — the scenario catalogue

`.speak-field` page, `.speak-band` header ("Speaking Room — practise a real conversation").
Grid of **scenario cards** (`.lr-card` + `.hoverlift`), each a mini movie poster:

- A coloured **scene header** (violet→sky gradient or, later, the `introVideoUrl` poster frame).
- `title` (serif display), **CEFR badge**, **topic** chip.
- The two-role line as facing avatar chips ("You: customer · AI: barista").
- One-line `goal` ("Order a drink and ask the price").
- `estTurns` as a small "~8 turns" meta.

If the learner has a CEFR level and doesn't pin one, the API already orders *their level
first, then any-level, then the rest* — surface a gentle "Recommended for B1" ribbon on the
leading cards. Filters: `topic` / `cefrLevel` via `.lr-select`. Empty state composed like
`QuickStartEmpty` (colourful, with a path forward), never a bare "no results."

### 4.2 `/speaking/[id]` — scene card + pick words (the pre-flight)

This is the "ready room" before the live session. `GET …/:id` for the full card.

- **Scene card**: the colourful brief built from `setting` + the two roles + `goal`. If
  `introVideoUrl` is present (later), play the cutscene; otherwise the scene card *is* the intro.
- **Useful phrases**: render `seedPhrases` as mint hint chips.
- **Pick words to practise**: a compact word-picker (reuse the practice hand-pick pattern —
  `vocabularyIds`, ≤ 50) so the learner can seed target words into the conversation. Optional;
  "skip" is fine.
- **Start** (`.lr-btn--primary lr-btn--lg`) → `POST /v1/speaking/sessions` with `scenarioId`
  (+ optional `vocabularyIds`) → go to the live screen with the returned session `id`.
  If any requested words come back in `inaccessibleVocabularyIds`, show a subtle
  "N words couldn't be added." `selectedWords` is the snapshot to display as the targets.

### 4.3 `/speaking/[id]/session` — the live conversation (the centrepiece)

API: [speaking_practice_session.md](speaking_practice_session.md). Flow: **start → (turn ⇄ reply)\* → end → report.**
Keep the session `id` for every call. No history endpoint — accumulate the transcript
client-side from `openingLine` + each `reply` and the `text` you sent.

**Layout — a chat, not a form:**

```
┌───────────────────────────────────────────────┐
│  .speak-band header: scenario title · CEFR ·   │  ← partner identity + "End" button
│  AI avatar (violet) + role,  target-word chips │
├───────────────────────────────────────────────┤
│                                                │
│   [violet bubble]  AI: openingLine (turn 0)    │  ← AI = violet, left-aligned
│                    learner: "I want a coffee"  │  ← learner = mint, right-aligned
│   [violet bubble]  AI: reply …                 │
│        └ [amber correction card] (quiet)       │  ← teaching channel, tucked under the turn
│                                                │
├───────────────────────────────────────────────┤
│  mic (.lr-mic) + text input + Send   [disabled │  ← strictly turn-based; lock while in flight
│  while a turn is in flight]                     │
└───────────────────────────────────────────────┘
```

Channel rules — these are the soul of the screen:

- **`openingLine` is the AI's turn 0** — render it immediately as the first violet bubble and
  speak it via `SpeechSynthesis` (no model call). Pulse the `.lr-orb.violet` while it "speaks."
- **`reply` is the spoken channel** — show as the AI bubble and speak it. Server-side TTS is later.
- **`corrections` is the quiet teaching channel** — render as **amber** cards tucked under the
  learner's turn they correct (`userSaid` → `better`, with `why`). **Never** speak them, never
  interrupt, never colour them red. Often `[]` — when empty, show nothing.
- **`usedTargetWords`** — tick the matching header chip from mint → filled `--ok` so the
  learner watches their target words light up live.
- **Turn-based discipline:** disable the input + Send while a turn is in flight, re-enable when
  the reply lands. The mic uses `.lr-mic.recording` (coral) only while actively capturing.

**End → report:** an **End** button (`.lr-btn--ghost` in the header) → `POST …/end` (no body,
idempotent). Show a "building your report" state (one slower model call), then the **feedback
report** as a colourful results card, not a grey summary:

- `summary` — a warm headline in a mint `.speak-band` hero.
- `topMistakes` — amber correction cards (same atom as live corrections).
- `targetWordsUsed` (mint/`--ok` chips) vs `targetWordsMissed` (muted outline chips).
- `estimatedLevel` — a big CEFR badge.
- `whatToPracticeNext` — sky chips linking onward (e.g. into Learn/Practice).
- A **Practice again** primary CTA + a link back to `/speaking`.

The report is re-fetchable via `GET …/report` (regenerated on read if not ready).

---

## 5. States, errors & edge cases (design every one)

| Situation | API signal | UX |
|---|---|---|
| AI draft slow / failed | `503` on `…/scenarios/draft` | amber notice, manual form stays usable |
| Publishing an already-published scenario | `400` | disable the action when already live |
| Some picked words unusable | `inaccessibleVocabularyIds` non-empty on start | subtle "N words couldn't be added" |
| A single turn fails | `503` on `…/turn` (turn **not** saved) | keep the learner's text, offer **Retry** inline — safe to resend |
| Per-session turn cap hit | `400` | prompt the learner to **End** the session |
| Daily session cap hit | `429` on start | "You've hit today's practice limit — try again tomorrow." |
| Report build failed | `reportStatus: "failed"`, `report: null` | "couldn't build your report" + **Retry** (re-call end / GET report) |
| Report fetched while still active | `400` | end the session first |
| Scenario gone / not published | `404` | colourful "not found", back to `/speaking` |
| Not authed / expired | `401` | login / refresh (handled by `authedRequest`) |

Loading and empty states are **composed and colourful** (`.lr-sk` shimmer + a friendly path
forward), matching the shipped practice/learn screens — never a bare spinner on grey.

**Accessibility / motion:** the `prefers-reduced-motion` rule in [globals.css](../../src/app/globals.css)
already neutralises the orb/mic/confetti animations inside `.app-shell`/`.learn-shell`; the new
`.speak-shell` inherits that scope, so keep all motion decorative and announce live AI replies
to screen readers (`aria-live="polite"`).

---

## 6. Build order (suggested)

1. `.speak-shell` / `.speak-field` / `.speak-band` in [globals.css](../../src/app/globals.css) + status-pill tones.
2. Data layer: `src/lib/admin/scenarios/` (CRUD + draft) and `src/lib/me/speaking/` (browse + session), following the render-safe-read / Server-Action split.
3. Admin: list → author form (+ Draft with AI + live scene preview) → edit/publish.
4. Learner: catalogue → scene card + word-pick → live session → report.
5. Wire nav entries (admin "Scenarios"; user "Speaking Room") and index this doc + the four API docs in [frontend_handoff.md](frontend_handoff.md).

Keep it colourful end to end — violet/sky for the conversation, mint for the learner and
primary actions, amber for coaching, rose only for a live mic. No grey theme anywhere.
</content>
</invoke>
