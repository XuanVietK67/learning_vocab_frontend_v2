# Sprout design-system reference (the real CSS)

The actual design tokens, fonts, component classes, keyframes, and card scaffold that the **`/learn` session ("Sprout")** UI is built from — copied verbatim from source so a design pass can match it **pixel-for-pixel**. Pair this with the feature briefs ([learn_pronunciation_redesign_context.md](learn_pronunciation_redesign_context.md), [learn_flow_design_brief.md](learn_flow_design_brief.md)): the briefs say *what to build*; this says *exactly how it looks*.

**Source files** (authoritative — if this doc and the code disagree, the code wins):
- Tokens + component CSS: [globals.css](../../src/app/globals.css) (the `.learn-shell` block and the `lr-*` / `learn-*` atoms).
- Fonts + theme scope: [learn/layout.tsx](../../src/app/(app)/learn/layout.tsx).
- Card scaffold: [session-shell.tsx](../../src/app/(app)/learn/session-shell.tsx).

---

## 0. How the system is wired (read first)

- The whole theme is **scoped to `.learn-shell`** (set once in the learn layout). All the tokens below are CSS custom properties declared on `.learn-shell`, and every `lr-*` atom resolves its colours from them — so these classes **only render correctly inside `.learn-shell`**.
- Colours are **plain CSS variables**, not Tailwind theme colors. In JSX they're consumed two ways:
  - via the component classes (`.lr-btn`, `.lr-orb`, …), and
  - via Tailwind v4 arbitrary syntax in markup, e.g. `text-(--ink-2)`, `bg-(--amber-soft)`, `size-9`.
- Light theme only — there is **no dark variant** for `.learn-shell`.
- `prefers-reduced-motion` is honoured globally (see §7) — keep new motion inside that contract.

---

## 1. Fonts

From [learn/layout.tsx](../../src/app/(app)/learn/layout.tsx) (Next.js `next/font/google`, scoped to the learn subtree):

```ts
// Friendly geometric sans for the Sprout session UI (Vietnamese-capable).
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

// Dictionary-feel serif that anchors the vocabulary word and cloze sentences.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
```

Resolved stacks (declared on `.learn-shell`):

```css
/* body / UI text */
font-family: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
/* serif — the word, IPA, cloze sentences */
--serif: var(--font-newsreader), ui-serif, Georgia, serif;
```

- **Plus Jakarta Sans** — all UI text, labels, buttons. Weights used: 400/500/600/700/800.
- **Newsreader** (serif) — the vocabulary word (`.lr-word`), IPA (`.lr-ipa`, *italic*), and example sentences (`.lr-sentence`). Weights 400/500/600, normal + italic.

---

## 2. Tokens (`.learn-shell`)

Verbatim from [globals.css](../../src/app/globals.css). These shadow the shadcn tokens locally so reused primitives (Button, Badge, Progress…) pick up the mint accent automatically.

