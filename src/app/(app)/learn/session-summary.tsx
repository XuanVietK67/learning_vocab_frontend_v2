import Link from "next/link";
import { PartyPopperIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionSummaryProps {
  answered: number;
  correct: number;
  /** Restart the same mode (re-runs the session start). */
  onStudyAgain: () => void;
}

/** End-of-session recap with the run's accuracy and next-step actions. */
export function SessionSummary({ answered, correct, onStudyAgain }: SessionSummaryProps) {
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-foreground">
        <PartyPopperIcon className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Session complete</h1>
        <p className="text-muted-foreground">
          You answered {answered} {answered === 1 ? "question" : "questions"} with {accuracy}%
          accuracy.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStudyAgain}
          className={cn(buttonVariants({ variant: "default" }), "h-10 px-5")}
        >
          Study again
        </button>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-5")}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
