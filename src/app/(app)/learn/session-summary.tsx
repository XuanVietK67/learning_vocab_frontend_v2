import Link from "next/link";
import { TrophyIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Confetti } from "./questions/_shared/confetti";

interface SessionSummaryProps {
  answered: number;
  correct: number;
  bestStreak: number;
  /** Restart the same mode (re-runs the session start). */
  onStudyAgain: () => void;
  /** Provided when opened mid-session via the progress peek (adds a close X). */
  onClose?: () => void;
}

/**
 * Progress / end-of-session recap, rendered inside a modal overlay. Shows
 * accuracy, score, and best streak; reused for the mid-session peek (with a
 * close affordance) and the terminal summary.
 */
export function SessionSummary({
  answered,
  correct,
  bestStreak,
  onStudyAgain,
  onClose,
}: SessionSummaryProps) {
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <div className="learn-anim-in relative w-full max-w-115">
      <Confetti fire={1} />
      <div className="learn-card overflow-hidden p-9 text-center">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-(--ink-3) transition-colors hover:bg-(--card-2) hover:text-(--ink)"
          >
            <XIcon className="size-5" />
          </button>
        )}

        <div className="lr-pop mx-auto mb-4 grid size-22 place-items-center rounded-full bg-gradient-to-br from-(--amber) to-(--amber-2) text-white shadow-(--sh-amber)">
          <TrophyIcon className="size-11" strokeWidth={1.9} />
        </div>
        <div className="lr-eyebrow">{onClose ? "Your progress" : "Session complete"}</div>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight">
          {onClose ? "Nice momentum" : "Great work!"}
        </h1>
        <p className="mt-2 text-[15px] text-(--ink-2)">
          You’ve answered {answered} {answered === 1 ? "card" : "cards"} this session.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <Stat value={`${accuracy}%`} label="Accuracy" tint="primary" />
          <Stat value={`${correct}/${answered}`} label="Correct" tint="sky" />
          <Stat value={`${bestStreak}`} label="Best streak" tint="amber" />
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onStudyAgain}
            className="lr-btn lr-btn--primary lr-btn--lg lr-btn--block"
          >
            Study again
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="lr-btn lr-btn--ghost lr-btn--md lr-btn--block"
            >
              Keep studying
            </button>
          ) : (
            <Link href="/dashboard" className="lr-btn lr-btn--ghost lr-btn--md lr-btn--block">
              Back to dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  tint,
}: {
  value: string;
  label: string;
  tint: "primary" | "sky" | "amber";
}) {
  const tintClass =
    tint === "primary"
      ? "bg-(--primary-soft) text-(--primary-ink)"
      : tint === "sky"
        ? "bg-(--sky-soft) text-[#176e93]"
        : "bg-(--amber-soft) text-[#b5650c]";
  return (
    <div className={cn("rounded-2xl px-2 py-4", tintClass)}>
      <div className="text-[28px] leading-none font-extrabold tabular-nums">{value}</div>
      <div className="lr-eyebrow mt-2 opacity-80">{label}</div>
    </div>
  );
}