```css
.learn-shell {
  /* shadcn token overrides (Sprout mint) — reused primitives inherit these */
  --primary: #12bd8a;
  --primary-foreground: #ffffff;
  --ring: #12bd8a;
  --secondary: #e0f6ee;
  --secondary-foreground: #07684b;
  --muted: #eaf1ed;
  --muted-foreground: #91a09a;
  --border: #dde6e1;
  --input: #dde6e1;
  --card: #ffffff;
  --card-foreground: #15241e;
  --popover: #ffffff;
  --popover-foreground: #15241e;
  --radius: 1.125rem;

  /* field + surface */
  --learn-bg: #eaf1ed;
  --learn-field-2: #e2ebe6;
  --learn-surface: #ffffff;
  --card-2: #f6faf8;

  /* hero mint ramp */
  --primary-press: #0ca576;
  --primary-ink: #07684b;
  --primary-d: #07684b; /* legacy alias */
  --primary-soft: #e0f6ee;
  --primary-soft-2: #c8eede;

  /* ink + lines */
  --ink: #15241e;
  --ink-2: #5b6b64;
  --ink-3: #91a09a;
  --line: #e9efeb;
  --line-2: #dde6e1;
  --tint: #e0f6ee;

  /* semantic */
  --ok: #11a368;
  --ok-soft: #dcf4e7;
  --ok-ink: #0a6e44;
  --ok-bg: #dcf4e7; /* legacy alias */
  --bad: #f1456a;
  --bad-soft: #fde4ea;
  --bad-ink: #b51f42;
  --bad-bg: #fde4ea; /* legacy alias */

  /* gamification accents */
  --amber: #ffb020;
  --amber-2: #ff7a1a;
  --amber-soft: #fff0d4;
  --violet: #7b6cff;
  --violet-soft: #ece9ff;
  --sky: #1f9fd1;
  --sky-soft: #e0f1fa;

  /* radii */
  --r-card: 30px;
  --r-tile: 18px;
  --r-chip: 999px;
  --r-input: 16px;

  /* shadows */
  --sh-sm: 0 1px 2px rgba(16, 40, 32, 0.05), 0 2px 6px rgba(16, 40, 32, 0.04);
  --sh-md: 0 2px 6px rgba(16, 40, 32, 0.05), 0 14px 30px -10px rgba(16, 40, 32, 0.14);
  --sh-lg: 0 10px 26px -8px rgba(16, 40, 32, 0.12), 0 34px 64px -22px rgba(16, 40, 32, 0.2);
  --sh-primary: 0 8px 18px -5px rgba(18, 189, 138, 0.5);
  --sh-amber: 0 8px 18px -5px rgba(255, 140, 30, 0.5);
  --learn-shadow: var(--sh-lg);

  --serif: var(--font-newsreader), ui-serif, Georgia, serif;

  /* page background: a soft mint glow over the field colour */
  background:
    radial-gradient(120% 80% at 50% -10%, rgba(18, 189, 138, 0.07), transparent 60%),
    var(--learn-bg);
  color: var(--ink);
  font-family: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

### Semantic colour map for the pronunciation card

The score `label` maps 1:1 onto the semantic tokens — use these, don't invent new greens/ambers/reds:

| `label` | text/border | fill |
|---|---|---|
| `good` (≥75) | `--ok` `#11a368` (deep ink `--ok-ink` `#0a6e44`) | `--ok-soft` `#dcf4e7` |
| `practice` (45–74) | `--amber` `#ffb020` (`--amber-2` `#ff7a1a` for gradient) | `--amber-soft` `#fff0d4` |
| `wrong` (<45) | `--bad` `#f1456a` (deep ink `--bad-ink` `#b51f42`) | `--bad-soft` `#fde4ea` |

---

## 3. Card scaffold (the frame your card renders into)

From [session-shell.tsx](../../src/app/(app)/learn/session-shell.tsx). Every question renders as `children` inside this. **Design the card body to fit here** — the top chrome (exit, type pill, step dots, streak, settings, progress) and the footer slot are owned by the shell, not your card.

```tsx
// Outer column: centered, capped width, full session height.
<div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-140 flex-col px-4 py-5 sm:py-6">
  {/* top chrome: exit · type pill · step dots · streak · settings, then progress bar */}
  <div className="mb-4"> … </div>

  {/* study card */}
  <div className="learn-card relative flex flex-1 flex-col overflow-hidden p-6 sm:p-7">
    <Confetti />
    <div className="learn-anim-in flex flex-1 flex-col">
      {children}        {/* ← YOUR question card body goes here */}
    </div>
    {footer && <div className="mt-5">{footer}</div>}   {/* ← Check / Continue lives here */}
    {fx && <FeedbackFx />}    {/* correct/wrong flash overlay */}
  </div>
</div>
```

Key measurements:
- **Card max width: `max-w-140` = 35rem = 560px.** Mobile-first single column.
- **Card padding: `p-6` (24px), `sm:p-7` (28px) at ≥640px.**
- Card surface = `.learn-card` → white, `border-radius: var(--r-card)` (30px), `box-shadow: var(--sh-lg)`.
- The body is a `flex flex-1 flex-col` — your content can center vertically (the current pronunciation card uses `items-center justify-center gap-4 text-center`).
- The footer (Check button while answering → reveal strip + Continue once graded) sits below your body with `mt-5`. See §5 of [learn_pronunciation_redesign_context.md](learn_pronunciation_redesign_context.md) for how the attempt commit flows through it.

