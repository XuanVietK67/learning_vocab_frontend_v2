"use client";

import { cn } from "@/lib/utils";

const CONFETTI_COLORS = [
  "var(--primary)",
  "var(--accent)",
  "#13a97b",
  "#fbbf24",
  "#3b82f6",
];

// Pre-computed once at module load (not during render) so the purity rules stay
// happy and every burst is cheap to mount.
const CONFETTI_BITS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.25,
  rot: Math.random() * 360,
  dur: 0.7 + Math.random() * 0.5,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

/**
 * Correct/incorrect celebration over the study card: a soft radial flash plus
 * (on a correct answer) a short confetti burst. Mounted only while `kind` is set
 * so each trigger replays the CSS animations from the start.
 */
export function FeedbackFx({ kind }: { kind: "ok" | "bad" }) {
  return (
    <>
      <div className={cn("learn-flash", kind === "ok" ? "learn-flash--ok" : "learn-flash--bad")} />
      {kind === "ok" && <Confetti />}
    </>
  );
}

function Confetti() {
  return (
    <div className="learn-confetti" aria-hidden="true">
      {CONFETTI_BITS.map((b) => (
        <span
          key={b.id}
          className="learn-confetti__bit"
          style={{
            left: `${b.left}%`,
            background: b.color,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            transform: `rotate(${b.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
