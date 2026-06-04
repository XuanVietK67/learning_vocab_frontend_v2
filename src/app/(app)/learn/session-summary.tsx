import Link from "next/link";
import { XIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionSummaryProps {
  answered: number;
  correct: number;
  bestStreak: number;
  /** Restart the same mode (re-runs the session start). */
  onStudyAgain: () => void;
  /** Provided when opened mid-session via the Progress button (adds a close X). */
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
  const burst = accuracy >= 80 ? "🎉" : accuracy >= 50 ? "👏" : "💪";

  return (
    <div className="relative w-full max-w-115 rounded-3xl bg-card p-9 text-center shadow-[0_30px_80px_-24px_rgba(0,0,0,0.4)]">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <XIcon className="size-5" />
        </button>
      )}

      <div className="learn-burst text-[56px] leading-none">{burst}</div>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Your progress</h1>
      <p className="mt-1 text-[15px] text-muted-foreground">
        You&apos;ve answered {answered} {answered === 1 ? "card" : "cards"} this session.
      </p>

      <div className="mt-6 flex gap-3">
        <Stat value={`${accuracy}%`} label="Accuracy" />
        <Stat value={`${correct}/${answered}`} label="Correct" />
        <Stat value={`${bestStreak}🔥`} label="Best streak" fire />
      </div>

      <div className="mt-7 flex gap-2.5">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className={cn(buttonVariants({ variant: "outline" }), "h-11 flex-1 text-base")}
          >
            Keep studying
          </button>
        ) : (
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "h-11 flex-1 text-base")}
          >
            Back to dashboard
          </Link>
        )}
        <Button type="button" onClick={onStudyAgain} className="h-11 flex-1 text-base">
          Study again
        </Button>
      </div>
    </div>
  );
}

function Stat({ value, label, fire = false }: { value: string; label: string; fire?: boolean }) {
  return (
    <div className="flex-1 rounded-2xl bg-muted px-2 py-4">
      <div className={cn("text-2xl font-extrabold", fire ? "text-amber-500" : "text-(--primary-d)")}>
        {value}
      </div>
      <div className="mt-1 text-xs font-bold text-muted-foreground">{label}</div>
    </div>
  );
}
