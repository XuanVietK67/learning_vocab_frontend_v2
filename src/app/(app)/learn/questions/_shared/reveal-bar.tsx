import type { ReactNode } from "react";
import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface RevealBarProps {
  correct: boolean;
  /** Canonical answer to surface (shown when wrong). */
  answer?: string | null;
  /** Optional praise line shown when correct. */
  note?: ReactNode;
}

/**
 * Graded-feedback strip shown above the Continue button. Always surfaces the
 * canonical answer when the pick was wrong (brief §4).
 */
export function RevealBar({ correct, answer, note }: RevealBarProps) {
  return (
    <div
      className={cn(
        "lr-pop flex items-center gap-3 rounded-2xl px-4 py-3.5",
        correct ? "bg-(--ok-soft) text-(--ok-ink)" : "bg-(--bad-soft) text-(--bad-ink)",
      )}
    >
      <span
        className={cn(
          "lr-checkpop grid size-8.5 shrink-0 place-items-center rounded-full text-white",
          correct ? "bg-(--ok)" : "bg-(--bad)",
        )}
      >
        {correct ? (
          <CheckIcon className="size-5" strokeWidth={3} />
        ) : (
          <XIcon className="size-5" strokeWidth={3} />
        )}
      </span>
      <div className="leading-tight">
        <div className="text-[15.5px] font-extrabold">
          {correct ? "Nice — that’s right!" : "Not quite"}
        </div>
        <div className="text-sm font-semibold opacity-90">
          {correct ? (
            (note ?? "Keep the streak going.")
          ) : (
            <>
              Answer: <b className="font-extrabold">{answer}</b>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
