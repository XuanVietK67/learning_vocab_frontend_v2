/**
 * Pure display helpers shared by the Speaking Room screens (learner + admin).
 * No server-only imports — safe to use from Client Components.
 *
 * Colour carries meaning (brief §1): the CEFR badge uses a per-band ramp
 * (A=sky, B=violet, C=amber) and the scenario "poster" leans on the violet→sky
 * voice wash so a card reads as a conversation, not a Learn card.
 */
import type { CefrLevel } from "@/lib/auth/types";

export const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export interface BadgeTone {
  bg: string;
  fg: string;
  label: string;
}

/** Scannable, colour-coded difficulty. `null` = an "Any level" neutral chip. */
export function cefrBadge(level: CefrLevel | null): BadgeTone {
  if (!level) return { bg: "var(--card-2)", fg: "var(--ink-2)", label: "Any" };
  const band = level[0];
  if (band === "A") return { bg: "var(--sky-soft)", fg: "#0f5e80", label: level };
  if (band === "B") return { bg: "var(--violet-soft)", fg: "#4b3fb0", label: level };
  return { bg: "var(--amber-soft)", fg: "#92590a", label: level };
}

/** "coffee-food" → "Coffee food". Falls back to the raw slug. */
export function topicLabel(slug: string): string {
  const s = slug.replace(/-/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : slug;
}

/** Five curated violet/sky/mint washes for the catalogue poster headers. */
const POSTERS = [
  "radial-gradient(120% 120% at 0% 0%, #d9d3ff, transparent 60%), linear-gradient(135deg, #ece9ff, #e0f1fa)",
  "radial-gradient(120% 120% at 100% 0%, #cdebf7, transparent 60%), linear-gradient(135deg, #e0f1fa, #e0f6ee)",
  "radial-gradient(120% 120% at 0% 0%, #e7e2ff, transparent 60%), linear-gradient(135deg, #ece9ff, #fbeccf)",
  "radial-gradient(120% 120% at 100% 0%, #d6f0e6, transparent 60%), linear-gradient(135deg, #e0f6ee, #e0f1fa)",
  "radial-gradient(120% 120% at 0% 0%, #d9d3ff, transparent 55%), linear-gradient(135deg, #e6e2ff, #d9eefb)",
];

/** Stable per-scenario poster wash, so a card looks the same on every visit. */
export function posterWash(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return POSTERS[h % POSTERS.length];
}
