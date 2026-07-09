/**
 * The learn-session accent palette, keyed by difficulty band. Each round/stage
 * wears one of these so the color itself signals "things got harder" as the
 * ladder ascends (mint → violet/sky → amber → gold mastery). Values are
 * references to the `.learn-shell` tokens in globals.css — composing the
 * existing hues, introducing none — so they only resolve inside the shell.
 *
 * Use the spreadable `accentVars()` to drop `--acc*` custom properties onto an
 * element's inline style; the `.lr-stage*` / `.lr-inter*` atoms read them.
 */

export type Accent = "mint" | "violet" | "sky" | "amber" | "gold";

interface AccentRamp {
  /** Saturated fill / the round's signature color. */
  main: string;
  /** Pressed/deepened shade for gradients. */
  press: string;
  /** Soft tint for chips and resting fills. */
  soft: string;
  /** Faintest wash. */
  soft2: string;
  /** Readable ink on a soft tint. */
  ink: string;
}

export const ACCENTS: Record<Accent, AccentRamp> = {
  mint: {
    main: "var(--primary)",
    press: "var(--primary-press)",
    soft: "var(--primary-soft)",
    soft2: "var(--primary-soft-2)",
    ink: "var(--primary-ink)",
  },
  violet: {
    main: "var(--violet)",
    press: "var(--violet-press)",
    soft: "var(--violet-soft)",
    soft2: "var(--violet-soft-2)",
    ink: "var(--violet-ink)",
  },
  sky: {
    main: "var(--sky)",
    press: "var(--sky-press)",
    soft: "var(--sky-soft)",
    soft2: "var(--sky-soft-2)",
    ink: "var(--sky-ink)",
  },
  amber: {
    main: "var(--amber)",
    press: "var(--amber-2)",
    soft: "var(--amber-soft)",
    soft2: "var(--amber-soft-2)",
    ink: "var(--amber-ink)",
  },
  gold: {
    main: "var(--gold)",
    press: "var(--gold-press)",
    soft: "var(--gold-soft)",
    soft2: "var(--gold-soft-2)",
    ink: "var(--gold-ink)",
  },
};

/** `--acc*` custom properties for an accent, to spread onto an inline style. */
export function accentVars(accent: Accent): React.CSSProperties {
  const a = ACCENTS[accent];
  return {
    "--acc": a.main,
    "--acc-press": a.press,
    "--acc-soft": a.soft,
    "--acc-soft-2": a.soft2,
    "--acc-ink": a.ink,
  } as React.CSSProperties;
}
