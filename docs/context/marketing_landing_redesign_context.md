# Design context — Marketing landing redesign (`/` before login), colorful & brand-forward

A self-contained brief for **rebuilding the logged-out marketing landing** — the page an
**unauthenticated** visitor sees at the root route `/` before they sign in. This is a
**brand-forward re-skin + layout pass**: the routing, copy structure, and Server-Component
composition stay; the **look changes from cold neutral greyscale to a colorful, alive version
of the app's real Sprout mint identity**.

> **The problem, stated plainly.** The landing today is **boring and gray**. It runs on the bare
> shadcn neutral theme — a white/`oklch` greyscale field, a **black** primary button, `bg-muted`
> grey feature tiles, a black `bg-foreground` final-CTA band, and the default Geist font. It looks
> like an unstyled component demo, not a product. Meanwhile the moment a visitor signs in, the app
> **bursts into mint** (`/learn`, `/dashboard`, and now the auth screens all run the Sprout system).
> That seam — *cold gray storefront → warm colorful product* — is exactly what this redesign
> removes. **The storefront should sell the product it actually is.**
>
> **"Ignore the gray, bring the color."** Drop the cold neutral greyscale as the *identity*: no
> blank-white field, no black CTA, no black CTA band, no `text-muted-foreground` cold grey as the
> default ink, no `bg-muted` grey tiles. Replace it with the **branded mint field, mint/colored
> CTAs, the warm Sprout inks** (`--ink`, `--ink-2`, `--ink-3`), and — because this is a marketing
> page, not a focused auth card — the **full Sprout accent palette** (amber / violet / sky) used
> with intent. Color should feel **energetic and inviting**.
>
> **Light theme only.** Like `/learn`, `/dashboard`, and the auth screens, the Sprout system is a
> single, fully art-directed light theme. **Do not design a dark variant.**

> **Source of truth for the brand system** (tokens, type, atoms, verbatim CSS):
> [sprout_design_system_reference.md](sprout_design_system_reference.md) — if that doc or the live
> CSS disagrees with this brief, **the live CSS wins**.
> **Sibling precedent (read it):** [auth_redesign_design_context.md](auth_redesign_design_context.md)
> — the *other* unauthenticated surface, redesigned from the same cold-gray shadcn default to
> Sprout. Same "drop the gray, adopt Sprout" job; this brief is the louder, marketing-page cousin.
> The Sprout tokens live verbatim in [globals.css](../../src/app/globals.css).

---

## 0. Taste pass — read first (this is a landing page, so the dials run loud)

The auth brief deliberately ran *calm* (single mint accent, dials 3/3/3) because a sign-in card is
one focused task. **This is the opposite case.** A marketing landing is a sales surface: it should
have hero scale, narrative rhythm, color variety, and scroll motion. The auth doc's "calm" dials
**do not apply here** — set them high.

### 0.1 Design read & mode

> **Reading this as:** the top-of-funnel marketing landing for an existing language-learning app
> ("Vocab"), targeting first-time visitors deciding whether to sign up. Warm **Sprout-mint** product
> language, built on the in-repo Sprout design system (Tailwind v4 CSS-variable tokens + shadcn/ui
> primitives). **Mode: Redesign → Preserve the brand, amplify the expression** — the visual
> language already exists and is locked (Sprout); we re-skin the gray landing onto it and **turn the
> energy up** for a marketing context. We do **not** invent a new palette or a new font.

Because the brand is already audited and documented
([sprout_design_system_reference.md](sprout_design_system_reference.md)), the palette/type/radii/
shadow/motion audit is done. **Do not extract or re-derive a palette — adopt Sprout, then use more
of it than the product UI does.**

### 0.2 Dials (loud — this is a landing page, not product chrome)

| Dial | Value | Why |
|---|---|---|
| **DESIGN_VARIANCE** | **7–8** | Sections should not all be the same centered-text-then-grid block. Vary layout: asymmetric hero, alternating bands, a colorful showcase, an inverted/gradient CTA band. Break the current "every section is `max-w-6xl` left-aligned heading + grid" monotony. |
| **MOTION_INTENSITY** | **5–6** | Scroll-reveal on sections, a gentle hero entrance, hover lift on cards (`.hoverlift` already exists), a floating ornament. Tasteful, not a circus. **Must honor `prefers-reduced-motion`** (the global `.app-shell`/`.learn-shell` rule covers scoped subtrees — see §6). |
| **VISUAL_DENSITY** | **5** | More generous and confident than the current thin layout, but a landing can hold more than an auth card. Big hero type, real whitespace, then denser proof sections. |

