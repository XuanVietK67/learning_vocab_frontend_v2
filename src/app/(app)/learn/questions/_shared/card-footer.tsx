"use client";

import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AnswerResponse } from "@/lib/me/learn/types";
import { CheckButton } from "./check-button";

interface CardFooterProps {
  /** Null while answering; set once the answer has been graded. */
  result: AnswerResponse | null;
  /** `quiz` shows Check + correct/incorrect feedback; `flashcard` is self-rated. */
  variant: "quiz" | "flashcard";
  /** Enables the Check button (quiz only). */
  canCheck?: boolean;
  /** Last item in the queue — relabels Continue as Finish. */
  isLast: boolean;
  onCheck?: () => void;
  onContinue: () => void;
}

/**
 * The study card's action slot. While answering it shows the Check button (quiz
 * types only); once graded it shows the inline feedback strip + Continue.
 * Flashcards are self-rated, so they only get a Continue control on reveal.
 */
export function CardFooter({
  result,
  variant,
  canCheck = false,
  isLast,
  onCheck,
  onContinue,
}: CardFooterProps) {
  if (result === null) {
    if (variant === "flashcard") return null;
    return <CheckButton disabled={!canCheck} onClick={onCheck} />;
  }

  const continueButton = (
    <button
      type="button"
      autoFocus
      onClick={onContinue}
      className="shrink-0 rounded-[14px] bg-card px-6 py-2.5 text-base font-bold text-foreground shadow-[0_3px_0_rgba(0,0,0,0.08)] transition active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.08)]"
    >
      {isLast ? "Finish" : "Continue"}
    </button>
  );

  if (variant === "flashcard") {
    return <div className="flex justify-end">{continueButton}</div>;
  }

  const ok = result.correct;
  return (
    <div className="learn-anim-in flex items-center gap-3">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full text-white",
          ok ? "bg-(--ok)" : "bg-(--bad)",
        )}
      >
        {ok ? (
          <CheckIcon className="size-5" strokeWidth={3} />
        ) : (
          <XIcon className="size-5" strokeWidth={3} />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <b className={cn("text-base", ok ? "text-[#0c7d44]" : "text-[#b0223a]")}>
          {ok ? "Correct!" : "Not quite"}
        </b>
        {!ok && result.correctAnswer && (
          <span className="text-[13.5px] text-muted-foreground">
            Answer: <b className="text-foreground">{result.correctAnswer}</b>
          </span>
        )}
      </div>
      {continueButton}
    </div>
  );
}
