/**
 * Adaptive hero copy for the home (§7.1). Resolves the kicker / heading / sub /
 * CTA from the user's queue state: brand-new (no words) → caught-up (0 due) →
 * the daily "N cards due" case. The heading may contain a `\n` line break —
 * render it with `whitespace-pre-line`.
 */
import { formatTimeUntil } from "@/lib/format";

import type { StatsResponse } from "./types";

export type HeroMode = "daily" | "review" | "first";

export interface HeroCopy {
  kicker: string;
  heading: string;
  sub: string;
  cta: string;
  mode: HeroMode;
  /** `mode` query for the `/learn` CTA href. */
  learnMode: "daily" | "review";
}

export function heroCopy(stats: StatsResponse): HeroCopy {
  const { counts, dueNow, nextDueAt } = stats;
  const total = counts.new + counts.learning + counts.review + counts.mastered;

  if (total === 0) {
    return {
      kicker: "Let's begin",
      heading: "Ready to learn your\nfirst words?",
      sub: "Pick a list below and start your first session — five minutes is enough.",
      cta: "Start your first session",
      mode: "first",
      learnMode: "daily",
    };
  }

  if (dueNow === 0) {
    return {
      kicker: "All caught up",
      heading: "You're all\ncaught up",
      sub: nextDueAt
        ? `Next review in ${formatTimeUntil(nextDueAt)}. Want to get ahead?`
        : "Nothing due right now. Want to get ahead?",
      cta: "Get ahead",
      mode: "review",
      learnMode: "review",
    };
  }

  return {
    kicker: "Today",
    heading: `${dueNow} ${dueNow === 1 ? "card" : "cards"}\ndue now`,
    sub: "Clear your queue to keep the streak alive.",
    cta: "Continue learning",
    mode: "daily",
    learnMode: "daily",
  };
}
