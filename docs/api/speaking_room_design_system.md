# Speaking Room — design-system reference (self-contained)

Hand this file to the design tool **alongside** [speaking_room_design.md](speaking_room_design.md).
It is the real, shipped design system — fonts, exact token values, the `.lr-*` component
atoms, and the colour-meaning rules — transcribed so an agent with **no repo access** can
reproduce the look pixel-for-pixel. Everything here is copied from the live
[globals.css](../../src/app/globals.css); the CSS blocks are copy-paste ready.

> **House rule: this product is colourful.** Mint is the brand, with violet / sky / amber /
> rose accents that *carry meaning*. The default shadcn grey theme is never used on these
> screens — grey is only for disabled states and hairline borders.

---

## 1. Fonts

Loaded via `next/font/google`. Use these exact families:

| Role | Family | CSS var | Usage |
|---|---|---|---|
| **Body / UI / sans** | **Plus Jakarta Sans** | `--font-jakarta` | everything by default; weights 500–800 in use |
| **Display / serif** | **Newsreader** | `--font-newsreader` (`--serif`) | hero words, the focal vocabulary/scenario title, big numbers, sentence display. Often *italic* for IPA/quotes |
| Mono | Geist Mono | `--font-geist-mono` | rare; code/ids only |

```css
--font-sans:  "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
--serif:      "Newsreader", ui-serif, Georgia, serif;
```

Type idioms:
- `.serif` → switch to Newsreader. `.tnum` → tabular figures (`font-variant-numeric: tabular-nums`) for any number that updates.
- **Eyebrow** label: 12px, weight 700, `letter-spacing: 0.12em`, uppercase, colour `--ink-3`.
- Headings are heavy and tight: weight 800, `letter-spacing: -0.02em to -0.025em`.
- Display word: Newsreader, weight 500, `letter-spacing: -0.01em`, `line-height: 1.02`.

---

## 2. Colour tokens (the "Sprout" palette) — exact values

These are the brand tokens. Light theme only. They override the shadcn primitives, so every
reused Button/Badge/Input already comes out branded.

### Core / brand

```css
--primary:        #12bd8a;  /* mint — brand + all primary actions */
--primary-foreground: #ffffff;
--primary-press:  #0ca576;  /* mint pressed */
--primary-ink:    #07684b;  /* deep mint, for text on mint-soft */
--primary-soft:   #e0f6ee;  /* mint tint surface */
--primary-soft-2: #c8eede;  /* mint tint, one step stronger */
--ring:           #12bd8a;
```

### Surfaces & ink

```css
--app-bg:   #eaf1ed;  /* page field (a soft mint-grey, NOT neutral grey) */
--surface:  #ffffff;  /* cards */
--card-2:   #f6faf8;  /* inset / secondary surface */

--ink:   #15241e;  /* primary text (near-black green) */
--ink-2: #5b6b64;  /* secondary text */
--ink-3: #91a09a;  /* tertiary / muted text + placeholders */
--line:   #e9efeb;  /* hairline border */
--line-2: #dde6e1;  /* stronger border / input border */
```

### Accent ramps — **each colour means something**

```css
/* amber — gamification / streak / "coaching" corrections (never alarming) */
--amber:      #ffb020;
--amber-2:    #ff7a1a;
--amber-soft: #fff0d4;

/* violet — social / voice / the AI partner */
--violet:      #7b6cff;
--violet-soft: #ece9ff;

/* sky — info / "air"/voice secondary */
--sky:      #1f9fd1;
--sky-soft: #e0f1fa;

/* semantic: ok (mint-green) vs bad (rose) */
--ok:      #11a368;  --ok-soft:  #dcf4e7;  --ok-ink:  #0a6e44;
--bad:     #f1456a;  --bad-soft: #fde4ea;  --bad-ink: #b51f42;

/* warn — honesty/caution accent (publish/visibility) */
--warn:      #d98a23;  --warn-soft: #fbf0dd;  --warn-ink: #7a4d0c;
```

### Meaning map (do not swap these)

