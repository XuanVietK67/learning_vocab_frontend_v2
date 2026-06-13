/**
 * The single 0–100 → green/amber/red **band scale** that owns every score on the
 * Practice screen (overall rings + per-phoneme tiles), so a "72" reads the same
 * in Write and Speak. `cefr` and the 0–5 rubric criteria are deliberately NOT on
 * this scale — they stay neutral. Thresholds mirror the backend `label` bands
 * (`good` ≥75 · `practice` 45–74 · `wrong` <45).
 */
import type { PhonemeLabel } from "@/lib/me/pronunciation/types";

export type Band = "ok" | "amber" | "bad";

export function bandOf(score: number): Band {
  if (score >= 75) return "ok";
  if (score >= 45) return "amber";
  return "bad";
}

/** Map a phoneme `label` to the shared band (same thresholds, different source). */
export function bandOfLabel(label: PhonemeLabel): Band {
  return label === "good" ? "ok" : label === "practice" ? "amber" : "bad";
}

/** Encouraging headline copy, paired with the number so colour is never the only signal. */
export function bandCopy(score: number): string {
  if (score >= 75) return "Great";
  if (score >= 45) return "Getting there";
  return "Let’s try again";
}

interface BandStyle {
  /** Ring / meter / sparkline stroke. */
  line: string;
  /** Foreground ink for numbers + labels on a soft fill. */
  ink: string;
  /** Soft tinted fill (tile/chip background). */
  fill: string;
  /** `.lr-chip` accent class for band-coloured status chips. */
  chip: string;
}

/** Token-backed colours per band (amber uses the saturated line + a dark ink, matching /learn). */
export const BAND_STYLE: Record<Band, BandStyle> = {
  ok: { line: "var(--ok)", ink: "var(--ok-ink)", fill: "var(--ok-soft)", chip: "lr-chip--mint" },
  amber: { line: "var(--amber-2)", ink: "#8a5300", fill: "var(--amber-soft)", chip: "lr-chip--amber" },
  bad: { line: "var(--bad)", ink: "var(--bad-ink)", fill: "var(--bad-soft)", chip: "lr-chip--bad" },
};
