# Sprout design-system reference (standalone, upload-ready)

The real design tokens, fonts, and component CSS that the Sprout app UI is built from, copied
**verbatim from source** so a design pass matches it pixel-for-pixel. This is the **self-contained**
version: no links to repo source files, no `/learn`-only card scaffold. Attach this alongside a
feature brief (e.g. the "pick words to practise" context) when a design tool asks for the
**`sprout_design_system_reference`** the brief points to.

> **Scope.** Everything below is declared on **`.app-shell`** (the authenticated app root) and
> shared with `.marketing-shell`. The same token block also powers `.learn-shell` (the learn
> session), so any `.lr-*` atom renders identically across `/practice`, `/learn`, and the home.
> **Light theme only — there is no dark variant.** `prefers-reduced-motion` is honoured globally
> (see §6); keep any new motion inside that contract.

---

## 1. Fonts

Two families, loaded via `next/font/google` (subsets `latin` + `vietnamese`):

- **Plus Jakarta Sans** (`--font-jakarta`) — all UI text, labels, buttons, counters. Weights
  400 / 500 / 600 / 700 / 800.
- **Newsreader** (`--font-newsreader`, exposed as `--serif`) — the **word** (`.lr-word`), **IPA**
  (`.lr-ipa`, *italic*), and example sentences (`.lr-sentence`). Weights 400 / 500 / 600,
  normal + italic.

```css
/* body / UI text */
font-family: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
/* serif — the word, IPA, sentences */
--serif: var(--font-newsreader), ui-serif, Georgia, serif;
```

Numbers always use tabular figures: `.tnum { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }`.

---

## 2. Tokens (verbatim from the `.app-shell` block)

These shadow the shadcn tokens locally, so reused primitives (Button, Badge, Input, Checkbox,
Progress…) pick up the mint accent automatically.

```css
.app-shell,
.marketing-shell {
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

  /* brand core + surface */
  --app-bg: #eaf1ed;
  --surface: #ffffff;
  --card-2: #f6faf8;
  --primary-press: #0ca576;
  --primary-ink: #07684b;
  --primary-soft: #e0f6ee;
  --primary-soft-2: #c8eede;

  /* ink + lines */
  --ink: #15241e;
  --ink-2: #5b6b64;
  --ink-3: #91a09a;
  --line: #e9efeb;
  --line-2: #dde6e1;

  /* gamification accents (colour means something — §2.1) */
  --amber: #ffb020;
  --amber-2: #ff7a1a;
  --amber-soft: #fff0d4;
  --violet: #7b6cff;
  --violet-soft: #ece9ff;
  --sky: #1f9fd1;
  --sky-soft: #e0f1fa;

  /* semantic — the SCORE band scale (good / practice / wrong) */
  --ok: #11a368;   --ok-soft: #dcf4e7;   --ok-ink: #0a6e44;
  --bad: #f1456a;  --bad-soft: #fde4ea;  --bad-ink: #b51f42;
  /* warn — the publish-privacy honesty accent */
  --warn: #d98a23; --warn-soft: #fbf0dd; --warn-ink: #7a4d0c;

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

  --serif: var(--font-newsreader), ui-serif, Georgia, serif;
  color: var(--ink);
  font-family: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
}

/* page field — the branded canvas (a soft mint glow over the field colour) */
.app-field {
  background:
    radial-gradient(120% 80% at 50% -10%, rgba(18, 189, 138, 0.07), transparent 60%),
    var(--app-bg);
}
```

### 2.1 The one colour rule — what each family means

| Family | Tokens | Means |
|---|---|---|
| **Mint** (brand) | `--primary` / `--primary-soft` / `--primary-ink` | chrome, primary actions, selection, "go". |
| **Score band — good** | `--ok` / `--ok-soft` / `--ok-ink` | a score **≥75** (green). |
| **Score band — practice** | `--amber` / `--amber-soft` / `--amber-2` | a score **45–74** (amber). |
| **Score band — wrong** | `--bad` / `--bad-soft` / `--bad-ink` | a score **<45** (red). |
| **Warn** | `--warn` / `--warn-soft` / `--warn-ink` | privacy / honesty notices (e.g. publish). |
| **Section accents** | `--sky` (practice/info), `--violet` (social/listening) | categorical tints; never a score. |

