"use client";

import { cn } from "@/lib/utils";

/**
 * Correct/incorrect celebration over the study card: a soft radial flash (green
 * on correct, red + shake on wrong). The richer confetti burst is fired
 * separately from the shell. Mounted only while `kind` is set so each trigger
 * replays the CSS animation from the start.
 */
export function FeedbackFx({ kind }: { kind: "ok" | "bad" }) {
  return (
    <div className={cn("learn-flash", kind === "ok" ? "learn-flash--ok" : "learn-flash--bad")} />
  );
}