---

## 4. Component atoms (verbatim CSS)

All from [globals.css](../../src/app/globals.css). These are the building blocks — reuse before inventing.

### 4.1 Type ramp

```css
.lr-word {
  font-family: var(--serif);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.02;
}
.lr-ipa {
  font-family: var(--serif);
  font-style: italic;
  font-weight: 400;
  color: var(--ink-2);
  white-space: nowrap;
}
.lr-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.lr-sentence {
  font-family: var(--serif);
  line-height: 1.5;
  color: var(--ink);
  letter-spacing: -0.005em;
  text-wrap: pretty;
}
```

Sizes come from markup, e.g. the pronunciation word is `.lr-word text-[48px]`, IPA `.lr-ipa text-[22px]`.

### 4.2 Audio orb (`.lr-orb`) — reference audio & "play my recording"

```css
.lr-orb {
  position: relative;
  width: 78px;
  height: 78px;
  border-radius: 999px;
  border: none;
  background: radial-gradient(120% 120% at 35% 25%, #2bd6a3, var(--primary) 70%);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow:
    var(--sh-primary),
    inset 0 2px 4px rgba(255, 255, 255, 0.35);
  transition: transform 0.14s;
  flex: 0 0 auto;
}
.lr-orb.violet {
  background: radial-gradient(120% 120% at 35% 25%, #a99bff, var(--violet) 70%);
  box-shadow:
    0 8px 18px -5px rgba(123, 108, 255, 0.55),
    inset 0 2px 4px rgba(255, 255, 255, 0.35);
}
.lr-orb:hover { transform: scale(1.05); }
.lr-orb:active { transform: scale(0.96); }
.lr-orb--sm { width: 54px; height: 54px; }
.lr-orb--lg { width: 104px; height: 104px; }
.lr-orb .ring {
  position: absolute;
  inset: -6px;
  border-radius: 999px;
  border: 2.5px solid var(--primary);
  opacity: 0;
}
.lr-orb.violet .ring { border-color: var(--violet); }
.lr-orb.playing .ring { animation: lr-ring 1.5s ease-out infinite; }
.lr-orb.playing .ring.r2 { animation-delay: 0.5s; }
.lr-orb:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 4px var(--primary-soft),
    var(--sh-primary);
}
```

Mint by default; `.violet` marks the listening family. Two concentric `.ring`s pulse while `.playing`. Sizes: sm 54 / default 78 / lg 104.

### 4.3 Mic button (`.lr-mic`) — record control

```css
.lr-mic {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(180deg, #fff, var(--card-2));
  box-shadow:
    var(--sh-md),
    inset 0 0 0 2px var(--line-2);
  color: var(--primary);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 0.14s,
    box-shadow 0.15s,
    color 0.15s;
}
.lr-mic:hover {
  transform: translateY(-2px);
  box-shadow:
    var(--sh-lg),
    inset 0 0 0 2px var(--primary-soft-2);
}
.lr-mic.recording {
  color: #fff;
  background: linear-gradient(180deg, #ff6b8a, var(--bad));
  box-shadow: 0 8px 20px -5px rgba(241, 69, 106, 0.5);
}
.lr-mic.recording .pulse { animation: lr-mic-pulse 1.3s ease-out infinite; }
.lr-mic .pulse {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 3px solid var(--bad);
  opacity: 0;
}
```

Idle = white orb with mint icon; `.recording` flips to a red gradient with a pulsing ring. 96×96.

### 4.4 Buttons (`.lr-btn`) — the footer commit lives here

