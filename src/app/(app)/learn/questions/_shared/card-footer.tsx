"use client";

import { ArrowRightIcon } from "lucide-react";

import type { AnswerResponse } from "@/lib/me/learn/types";
import { CheckButton } from "./check-button";
import { RevealBar } from "./reveal-bar";

/** Practice-mode hint: the answer was graded but left the schedule untouched. */
const PRACTICE_NOT_COUNTED = "Practice — not counted toward your next review";

interface CardFooterProps {
  /** Null while answering; set once the answer has been graded. */
  result: AnswerResponse | null;
  /** `quiz` shows Check + correct/incorrect feedback; `flashcard` is self-rated. */
  variant: "quiz" | "flashcard";
  /** Enables the Check button (quiz only). */
  canCheck?: boolean;
  /** Last item in the queue — relabels Continue as Finish. */
  isLast: boolean;
  /** Practice mode: the answer was graded but didn't move the SRS schedule. */
  notCounted?: boolean;
  onCheck?: () => void;
  onContinue: () => void;
}

/**
 * The study card's action slot. While answering it shows the Check button (quiz
 * types only); once graded it shows the reveal strip + an amber Continue.
 * Flashcards own their own "Got it" control in the card body and self-advance,
 * so they get no footer control at all.
 */
export function CardFooter({
  result,
  variant,
  canCheck = false,
  isLast,
  notCounted = false,
  onCheck,
  onContinue,
}: CardFooterProps) {
  if (variant === "flashcard") return null;

  if (result === null) {
    return <CheckButton disabled={!canCheck} onClick={onCheck} />;
  }

  return (
    <div className="flex flex-col gap-3.5">
      <RevealBar
        correct={result.correct}
        answer={result.correctAnswer}
        subtext={notCounted ? PRACTICE_NOT_COUNTED : undefined}
      />
      <button
        type="button"
        autoFocus
        onClick={onContinue}
        className="lr-btn lr-btn--amber lr-btn--lg lr-btn--block"
      >
        {isLast ? "Finish" : "Continue"}
        <ArrowRightIcon className="size-5" strokeWidth={2.4} />
      </button>
    </div>
  );
}