| Colour | Means | Used for |
|---|---|---|
| **Mint** `--primary` | the brand, the learner, "go" | primary buttons, the learner's chat bubbles + mic, progress fill, target-word "used" ticks |
| **Violet** `--violet` | social / voice / the AI partner | the AI's avatar + bubbles + speaking orb, community |
| **Sky** `--sky` | info / air | "what to practise next", info chips, A-level CEFR |
| **Amber** `--amber` | gamification + gentle coaching | streaks, the quiet **correction** cards (NOT red) |
| **Rose** `--bad` | a live, hot state / a real error | the mic while recording; hard validation errors only |
| **Mint-green** `--ok` | success | correct answers, words successfully used |

---

## 3. Radii, shadows, motion

```css
--radius: 1.125rem;     /* base; shadcn radii derive from it */
--r-card: 30px;         /* card corner */
--r-tile: 18px;         /* option tile / inner block */
--r-chip: 999px;        /* pills, buttons, chips (fully round) */
--r-input: 16px;        /* text inputs */

--sh-sm: 0 1px 2px rgba(16,40,32,.05), 0 2px 6px rgba(16,40,32,.04);
--sh-md: 0 2px 6px rgba(16,40,32,.05), 0 14px 30px -10px rgba(16,40,32,.14);
--sh-lg: 0 10px 26px -8px rgba(16,40,32,.12), 0 34px 64px -22px rgba(16,40,32,.2);
--sh-primary: 0 8px 18px -5px rgba(18,189,138,.5);   /* mint glow under primary btns */
--sh-amber:   0 8px 18px -5px rgba(255,140,30,.5);
```

Motion: short, springy, purposeful. Common easings `cubic-bezier(.2,.8,.3,1.2)` (springy) and
`cubic-bezier(.2,.8,.2,1)` (fade-up). Cards lift `-3px` on hover. **Always** honour
`prefers-reduced-motion` (neutralise all decorative animation).

### Page backgrounds (not flat grey — soft radial washes)

```css
/* generic app field */
.app-field { background:
  radial-gradient(120% 80% at 50% -10%, rgba(18,189,138,.07), transparent 60%),
  var(--app-bg); }

/* Speaking Room field — violet+sky wash (the "conversation" identity) */
.speak-field { background:
  radial-gradient(120% 90% at 0% -10%, rgba(123,108,255,.10), transparent 55%),
  radial-gradient(120% 90% at 100% -10%, rgba(31,159,209,.10), transparent 55%),
  var(--app-bg); }

/* Speaking Room hero band (behind a scenario header / live header) */
.speak-band { background:
  radial-gradient(120% 120% at 0% 0%, rgba(123,108,255,.16), transparent 55%),
  radial-gradient(120% 120% at 100% 0%, rgba(31,159,209,.14), transparent 55%),
  var(--surface); }
```

---

## 4. Component atoms (`.lr-*`) — the real CSS

These are the shipped building blocks. Compose screens from these; don't invent new ones.
CSS below is the live source, trimmed to what a designer/agent needs.

### 4.1 Card

```css
.lr-card {
  background: var(--surface);
  border-radius: var(--r-card);     /* 30px */
  border: 1px solid var(--line);
  box-shadow: var(--sh-md);
}
.hoverlift { transition: transform .18s, box-shadow .2s, border-color .18s; }
.hoverlift:hover {
  transform: translateY(-3px);
  box-shadow: var(--sh-lg);
  border-color: var(--primary-soft-2);
}
```

### 4.2 Buttons — pill family

```css
.lr-btn {                /* base: fully-round, weight 700, springy press */
  font-weight: 700; border: none; cursor: pointer; border-radius: var(--r-chip);
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
}
.lr-btn--primary { background: var(--primary); color:#fff;
  box-shadow: var(--sh-primary), inset 0 1px 0 rgba(255,255,255,.25); }
.lr-btn--primary:hover { background:#14c994; transform: translateY(-1px); }
.lr-btn--amber  { background: linear-gradient(180deg,var(--amber),var(--amber-2) 130%);
  color:#fff; box-shadow: var(--sh-amber); }
.lr-btn--soft   { background: var(--primary-soft); color: var(--primary-ink); }
.lr-btn--ghost  { background: transparent; color: var(--ink-2);
  box-shadow: inset 0 0 0 1.5px var(--line-2); }
/* sizes */
.lr-btn--lg { height:60px; padding:0 30px; font-size:18px; }
.lr-btn--md { height:48px; padding:0 22px; font-size:15.5px; }
.lr-btn--sm { height:38px; padding:0 16px; font-size:14px; }
.lr-btn--block { width:100%; }
```