```css
.lr-btn {
  font-family: inherit;
  font-weight: 700;
  border: none;
  cursor: pointer;
  border-radius: var(--r-chip);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  transition:
    transform 0.12s cubic-bezier(0.2, 0.8, 0.3, 1.4),
    box-shadow 0.15s, background 0.15s, color 0.15s, opacity 0.15s;
  user-select: none;
  white-space: nowrap;
}
.lr-btn:active { transform: translateY(1px) scale(0.985); }
.lr-btn:disabled { cursor: default; }

.lr-btn--primary {
  background: var(--primary);
  color: #fff;
  box-shadow: var(--sh-primary), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.lr-btn--primary:hover:not(:disabled) { background: #14c994; transform: translateY(-1px); }
.lr-btn--primary:disabled { background: var(--line-2); color: var(--ink-3); box-shadow: none; }

.lr-btn--amber {
  background: linear-gradient(180deg, var(--amber) 0%, var(--amber-2) 130%);
  color: #fff;
  box-shadow: var(--sh-amber), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.lr-btn--amber:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.04); }

.lr-btn--ghost {
  background: transparent;
  color: var(--ink-2);
  box-shadow: inset 0 0 0 1.5px var(--line-2);
}
.lr-btn--ghost:hover:not(:disabled) { background: var(--card-2); color: var(--ink); }

.lr-btn--soft { background: var(--primary-soft); color: var(--primary-ink); }
.lr-btn--soft:hover:not(:disabled) { background: var(--primary-soft-2); }

.lr-btn--lg { height: 60px; padding: 0 30px; font-size: 18px; }
.lr-btn--md { height: 48px; padding: 0 22px; font-size: 15.5px; }
.lr-btn--sm { height: 38px; padding: 0 16px; font-size: 14px; }
.lr-btn--block { width: 100%; }
.lr-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--card), 0 0 0 6px var(--primary);
}
```

House style: **primary = mint**, **Continue/commit = `--amber` gradient**, secondary = `--ghost`. The graded "Continue / Finish" footer button is `lr-btn lr-btn--amber lr-btn--lg lr-btn--block`.

### 4.5 Icon button (`.lr-icon-btn`) — e.g. exit, small actions

```css
.lr-icon-btn {
  width: 42px;
  height: 42px;
  border-radius: var(--r-chip);
  border: none;
  background: var(--card);
  color: var(--ink-2);
  box-shadow: var(--sh-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.12s, color 0.15s, background 0.15s, box-shadow 0.15s;
}
.lr-icon-btn:hover { color: var(--ink); transform: translateY(-1px); box-shadow: var(--sh-md); }
.lr-icon-btn:active { transform: translateY(0) scale(0.95); }
.lr-icon-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--learn-bg), 0 0 0 6px var(--primary);
}
```

### 4.6 Chips & pills

```css
/* hint chip — closest base for per-phoneme chips */
.lr-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px 7px 12px;
  border-radius: var(--r-chip);
  background: var(--card);
  border: 1.5px solid var(--line-2);
  color: var(--ink-2);
  font-weight: 600;
  font-size: 14px;
  box-shadow: var(--sh-sm);
}
.lr-chip--translation { background: var(--card-2); }

/* type label pill (top chrome) */
.lr-typepill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 14px 0 11px;
  border-radius: var(--r-chip);
  background: var(--card);
  box-shadow: var(--sh-sm);
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-2);
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.lr-typepill .dot { width: 8px; height: 8px; border-radius: 999px; background: var(--primary); }
.lr-typepill .dot.violet { background: var(--violet); }
.lr-typepill .dot.sky { background: var(--sky); }
.lr-typepill .dot.amber { background: var(--amber); }
```

> **Per-phoneme chips** (the result-state hero) don't exist yet. Build them on the `.lr-chip` footprint (pill, `--r-chip`, `--sh-sm`) but recolour by `label` using the §2 semantic map — fill `--ok-soft`/`--amber-soft`/`--bad-soft`, text `--ok-ink`/`--bad-ink`/etc., and show the IPA glyph + score number (colour must never be the only signal).

### 4.7 Typed input (`.lr-input`) — STT keyboard fallback