### 0.3 Locks (audit every section against these before shipping)

- **Color lock — mint is the brand; accents have meaning, not decoration.** `--primary` mint is the
  hero/CTA color and the through-line. The **amber / violet / sky** accents may appear here (unlike
  the auth card, which forbade them) because a landing page *describes* the product features those
  colors stand for — but tie each accent to the thing it means in-product where possible:
  **amber = streaks/goals/gamification**, **violet = listening/community**, **sky = activity/topics**.
  Don't scatter random rainbow color for its own sake. The semantic **error** family (`--bad`) does
  not appear on a marketing page.
- **Shape lock — one radius system.** Cards `--r-card` (30px), tiles `--r-tile` (18px), chips/pills
  `--r-chip` (full). Pick from the Sprout radii; don't introduce new corner sizes.
- **Theme lock — light only.** One light theme top to bottom; no section authors a dark variant. The
  final-CTA band may *invert to a saturated mint/colored gradient* (see §3) — that is a colorful band,
  **not** a dark theme.
- **Type lock — Sprout's two faces only.** Plus Jakarta Sans (UI/body) + Newsreader serif (display
  moments). No third font. The current Geist default is retired here once the scope loads the Sprout
  fonts (§5).

### 0.4 Taste guardrails (the AI-tells to avoid)

- **Zero em-dashes in shipped UI copy** (non-negotiable). Headlines, body, button labels, captions:
  use a period, comma, colon, or plain hyphen (`-`). *(This internal doc still uses em-dashes for
  readability; the rule is about rendered strings.)*
- **No decorative status dots / no fake social proof.** Don't invent "Trusted by 10,000 learners,"
  fake logos, fake testimonials, fake star ratings, or invented user counts — there's no real data to
  cite pre-login, and fabricated proof is a hard fail. The illustrative catalog (topic tags, the
  3 sample decks in [showcase.tsx](../../src/components/marketing/showcase.tsx)) is fine **because it's
  honestly representative** of the real catalog, not a fabricated metric. Keep it clearly a "taste of
  the catalog," not a claim.
- **No generic stock-art hero.** The product visual is the **`SampleQuestionCard`** (a real mock of
  the core `cloze_mcq` mechanic, [sample-question-card.tsx](../../src/components/marketing/sample-question-card.tsx)).
  Keep that as the hero asset and make it *colorful* (mint correct-state, see §3) — it's far stronger
  than a stock illustration because it shows the actual product.
- **Icons stay `lucide-react`.** The project already depends on it across the marketing components
  (`SparklesIcon`, `ArrowRightIcon`, `FlameIcon`, `LayersIcon`, `MessagesSquareIcon`, `RefreshCwIcon`,
  `Volume2Icon`, `CheckIcon`). Do **not** introduce a second icon family — one family per project.