### 4.3 Chips & pills

```css
.lr-chip {              /* hint / seed-phrase / tag */
  display:inline-flex; align-items:center; gap:7px;
  padding:7px 14px 7px 12px; border-radius: var(--r-chip);
  background: var(--surface); border:1.5px solid var(--line-2);
  color: var(--ink-2); font-weight:600; font-size:14px; box-shadow: var(--sh-sm);
}
/* accent fills (background + ink) */
.lr-chip--mint   { background: var(--primary-soft); color: var(--primary-ink); border-color: transparent; }
.lr-chip--violet { background: var(--violet-soft);  color: #4b3fb0;            border-color: transparent; }
.lr-chip--amber  { background: var(--amber-soft);   color: #92590a;            border-color: transparent; }
.lr-chip--sky    { background: var(--sky-soft);     color: #0f5e80;            border-color: transparent; }
.lr-chip--bad    { background: var(--bad-soft);     color: var(--bad-ink);     border-color: transparent; }
```

Status / provenance pills (`.prov` family): fully-round, 11.5px, weight 800.
For scenario lifecycle use: **draft = amber fill**, **published/"Live" = mint/`--ok` fill**,
**retired = rose `--bad-soft`**. The label always carries the meaning — colour is never alone.

### 4.4 Inputs & selects

```css
.lr-input {
  font-weight:600; font-size:19px; color: var(--ink);
  background: var(--surface); border:2px solid var(--line-2);
  border-radius: var(--r-input); padding:16px 18px; width:100%;
  box-shadow: var(--sh-sm);
}
.lr-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
.lr-input.is-correct { border-color: var(--ok);  background: var(--ok-soft);  color: var(--ok-ink); }
.lr-input.is-wrong   { border-color: var(--bad); background: var(--bad-soft); color: var(--bad-ink); }

.lr-select {            /* filter dropdown — round, custom chevron */
  font-size:14px; font-weight:700; color: var(--ink); background: var(--surface);
  border:1px solid var(--line-2); border-radius: var(--r-chip);
  padding:8px 34px 8px 15px; appearance:none; cursor:pointer;
}
```

### 4.5 The AI speaking orb (violet) — drives `SpeechSynthesis`

```css
.lr-orb {               /* default mint variant */
  width:78px; height:78px; border-radius:999px;
  background: radial-gradient(120% 120% at 35% 25%, #2bd6a3, var(--primary) 70%);
  color:#fff; display:grid; place-items:center; cursor:pointer;
  box-shadow: var(--sh-primary), inset 0 2px 4px rgba(255,255,255,.35);
}
.lr-orb.violet {        /* USE THIS for the AI partner */
  background: radial-gradient(120% 120% at 35% 25%, #a99bff, var(--violet) 70%);
  box-shadow: 0 8px 18px -5px rgba(123,108,255,.55), inset 0 2px 4px rgba(255,255,255,.35);
}
.lr-orb--sm { width:54px; height:54px; }
.lr-orb--lg { width:104px; height:104px; }
.lr-orb .ring { position:absolute; inset:-6px; border-radius:999px;
  border:2.5px solid var(--violet); opacity:0; }
.lr-orb.playing .ring { animation: lr-ring 1.5s ease-out infinite; }  /* pulse while "speaking" */
@keyframes lr-ring { 0%{opacity:.6;transform:scale(.9)} 100%{opacity:0;transform:scale(1.5)} }
```

### 4.6 The learner mic — red only while recording

