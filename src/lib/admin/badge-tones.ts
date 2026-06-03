/**
 * Semantic color tones for admin badges. Centralized so the vocabulary table
 * and detail header stay in sync. Uses Tailwind's color palette directly since
 * the base theme is monochrome — colors here encode *meaning*, not decoration.
 */
import type { CefrLevel } from "@/lib/auth/types";
import type { VocabSource } from "@/lib/admin/types";

export type BadgeTone =
  | "neutral"
  | "green"
  | "teal"
  | "sky"
  | "indigo"
  | "amber"
  | "rose"
  | "slate"
  | "violet"
  | "emerald";

/** Light + dark classes per tone. Soft fill, readable text, inset ring. */
export const toneClass: Record<BadgeTone, string> = {
  neutral:
    "bg-muted text-muted-foreground ring-foreground/10",
  green:
    "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/25",
  teal:
    "bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-500/10 dark:text-teal-400 dark:ring-teal-500/25",
  sky:
    "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/25",
  indigo:
    "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/25",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/25",
  rose:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/25",
  slate:
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/25",
  violet:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/25",
  emerald:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/25",
};

/** CEFR difficulty ramp: easiest (green) → hardest (rose). */
const CEFR_TONE: Record<CefrLevel, BadgeTone> = {
  A1: "green",
  A2: "teal",
  B1: "sky",
  B2: "indigo",
  C1: "amber",
  C2: "rose",
};

export function cefrTone(level: CefrLevel): BadgeTone {
  return CEFR_TONE[level];
}

export function sourceTone(source: VocabSource): BadgeTone {
  return source === "user" ? "violet" : "slate";
}
