import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AnswerResponse } from "@/lib/me/learn/types";

interface FeedbackBannerProps {
  result: AnswerResponse;
  /** Hide the canonical answer line (e.g. flashcards have no objective answer). */
  hideAnswer?: boolean;
}

/** Post-answer feedback strip: correctness + the canonical answer on a miss. */
export function FeedbackBanner({ result, hideAnswer = false }: FeedbackBannerProps) {
  const { correct, correctAnswer } = result;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-xl px-4 py-3 text-sm",
        correct
          ? "bg-green-600/10 text-green-700 dark:text-green-400"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {correct ? (
        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
      ) : (
        <XCircleIcon className="mt-0.5 size-4 shrink-0" />
      )}
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{correct ? "Correct" : "Not quite"}</span>
        {!hideAnswer && !correct && correctAnswer && (
          <span className="text-foreground/80">
            Answer: <span className="font-medium">{correctAnswer}</span>
          </span>
        )}
      </div>
    </div>
  );
}