```css
.lr-mic {
  width:96px; height:96px; border-radius:999px;
  background: linear-gradient(180deg,#fff,var(--card-2));
  box-shadow: var(--sh-md), inset 0 0 0 2px var(--line-2);
  color: var(--primary); display:grid; place-items:center; cursor:pointer;
}
.lr-mic:hover { transform: translateY(-2px); box-shadow: var(--sh-lg), inset 0 0 0 2px var(--primary-soft-2); }
.lr-mic.recording {   /* the ONLY place rose appears as a fill */
  color:#fff; background: linear-gradient(180deg,#ff6b8a,var(--bad));
  box-shadow: 0 8px 20px -5px rgba(241,69,106,.5);
}
.lr-mic .pulse { position:absolute; inset:0; border-radius:999px; border:3px solid var(--bad); opacity:0; }
.lr-mic.recording .pulse { animation: lr-mic-pulse 1.3s ease-out infinite; }
```

### 4.7 Progress bar

```css
.lr-progress { height:12px; border-radius:999px; background:#e2ebe6; overflow:hidden;
  box-shadow: inset 0 1px 2px rgba(16,40,32,.07); position:relative; }
.lr-progress > i {            /* the fill */
  position:absolute; inset:0 auto 0 0; border-radius:999px;
  background: linear-gradient(90deg, var(--primary), #2bd6a3);
  box-shadow: 0 0 10px rgba(18,189,138,.4);
  transition: width .55s cubic-bezier(.3,.9,.3,1);
}
```

### 4.8 Option tile, blank, streak, skeleton (reference)

- **Option tile** `.lr-opt`: white card, `1.5px var(--line-2)` border, `--r-tile` radius, lifts on hover; states `.is-selected` (mint), `.is-correct` (`--ok`), `.is-wrong` (`--bad`).
- **Fill-the-blank** `.lr-blank`: 3px mint underline; `.is-correct` / `.is-wrong` swap to `--ok` / `--bad`.
- **Streak badge** `.lr-streak`: amber gradient pill `linear-gradient(180deg,#fff5e0,var(--amber-soft))`, border `#ffe1a8`, ink `#b5650c`, flame icon.
- **Skeleton** `.lr-sk`: shimmer `linear-gradient(90deg,#e2ebe6 25%,#eef4f0 37%,#e2ebe6 63%)`, animated; use for all loading states (never a bare spinner on grey).

---

## 5. Chat layout primitives (Speaking Room live screen)

There is no shipped chat atom yet — build it from the system above:

- **AI bubble** — left-aligned, `--violet-soft` background, `--ink` text, `--r-tile` radius, paired with a small `.lr-orb.violet --sm` avatar. The AI is the *voice*.
- **Learner bubble** — right-aligned, `--primary-soft` background, `--primary-ink` text, same radius. The learner is the *actor*.
- **Correction card** — tucked **under** the learner turn it fixes; `--amber-soft` background, `--amber` left accent, layout `userSaid → better` + a `why` line. Quiet, never red, never "spoken."
- **Target-word chips** — `.lr-chip--mint` in the header; when the AI uses one, swap it to a filled `--ok` chip with a check. Watch them light up live.
- **Composer** — `.lr-mic` + a `.lr-input` + a `.lr-btn--primary` Send; disable the whole row while a turn is in flight (turn-based), re-enable when the reply lands.

---

## 6. The one-paragraph summary for the design tool

Build on **Plus Jakarta Sans** with **Newsreader** for display. The brand is **mint `#12bd8a`**
on a soft mint-grey field `#eaf1ed` with white cards (30px radius, soft green-tinted shadows).
Accents carry meaning: **violet `#7b6cff`** = the AI partner / voice, **amber `#ffb020`** =
streaks + gentle corrections, **sky `#1f9fd1`** = info, **mint-green `#11a368`** = success,
**rose `#f1456a`** = a live mic or a real error. Everything is rounded — buttons and chips are
full pills, inputs 16px, tiles 18px. Motion is short and springy and respects reduced-motion.
**Never render the default grey shadcn theme**; grey is only disabled states and hairlines.
For the Speaking Room specifically, the page field and hero bands carry a **violet→sky wash**
so the conversation surface reads as distinct from the mint Learn screens.
</content>