```css
.lr-input {
  font-weight: 600;
  font-size: 19px;
  color: var(--ink);
  background: var(--card);
  border: 2px solid var(--line-2);
  border-radius: var(--r-input);
  padding: 16px 18px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  box-shadow: var(--sh-sm);
}
.lr-input::placeholder { color: var(--ink-3); font-weight: 500; }
.lr-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
.lr-input.is-correct { border-color: var(--ok); background: var(--ok-soft); color: var(--ok-ink); }
.lr-input.is-wrong { border-color: var(--bad); background: var(--bad-soft); color: var(--bad-ink); }
```

### 4.8 Option tiles (`.lr-opt`) — choice questions (state patterns to mirror)

```css
.lr-opt {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  text-align: left;
  background: var(--card);
  border: 1.5px solid var(--line-2);
  border-radius: var(--r-tile);
  padding: 17px 18px;
  font-weight: 600;
  font-size: 17px;
  color: var(--ink);
  cursor: pointer;
  transition:
    transform 0.12s cubic-bezier(0.2, 0.8, 0.3, 1.2),
    border-color 0.15s, background 0.15s, box-shadow 0.15s;
  box-shadow: var(--sh-sm);
}
.lr-opt:hover:not(.is-disabled) { transform: translateY(-2px); border-color: var(--primary-soft-2); box-shadow: var(--sh-md); }
.lr-opt:active:not(.is-disabled) { transform: translateY(0) scale(0.99); }
.lr-opt:focus-visible { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
.lr-opt.is-selected { border-color: var(--primary); background: var(--primary-soft); }
.lr-opt.is-correct {
  border-color: var(--ok);
  background: var(--ok-soft);
  color: var(--ok-ink);
  box-shadow: 0 0 0 1px var(--ok), var(--sh-md);
}
.lr-opt.is-wrong { border-color: var(--bad); background: var(--bad-soft); color: var(--bad-ink); }
.lr-opt.is-muted { opacity: 0.55; }
.lr-opt.is-disabled { cursor: default; }
/* + .lr-opt-key (30px keycap), .lr-opt-mark (animated check/x). See globals.css. */
```

### 4.9 Progress, step dots, streak, skeleton, image tile

```css
.lr-progress { height: 12px; border-radius: 999px; background: var(--learn-field-2); overflow: hidden; box-shadow: inset 0 1px 2px rgba(16, 40, 32, 0.07); position: relative; }
.lr-progress > i { position: absolute; inset: 0 auto 0 0; border-radius: 999px; background: linear-gradient(90deg, var(--primary), #2bd6a3); box-shadow: 0 0 10px rgba(18, 189, 138, 0.4); transition: width 0.55s cubic-bezier(0.3, 0.9, 0.3, 1); }

.lr-steps { display: inline-flex; gap: 5px; align-items: center; }
.lr-steps > i { width: 7px; height: 7px; border-radius: 999px; background: var(--line-2); transition: all 0.3s; }
.lr-steps > i.done { background: var(--primary); }
.lr-steps > i.current { background: var(--primary); width: 18px; }

.lr-streak { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 13px 0 9px; border-radius: var(--r-chip); background: linear-gradient(180deg, #fff5e0, var(--amber-soft)); border: 1.5px solid #ffe1a8; color: #b5650c; font-weight: 800; font-size: 14px; box-shadow: var(--sh-sm); white-space: nowrap; }

.lr-sk { background: linear-gradient(90deg, var(--learn-field-2) 25%, #eef4f0 37%, var(--learn-field-2) 63%); background-size: 400% 100%; animation: lr-shimmer 1.4s ease-in-out infinite; border-radius: 12px; }

.lr-imgtile { border-radius: var(--r-tile); overflow: hidden; position: relative; background: linear-gradient(135deg, var(--primary-soft), var(--sky-soft)); display: grid; place-items: center; box-shadow: var(--sh-sm); }
```

The **"Scoring…" spinner** (state A′) can reuse `.lr-sk` shimmer over the record area, or a simple mint spinner; the loading skeleton in the runner already uses `.lr-sk` discs/bars.

---

## 5. Keyframes & motion helpers (verbatim)