**Hard rules:** the **band scale (green/amber/red) is reserved for scores.** On surfaces with no
scores (e.g. picking words), don't use band colours at all. `cefr` and part-of-speech are
**categorical** — neutral chips, never band colours. **Colour is never the only signal** — always
pair it with a number, label, or icon.

---

## 3. Card & surface scaffold

The app's single card family — use it for panels, list containers, and queue cards:

```css
.lr-card {
  background: var(--surface);
  border-radius: var(--r-card);   /* 30px */
  border: 1px solid var(--line);
  box-shadow: var(--sh-md);
}
.hoverlift { transition: transform .18s ease, box-shadow .2s ease, border-color .18s; }
.hoverlift:hover {
  transform: translateY(-3px);
  box-shadow: var(--sh-lg);
  border-color: var(--primary-soft-2);
}
```

- One radius system: cards `--r-card` (30), tiles `--r-tile` (18), inputs `--r-input` (16),
  pills/buttons `--r-chip` (999). Don't mix radii outside this set.
- Tinted shadows only (`--sh-*`); never pure-black drop shadows.
- Containers cap their width and center; the app body is mobile-first single-column.

---

## 4. Component atoms (verbatim CSS — reuse before inventing)

### 4.1 Type ramp

```css
.lr-word    { font-family: var(--serif); font-weight: 500; letter-spacing: -0.01em; line-height: 1.02; }
.lr-ipa     { font-family: var(--serif); font-style: italic; font-weight: 400; color: var(--ink-2); white-space: nowrap; }
.lr-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.lr-sentence{ font-family: var(--serif); line-height: 1.5; color: var(--ink); letter-spacing: -0.005em; text-wrap: pretty; }
```

Sizes come from markup, e.g. a big word is `.lr-word text-[40px]`, IPA `.lr-ipa text-[20px]`.
**Ration eyebrows** — at most one per surface; most product screens need none.

### 4.2 Buttons (`.lr-btn`)

```css
.lr-btn {
  font-family: inherit; font-weight: 700; border: none; cursor: pointer;
  border-radius: var(--r-chip);
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  transition: transform .12s cubic-bezier(.2,.8,.3,1.4), box-shadow .15s, background .15s, color .15s, opacity .15s;
  user-select: none; white-space: nowrap;
}
.lr-btn:active { transform: translateY(1px) scale(.985); }
.lr-btn:disabled { cursor: default; }

.lr-btn--primary { background: var(--primary); color: #fff; box-shadow: var(--sh-primary), inset 0 1px 0 rgba(255,255,255,.25); }
.lr-btn--primary:hover:not(:disabled) { background: #14c994; transform: translateY(-1px); }
.lr-btn--primary:disabled { background: var(--line-2); color: var(--ink-3); box-shadow: none; }

.lr-btn--amber { background: linear-gradient(180deg, var(--amber) 0%, var(--amber-2) 130%); color: #fff; box-shadow: var(--sh-amber), inset 0 1px 0 rgba(255,255,255,.3); }
.lr-btn--amber:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.04); }

.lr-btn--ghost { background: transparent; color: var(--ink-2); box-shadow: inset 0 0 0 1.5px var(--line-2); }
.lr-btn--ghost:hover:not(:disabled) { background: var(--card-2); color: var(--ink); }

.lr-btn--soft { background: var(--primary-soft); color: var(--primary-ink); }
.lr-btn--soft:hover:not(:disabled) { background: var(--primary-soft-2); }

.lr-btn--lg { height: 60px; padding: 0 30px; font-size: 18px; }
.lr-btn--md { height: 48px; padding: 0 22px; font-size: 15.5px; }
.lr-btn--sm { height: 38px; padding: 0 16px; font-size: 14px; }
.lr-btn--block { width: 100%; }
.lr-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--card), 0 0 0 6px var(--primary); }
```

House style: **one primary `--primary` mint button per surface**; `--amber` gradient = a
commit/celebrate moment; `--ghost` / `--soft` = secondary. Never two competing primaries.

### 4.3 Chips & pills

