/** Shared props every question renderer receives from the dispatcher. */
import type { AnswerResponse } from "@/lib/me/learn/types";

interface QuestionShared {
  /** The word being studied — handy for headings on context questions. */
  lemma: string;
  /** True while an answer submission is in flight (lock the inputs). */
  disabled: boolean;
  /**
   * Non-null once the answer has been graded — switches the renderer into
   * reveal mode (highlight correct/chosen, stop accepting input).
   */
  result: AnswerResponse | null;
}

/**
 * The six gradable types are controlled by the runner: they own their input UI
 * and report the current answer up; the runner renders the Check button + the
 * feedback footer in the shared card footer.
 */
export interface QuizQuestionProps extends QuestionShared {
  /** Report the current answer (or null while incomplete) for the card footer. */
  onAnswerChange: (answer: string | null) => void;
}

/**
 * Flashcards are self-rated, so they submit directly (no Check footer) and own
 * their Space/Enter reveal handling.
 */
export interface FlashcardQuestionProps extends QuestionShared {
  /** Commit the self-rating (forgot / hard / good / easy). */
  onSubmit: (rating: string) => void;
}
