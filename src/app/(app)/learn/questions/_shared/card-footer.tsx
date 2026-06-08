"use client";

import { ArrowRightIcon } from "lucide-react";

import type { AnswerResponse } from "@/lib/me/learn/types";
import { CheckButton } from "./check-button";
import { RevealBar } from "./reveal-bar";

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
 * types only); once graded it shows the reveal strip (quiz) + an amber Continue.
 * Flashcards are self-rated, so they only get the Continue control on reveal.
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

  return (
    <div className="flex flex-col gap-3.5">
      {variant === "quiz" && (
        <RevealBar correct={result.correct} answer={result.correctAnswer} />
      )}
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