```css
.lr-chip {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 14px 7px 12px; border-radius: var(--r-chip);
  background: var(--card); border: 1.5px solid var(--line-2);
  color: var(--ink-2); font-weight: 600; font-size: 14px; box-shadow: var(--sh-sm);
}
.lr-chip--translation { background: var(--card-2); }

/* small label pill with a status dot */
.lr-typepill {
  display: inline-flex; align-items: center; gap: 8px; height: 32px;
  padding: 0 14px 0 11px; border-radius: var(--r-chip);
  background: var(--card); box-shadow: var(--sh-sm);
  font-size: 13px; font-weight: 700; color: var(--ink-2); letter-spacing: -.01em; white-space: nowrap;
}
.lr-typepill .dot { width: 8px; height: 8px; border-radius: 999px; background: var(--primary); }
.lr-typepill .dot.violet { background: var(--violet); }
.lr-typepill .dot.sky { background: var(--sky); }
.lr-typepill .dot.amber { background: var(--amber); }
```

Use `.lr-chip` (neutral) for part-of-speech, counts, and removable queue tags. Don't sprinkle the
coloured `.dot` decoratively — only when it carries real meaning.

### 4.4 Input (`.lr-input`) — text fields & search

```css
.lr-input {
  font-weight: 600; font-size: 19px; color: var(--ink);
  background: var(--card); border: 2px solid var(--line-2); border-radius: var(--r-input);
  padding: 16px 18px; width: 100%; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s; box-shadow: var(--sh-sm);
}
.lr-input::placeholder { color: var(--ink-3); font-weight: 500; }
.lr-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
.lr-input.is-correct { border-color: var(--ok); background: var(--ok-soft); color: var(--ok-ink); }
.lr-input.is-wrong   { border-color: var(--bad); background: var(--bad-soft); color: var(--bad-ink); }
```

Label **above** the input; placeholder is never the label. For a search field, drop the font-size to
~15px and pair with a leading icon.

### 4.5 Selectable row / tile (`.lr-opt`) — the pattern for a checkbox list

There's no dedicated checkbox-list atom; the app builds selectable lists on the `.lr-opt` tile, whose
**state styling is the canonical pattern to mirror** (idle → hover → selected). For a hand-pick list,
compose a tight row from this: a checkbox, the `lemma`, a one-line gloss, and a part-of-speech chip.

```css
.lr-opt {
  position: relative; display: flex; align-items: center; gap: 14px; width: 100%;
  text-align: left; background: var(--card); border: 1.5px solid var(--line-2);
  border-radius: var(--r-tile); padding: 17px 18px;
  font-weight: 600; font-size: 17px; color: var(--ink); cursor: pointer;
  transition: transform .12s cubic-bezier(.2,.8,.3,1.2), border-color .15s, background .15s, box-shadow .15s;
  box-shadow: var(--sh-sm);
}
.lr-opt:hover:not(.is-disabled) { transform: translateY(-2px); border-color: var(--primary-soft-2); box-shadow: var(--sh-md); }
.lr-opt:active:not(.is-disabled) { transform: translateY(0) scale(.99); }
.lr-opt:focus-visible { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
.lr-opt.is-selected { border-color: var(--primary); background: var(--primary-soft); }   /* ← ticked row */
.lr-opt.is-muted { opacity: .55; }
.lr-opt.is-disabled { cursor: default; }
```

> For a **dense** multi-select list (many words), prefer a flatter row: lose the per-row lift and
> shadow, separate rows with a single `1px solid var(--line)` divider, and reserve the
> `.is-selected` mint fill (`--primary-soft` + `--primary` border) for the ticked state. The shadcn
> **Checkbox** and **Input** primitives already inherit `--primary` / `--ring` here, so they read as
> mint without extra work.

### 4.6 Audio orb (`.lr-orb`) — "hear it"