- **Contrast (a11y, mandatory).** White label on mint `--primary` (#12bd8a) is borderline for AA on
  small text; CTA labels are large + bold so they clear the large-text bar — keep them bold/large, or
  deepen to `--primary-press` (#0ca576) for any smaller mint control. Body text uses `--ink`/`--ink-2`;
  **never `--ink-3` (#91a09a) for essential reading text** (placeholders/eyebrows only).

---

## 1. The big picture (what we're building)

One scrolling page, fully unauthenticated, that is the **first impression** of the product and right
now undersells it. The job:

1. **Make the storefront feel like the product.** Mint field, warm ink, soft-shadowed rounded cards,
   the Sprout atoms and accents. A visitor should feel the brand *before* they ever click "Get
   started" — the cold gray-to-mint seam disappears.
2. **Sell the one idea, with color and motion.** The product's thesis is "learn words **in context**,
   scheduled by spaced repetition." Lead with the real sample question, prove the loop in three steps,
   show the catalog, close with a confident colored CTA.
3. **Keep it cheap and cacheable.** The landing is currently **all Server Components, zero client JS**
   (see [landing.tsx](../../src/components/marketing/landing.tsx) docstring). Preserve that where
   possible; if scroll-motion needs interactivity, isolate it to a small client island (§6) — don't
   turn the whole page into a client tree.

The spine, one sentence:

> **Land on something that already feels like the product → see the actual in-context question →
> understand the 3-step loop → glimpse the catalog → sign up — all wrapped in the colorful Sprout
> brand.**

### Files in scope (restyle these — don't rebuild the composition)

| File | Role | Today (retire the gray) |
|---|---|---|
| [page.tsx](../../src/app/page.tsx) | Root route; redirects logged-in users, else renders `<Landing/>` | Runs under the neutral root layout — **needs the Sprout brand scope + fonts** (§5) |
| [landing.tsx](../../src/components/marketing/landing.tsx) | Composes all sections | All-RSC wrapper; apply the brand scope class here |
| [landing-header.tsx](../../src/components/marketing/landing-header.tsx) | Sticky top bar: `BrandMark` + Log in / Get started | `bg-background/80` + `border-border/60` greys; black "Get started" button |
| [hero.tsx](../../src/components/marketing/hero.tsx) | Above-the-fold: headline, CTAs, sample card | Grey eyebrow pill, black CTA, `text-muted-foreground` body |
| [sample-question-card.tsx](../../src/components/marketing/sample-question-card.tsx) | The product visual (mock `cloze_mcq`) | Correct answer is **black** `bg-foreground`; whole card is greyscale |
| [how-it-works.tsx](../../src/components/marketing/how-it-works.tsx) | 3-step loop explainer | `bg-muted/30` band; black numbered circles (`bg-foreground`) |
| [features.tsx](../../src/components/marketing/features.tsx) | 4-up pillar grid | `bg-muted` grey icon chips; flat neutral cards |
| [showcase.tsx](../../src/components/marketing/showcase.tsx) | Topic tags + 3 sample decks | `bg-muted/30` band; grey tag pills; grey level badges |
| [final-cta.tsx](../../src/components/marketing/final-cta.tsx) | Closing conversion band | **Black** `bg-foreground` band with a white button — the loudest gray offender |
| [landing-footer.tsx](../../src/components/marketing/landing-footer.tsx) | Minimal footer | `border-border/60` + `text-muted-foreground` greys |
| [brand-mark.tsx](../../src/components/brand-mark.tsx) | The "V" lockup | Already `bg-primary` — **inherits mint automatically once the scope is applied** (§5); no change needed |

> **Out of scope:** the authenticated app, auth screens, and `/admin` — don't touch them. The
> `getMe()` redirect logic in [page.tsx](../../src/app/page.tsx) is frozen (visual/layout only).

---

## 2. Brand & color system (adopt Sprout — then use more of it)

Every section adopts the **Sprout mint identity** — the exact tokens powering `/learn`,
`/dashboard`, and the auth screens. All tokens below are **verbatim from the live system**
([sprout_design_system_reference.md §2](sprout_design_system_reference.md), sourced from
[globals.css](../../src/app/globals.css)). **Design against these — don't invent hues, don't fall
back to cold shadcn greys.**

### 2.1 Palette (light only)

```css
/* brand core */
--primary:        #12bd8a;   /* mint — the brand. hero, primary CTAs, links, correct-state */
--primary-press:  #0ca576;
--primary-ink:    #07684b;   /* deep mint — text on soft mint, branded links/labels */
--primary-soft:   #e0f6ee;   /* mint tint — soft fills, chips, hover */
--primary-soft-2: #c8eede;

/* surfaces + WARM ink (this replaces the cold greyscale) */
--app-bg:    #eaf1ed;        /* the page field — NOT white */
--surface:   #ffffff;        /* cards */
--card-2:    #f6faf8;        /* sunken / secondary fill */
--ink:       #15241e;        /* primary text — warm near-black, not #000 */
--ink-2:     #5b6b64;        /* secondary text — warm, replaces text-muted-foreground */
--ink-3:     #91a09a;        /* muted / eyebrows / placeholders only */
--line:      #e9efeb;
--line-2:    #dde6e1;        /* borders — warm, replaces cold neutral border */

/* personality accents — USE THESE here (a landing can, the auth card couldn't) */
--amber:  #ffb020;  --amber-2: #ff7a1a;  --amber-soft: #fff0d4;   /* streaks / goals / gamification */
--violet: #7b6cff;  --violet-soft: #ece9ff;                       /* listening / community */
--sky:    #1f9fd1;  --sky-soft:    #e0f1fa;                       /* activity / topics */

/* semantic correct-state (the sample card's right answer) */
--ok:  #11a368;  --ok-soft:  #dcf4e7;  --ok-ink:  #0a6e44;
```

**The "no gray" rule, concretely:**

| Old (cold, retire) | New (warm/colorful Sprout) |
|---|---|
| `bg-background` blank white field | mint field — `--app-bg` + the soft-mint glow (§2.2) |
| black primary button (`bg-primary` = `oklch(0.205 0 0)`) | **mint** CTA (`--primary`) with `--sh-primary` glow |
| black `bg-foreground` final-CTA band | a **saturated mint→sky/violet gradient** band (§3 FinalCta) |
| `bg-muted` grey feature icon chips | colored soft chips — `--primary-soft`, `--amber-soft`, `--violet-soft`, `--sky-soft` (one per pillar) |
| `text-muted-foreground` (cold grey) | `--ink-2` / `--ink-3` (warm Sprout ink) |
| grey topic-tag pills / grey deck level badges | mint/colored chips (`.lr-chip` family, the `.lr-chip--mint/violet/amber/sky` variants already exist) |
| black correct-answer tile in sample card | mint **correct** state (`.lr-opt.is-correct` → `--ok`, or mint `--primary`) |
| neutral `border-border/60` | warm `--line` / `--line-2` |

### 2.2 Page field & section bands (brand them — don't leave them flat white/grey)

The page background is the Sprout field, not white; the alternating section bands are warm/colored
washes, not `bg-muted/30` grey. Reuse the verbatim gradients from
[globals.css](../../src/app/globals.css):

```css
/* page field (apply to the marketing scope root — the .app-field equivalent) */
background:
  radial-gradient(120% 80% at 50% -10%, rgba(18,189,138,0.07), transparent 60%),
  var(--app-bg);

/* hero / colored band wash (reuse .hero-band — mint → sky) */
background:
  radial-gradient(120% 120% at 0% 0%,   rgba(18,189,138,0.14), transparent 55%),
  radial-gradient(120% 120% at 100% 0%, rgba(31,159,209,0.12), transparent 55%),
  var(--surface);
```

A soft floating **mint/sky ornament** behind the hero is welcome for energy (the auth screens
already ship one — `.auth-ornament` + `auth-float`, or `.lr-float`). One or two at most, decorative,
`pointer-events:none`, and they **must** honor `prefers-reduced-motion`.

### 2.3 Type

- **Plus Jakarta Sans** (`--font-jakarta`) — all UI text, body, labels, buttons. Weights 400–800.
- **Newsreader serif** (`--serif`) — the **display moments**: the hero headline and section
  headings. The serif is what makes the page feel *crafted* (it's the app-wide display face for words
  and numbers). It is **not** Fraunces/Instrument_Serif (the banned AI-default serifs) — it's the
  project's real brand serif, so using it is justified, not a default-reach. Body stays Jakarta.
- Eyebrows / section labels use `.lr-eyebrow` (12px, 700, `0.12em` tracking, uppercase, `--ink-3`) —
  ration them; not every section needs an eyebrow.

> **Engineer note on fonts:** Jakarta + Newsreader are loaded **scoped** to the `(app)`, `(auth)`,
> and `/learn` subtrees, not at root. The marketing page is at root and currently renders in **Geist**.
> To get the Sprout faces, load the same `next/font/google` families and expose
> `--font-jakarta` / `--font-newsreader` on the marketing scope (§5). Without this the serif headline
> falls back to the default sans and the page reads less crafted — **prefer wiring it**.

### 2.4 Radii, shadows, motion

```css
--r-card: 30px;   --r-tile: 18px;   --r-chip: 999px;   --r-input: 16px;

--sh-sm: 0 1px 2px rgba(16,40,32,.05), 0 2px 6px rgba(16,40,32,.04);
--sh-md: 0 2px 6px rgba(16,40,32,.05), 0 14px 30px -10px rgba(16,40,32,.14);
--sh-lg: 0 10px 26px -8px rgba(16,40,32,.12), 0 34px 64px -22px rgba(16,40,32,.2);
--sh-primary: 0 8px 18px -5px rgba(18,189,138,.5);   /* mint CTA glow */
--sh-amber:   0 8px 18px -5px rgba(255,140,30,.5);   /* amber CTA glow */
```

**Reuse the Sprout atoms instead of inventing:** `.lr-btn` (CTAs), `.lr-card` + `.hoverlift` (the
feature/deck cards), `.lr-chip` / `.lr-chip--mint/violet/amber/sky` (topic tags, badges), `.lr-opt`
+ `.is-correct`/`.is-selected` (the sample card options), `.lr-progress` (any stat bar). Verbatim CSS
for every atom in [sprout_design_system_reference.md §4](sprout_design_system_reference.md).
**Reuse before inventing.**

---

## 3. Section-by-section guidance

Keep the **section order and the copy intent**; restyle each onto Sprout and raise the variance so
the page stops feeling like one repeated block. (Exact words can be tightened, but don't invent
fake claims — §0.4.)

### Header — [landing-header.tsx](../../src/components/marketing/landing-header.tsx)
Sticky, but warm: field-tinted translucent bar (`--surface`/`--app-bg` + backdrop blur), warm
`--line` bottom border. `BrandMark` already goes mint under the scope. "Get started" = **mint**
`.lr-btn--primary` (or `.lr-btn--sm`); "Log in" = `.lr-btn--ghost`. No black, no cold grey border.

### Hero — [hero.tsx](../../src/components/marketing/hero.tsx) + the sample card
The energy moment. Keep the asymmetric two-column split (copy left, product visual right) but make it
sing:
- Eyebrow pill ("Vocabulary, in context") on `--primary-soft` / `--primary-ink`, not the grey
  `bg-muted/50`. The `SparklesIcon` in mint.
- Headline in **Newsreader serif**, big (`text-5xl`/`6xl`), `--ink`. Consider a mint highlight on the
  key phrase ("in context") via `.lr-mark` or a `--primary` color span.
- Primary CTA "Get started free" = mint `.lr-btn--primary` `--lg` with the `--sh-primary` glow +
  `ArrowRightIcon`. Secondary "I have an account" = `.lr-btn--ghost`.
- Sit the hero on the **`.hero-band`** wash (mint→sky) with a soft `.lr-float` ornament behind the card.
- **Make the `SampleQuestionCard` colorful (§ below)** — it's the hero's proof.

### Sample question card — [sample-question-card.tsx](../../src/components/marketing/sample-question-card.tsx)
This is the single best asset on the page (it shows the *actual* core mechanic). Re-skin onto the
learn atoms:
- Card → `.lr-card` (white, `--r-card`, `--sh-md`/`--sh-lg`), maybe a faint `.lr-float`.
- "Fill the blank · A2" chip → `.lr-chip--mint`; the audio glyph → a small mint `.lr-orb--sm` look.
- The cloze sentence in **Newsreader** (`.lr-sentence`); the blank as `.lr-blank`.
- Options as `.lr-opt`; the **correct** "studies" tile is the **mint `is-correct` state** (`--ok` /
  `--ok-soft` with the check), **not** the current black `bg-foreground`. The VN translation row in
  `--ink-2` with the gloss word in `--primary-ink`.

### How it works — [how-it-works.tsx](../../src/components/marketing/how-it-works.tsx)
3-step loop. Retire the `bg-muted/30` grey band — put it on the mint field or a faint `--primary-soft`
wash. The black numbered circles (`bg-foreground`) become **mint** discs (`--primary` fill, white
number) or rotate accent per step (1 mint, 2 sky, 3 amber) to add color rhythm. Consider connecting
the three with a subtle mint dotted/line connector to read as a *loop*. Scroll-reveal the steps with
a slight stagger (`.lr-stagger`).

### Features — [features.tsx](../../src/components/marketing/features.tsx)
4-up pillar grid. The grey `bg-muted` icon chips become **colored soft chips, one accent per pillar**,
matched to meaning: *Learn in context* → mint, *Spaced repetition* → sky, *Topics & decks* → violet,
*Streaks & goals* → amber (the `FlameIcon` is literally the streak metaphor). Cards → `.lr-card` +
`.hoverlift` so they lift on hover. This is where the full accent palette earns its keep.

### Showcase — [showcase.tsx](../../src/components/marketing/showcase.tsx)
Topic tags + 3 sample decks. Retire the grey band and grey pills. Topic tags become a lively wrap of
`.lr-chip` pills — you may color-cycle them across the accent set for an energetic "catalog" feel
(this is the one place decorative color variety is fine, because it represents *many topics*). Deck
cards → `.lr-card` + `.hoverlift`; the CEFR level badge ("A2"/"B1") → a `.lr-chip--mint` or
provenance-style pill, not the grey `bg-muted` badge. Keep it honestly labeled as illustrative.

### Final CTA — [final-cta.tsx](../../src/components/marketing/final-cta.tsx)
The loudest gray offender: today a **black** `bg-foreground` band. Flip it to a **saturated colored
gradient band** — mint → sky (or mint → violet) — as the page's color crescendo, white serif headline
on top, and a high-contrast CTA (white/`--surface` button with `--primary-ink` label, or an amber
`.lr-btn--amber` for a warm pop against the cool gradient). This is a *colorful* band, **not** a dark
theme (§0.3). Ensure the button label clears AA on the gradient.

### Footer — [landing-footer.tsx](../../src/components/marketing/landing-footer.tsx)
Warm and quiet: `--line` border, `--ink-2`/`--ink-3` text, mint hover on links, `BrandMark` mint.
Low-key by design — the energy lives above it.

---

## 4. Layout variety checklist (kill the monotony)

The current page is **six near-identical blocks**: `mx-auto max-w-6xl`, a left-aligned heading + a
grid, repeated. At DESIGN_VARIANCE 7–8 that's a fail. Vary the rhythm:

- [ ] Hero = asymmetric split (copy / product card), on a colored wash.
- [ ] At least one **full-bleed colored band** (final CTA; optionally how-it-works) breaking the capped
      column.
- [ ] Mix alignment: not every section heading is left-aligned `max-w-xl`. Center one, offset another.
- [ ] Vary card treatments: feature pillars (4-up colored chips) read differently from deck cards
      (content rows) which read differently from topic chips (pill wrap).
- [ ] Scroll-reveal / stagger so sections arrive with motion, not all at once (reduced-motion safe).
- [ ] One or two decorative mint/sky/violet ornaments for depth — never on essential content.

---

## 5. Implementation note (engineer — applying the brand scope + fonts)

The Sprout tokens live **scoped** to `.learn-shell` / `.app-shell` and are consumed as **plain CSS
variables** (`bg-(--amber-soft)`, `text-(--ink-2)`), *not* Tailwind theme colors
([sprout_design_system_reference.md §0](sprout_design_system_reference.md)). The root route is
**outside** `.app-shell`, so the landing gets none of it today. To brand it:

- **Add a brand scope at the marketing root.** Either reuse `.app-shell` (same light-only tokens) or
  add a sibling `.marketing-shell` block in [globals.css](../../src/app/globals.css) declaring the
  identical variable block + the `.app-field` page background. Apply it (plus the `--font-jakarta` /
  `--font-newsreader` variable classes) to the wrapper `<div>` in
  [landing.tsx](../../src/components/marketing/landing.tsx) — mirroring how `(auth)`/layout.tsx and
  `(app)`/layout.tsx set the scope at their roots. A dedicated `.marketing-shell` is the cleaner
  choice if you want landing-only flourishes (e.g. richer band gradients) without touching app chrome.
- **Load the Sprout fonts here.** Add the `Plus_Jakarta_Sans` + `Newsreader` `next/font/google`
  loaders (copy the config from [(app)/layout.tsx](../../src/app/(app)/layout.tsx)) and expose their
  CSS variables on the scope, so the serif headline and Jakarta body render. Without this the page
  stays on Geist.
- Inside the scope, reused shadcn primitives (`Button` via `buttonVariants`, `Card`) inherit mint
  `--primary` / `--ring` / `--border` automatically — but prefer the `.lr-*` atoms for the
  marketing-specific look.
- **Keep it Server Components / zero-JS where possible.** The landing is all-RSC and cacheable today.
  CSS-only motion (`learn-fadeUp`, `.hoverlift`, `.lr-float`, CSS `animation-timeline: view()` /
  scroll-driven CSS) needs **no** client JS — prefer it. If you want JS scroll-reveal
  (IntersectionObserver), isolate it to one small `"use client"` island wrapping the affected
  section, not the whole page.
- **Do not** promote mint to global `:root`, and **do not** brand `/admin`.

---

## 6. Constraints & accessibility

- **Composition is preserved, look changes.** Don't change the route, the `getMe()` redirect, the
  section order, or invent new product claims. Visual + layout + (optional) motion only.
- **No fabricated proof.** No fake testimonials, counts, ratings, or logo walls (§0.4). The
  illustrative catalog stays clearly illustrative.
- **Color is never the only signal.** The sample card's correct answer keeps its check icon; CTAs
  carry labels, not just color; links underline on hover, not color-only.
- **Contrast (AA).** Warm inks must pass on `--surface`: `--ink`/`--ink-2` for body, `--ink-3` for
  non-essential labels/eyebrows only. Mint links use `--primary-ink` (deep) on white. Audit the
  final-CTA button label against its gradient band.
- **Focus visible everywhere** — mint focus ring on every CTA and link (`.lr-btn:focus-visible`
  already specs it). Keyboard-first must work.
- **Honor `prefers-reduced-motion`.** The global rule neutralizes animation inside `.learn-shell` /
  `.app-shell`; if you add a `.marketing-shell` scope, **extend that media-query selector to include
  it** (see the rule at the bottom of [globals.css](../../src/app/globals.css)) so all the new
  scroll/entrance/ornament motion is covered.
- **Light theme only** — no dark variant.
- **Stay cheap** — keep the page server-rendered and cacheable; client JS only as an isolated island
  if truly needed (§5).

---

## 7. Section checklist for the designer

Design at minimum (light theme):

- [ ] **Brand pass:** mint page field (§2.2), warm Sprout ink replacing every cold grey, serif
      headlines, `.lr-card`/`--sh` cards, mint/colored CTAs — the landing reads as the Sprout family.
- [ ] **Header:** warm translucent bar, mint `BrandMark`, mint "Get started", ghost "Log in". (§3)
- [ ] **Hero:** colored `.hero-band` wash, serif headline, mint primary CTA + ghost secondary, a
      `.lr-float` ornament, and the **colorful** sample card. (§3)
- [ ] **Sample card:** re-skinned onto `.lr-card` / `.lr-opt` with a **mint correct-state**, mint
      chip, serif sentence. (§3)
- [ ] **How it works:** colored (mint/sky/amber) step discs on a warm band, loop connector,
      staggered reveal. (§3)
- [ ] **Features:** 4 pillars with **one accent each** (mint / sky / violet / amber) matched to
      meaning, `.hoverlift` cards. (§3)
- [ ] **Showcase:** lively colored topic-chip wrap + `.hoverlift` deck cards with mint level badges.
      (§3)
- [ ] **Final CTA:** saturated **colored gradient** band (mint→sky/violet), white serif headline,
      high-contrast CTA — not the old black band. (§3)
- [ ] **Footer:** warm, quiet, mint hovers. (§3)
- [ ] **Variety:** layout rhythm varied, at least one full-bleed band, motion present and
      reduced-motion safe. (§4)
- [ ] **(Engineer)** brand scope + Sprout fonts applied at the marketing root; reduced-motion rule
      extended to the new scope; page stays RSC/cacheable. (§5–§6)

> Keep this file current: if the marketing components, the Sprout tokens, or the scope mechanics
> change, update §1–§5 here in the same PR (alongside
> [sprout_design_system_reference.md](sprout_design_system_reference.md) and
> [auth_redesign_design_context.md](auth_redesign_design_context.md)).
