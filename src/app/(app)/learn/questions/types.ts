/** Shared props every question renderer receives from the dispatcher. */
import type { AnswerResponse } from "@/lib/me/learn/types";

export interface BaseQuestionProps {
  /** The word being studied — handy for headings on context questions. */
  lemma: string;
  /** True while an answer submission is in flight (lock the inputs). */
  disabled: boolean;
  /**
   * Non-null once the answer has been graded — switches the renderer into
   * reveal mode (highlight correct/chosen, stop accepting input).
   */
  result: AnswerResponse | null;
  /** Commit the user's answer (the chosen text, typed word, or self-rating). */
  onSubmit: (userAnswer: string) => void;
}