```css
.lr-orb {
  position: relative; width: 78px; height: 78px; border-radius: 999px; border: none;
  background: radial-gradient(120% 120% at 35% 25%, #2bd6a3, var(--primary) 70%); color: #fff;
  display: grid; place-items: center; cursor: pointer;
  box-shadow: var(--sh-primary), inset 0 2px 4px rgba(255,255,255,.35); transition: transform .14s; flex: 0 0 auto;
}
.lr-orb:hover { transform: scale(1.05); }
.lr-orb:active { transform: scale(.96); }
.lr-orb--sm { width: 54px; height: 54px; }
.lr-orb--lg { width: 104px; height: 104px; }
.lr-orb .ring { position: absolute; inset: -6px; border-radius: 999px; border: 2.5px solid var(--primary); opacity: 0; }
.lr-orb.playing .ring { animation: lr-ring 1.5s ease-out infinite; }
.lr-orb.playing .ring.r2 { animation-delay: .5s; }
.lr-orb:focus-visible { outline: none; box-shadow: 0 0 0 4px var(--primary-soft), var(--sh-primary); }
```

Use `--sm` (54px) for an inline "hear this word" control in a list/queue. Mint by default.

### 4.7 Progress bar & skeleton

```css
.lr-progress { height: 12px; border-radius: 999px; background: #e2ebe6; overflow: hidden; box-shadow: inset 0 1px 2px rgba(16,40,32,.07); position: relative; }
.lr-progress > i { position: absolute; inset: 0 auto 0 0; border-radius: 999px;
  background: linear-gradient(90deg, var(--primary), #2bd6a3); box-shadow: 0 0 10px rgba(18,189,138,.4);
  transition: width .55s cubic-bezier(.3,.9,.3,1); }

/* shimmer placeholder — shape it like the final content, not a spinner */
.lr-sk { background: linear-gradient(90deg, #e2ebe6 25%, #eef4f0 37%, #e2ebe6 63%);
  background-size: 400% 100%; animation: lr-shimmer 1.4s ease-in-out infinite; border-radius: 12px; }
```

### 4.8 Small step dots (`.lr-steps`) — e.g. "word 3 of 8" in a queue runner

```css
.lr-steps { display: inline-flex; gap: 5px; align-items: center; }
.lr-steps > i { width: 7px; height: 7px; border-radius: 999px; background: var(--line-2); transition: all .3s; }
.lr-steps > i.done { background: var(--primary); }
.lr-steps > i.current { background: var(--primary); width: 18px; }
```

---

## 5. Consuming tokens in markup (Tailwind v4 arbitrary syntax)

Tokens are plain CSS variables, **not** Tailwind theme colours. In JSX, read them either through the
component classes above or with Tailwind v4 arbitrary syntax:

```html
<span class="text-(--ink-2)">muted label</span>
<div class="bg-(--primary-soft) text-(--primary-ink) rounded-(--r-tile)">soft mint tile</div>
<p class="tnum">8 words</p>
```

---

## 6. Motion & reduced-motion (verbatim)

```css
@keyframes lr-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
@keyframes lr-ring    { 0% { opacity: .6; transform: scale(.9); } 100% { opacity: 0; transform: scale(1.5); } }
@keyframes lr-pop     { 0% { transform: scale(.86); } 60% { transform: scale(1.03); } 100% { transform: none; } }
@keyframes lr-float   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
.lr-pop   { animation: lr-pop .4s cubic-bezier(.2,.8,.3,1.3) both; }
.lr-float { animation: lr-float 4s ease-in-out infinite; }

/* global — honour it for any new motion */
@media (prefers-reduced-motion: reduce) {
  .app-shell *, .marketing-shell * {
    animation-duration: .001s !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001s !important;
  }
}
```

Animate `transform` / `opacity` only; entry motion is subtle (a 10px fade-up over ~0.34s). Keep the
overall motion intensity low on product surfaces.

---

## 7. Quick do / don't

- **Do** build on the `.lr-*` atoms and the tokens above; they already resolve under `.app-shell`.
- **Do** keep one primary mint action per surface; secondaries are `--ghost` / `--soft`.
- **Do** use `.lr-sk` shaped like the final content for loading; compose real empty/error states.
- **Don't** use the band scale (green/amber/red) for anything that isn't a score.
- **Don't** invent new hues, radii, or shadows; don't add decorative status dots.
- **Don't** design a dark variant. Light theme only.
- **Don't** use em-dashes in any visible copy; use a regular hyphen.