```css
@keyframes lr-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
@keyframes lr-flicker { 0%,100% { transform: scale(1) rotate(-1deg); } 30% { transform: scale(1.08, 0.96) rotate(2deg); } 60% { transform: scale(0.96, 1.06) rotate(-2deg); } }
@keyframes lr-ring { 0% { opacity: 0.6; transform: scale(0.9); } 100% { opacity: 0; transform: scale(1.5); } }
@keyframes lr-mic-pulse { 0% { opacity: 0.55; transform: scale(1); } 100% { opacity: 0; transform: scale(1.6); } }
@keyframes lr-checkpop { 0% { transform: scale(0.5) rotate(-16deg); } 60% { transform: scale(1.14) rotate(4deg); } 100% { transform: scale(1) rotate(0); } }
@keyframes lr-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes lr-pop { 0% { transform: scale(0.86); } 60% { transform: scale(1.03); } 100% { transform: none; } }

/* learn-* card-level motion */
@keyframes learn-fadeUp { from { transform: translateY(10px); } to { transform: none; } }   /* .learn-anim-in: 0.34s cubic-bezier(0.2,0.8,0.2,1) */
@keyframes learn-pop { 0% { transform: scale(0.96); } 100% { transform: scale(1); } }
@keyframes learn-ring { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.7); opacity: 0; } }   /* listening orb ring */

/* helper classes */
.lr-pop { animation: lr-pop 0.4s cubic-bezier(0.2, 0.8, 0.3, 1.3) both; }
.lr-checkpop { animation: lr-checkpop 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.5) both; }
.lr-float { animation: lr-float 4s ease-in-out infinite; }
.lr-stagger > * { animation: learn-fadeUp 0.4s cubic-bezier(0.2, 0.7, 0.3, 1) both; }  /* children get +0.03s..+0.28s delays (nth-child 1–6) */
```

Correct/wrong feedback flash over the card (fired by the runner, not your card):

```css
.learn-flash { position: absolute; inset: 0; pointer-events: none; z-index: 4; border-radius: inherit; animation: learn-flashFade 0.85s ease-out forwards; }
.learn-flash--ok  { background: radial-gradient(circle at 50% 85%, color-mix(in oklab, var(--ok),  transparent 78%), transparent 60%); }
.learn-flash--bad { background: radial-gradient(circle at 50% 85%, color-mix(in oklab, var(--bad), transparent 80%), transparent 60%); animation: learn-flashFade 0.85s ease-out forwards, learn-flashShake 0.4s; }
```

Reduced motion (global, keep new motion compatible):

```css
@media (prefers-reduced-motion: reduce) {
  .learn-shell *, .learn-confetti__bit {
    animation-duration: 0.001s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001s !important;
  }
}
```

---

## 6. Mapping the pronunciation card to these atoms

| Card element (from the brief) | Use |
|---|---|
| Eyebrow ("Say the word") | `.lr-eyebrow` |
| Target word | `.lr-word` (e.g. `text-[48px]`) |
| IPA row | `.lr-ipa` (e.g. `text-[22px]`), hide if `ipa` null & honour `settings.showPhonetic` |
| Reference-audio play | `.lr-orb` (mint) |
| "Play my recording" | `.lr-orb` again (distinguish by icon or `--sm`/tone) |
| Record control | `.lr-mic` (+ `.recording`, `.pulse`) |
| Scoring spinner | `.lr-sk` shimmer / mint spinner |
| Overall score gauge | new — colour by band via §2 map; reuse `.lr-progress` shell for a bar if a bar fits |
| Per-phoneme chips | new on `.lr-chip` base, recoloured by `label` (§2) |
| Audio-quality warning | `.lr-chip` on `--amber-soft`/`--bad-soft`, or inline `text-(--bad-ink)` |
| Try again | `.lr-btn--ghost` or `.lr-btn--soft` (card body) |
| Continue / commit | `.lr-btn--amber .lr-btn--lg .lr-btn--block` (shell **footer**, not the card body — see brief §5) |
| Keyboard fallback input | `.lr-input` |

Anything not covered here, read straight from [globals.css](../../src/app/globals.css) — it's the source of truth.
