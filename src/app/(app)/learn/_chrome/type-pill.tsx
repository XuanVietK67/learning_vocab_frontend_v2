import { cn } from "@/lib/utils";
import type { QuestionType } from "@/lib/me/learn/types";

type DotColor = "primary" | "violet" | "sky" | "amber";

/** Human label + accent-dot color per question type (drives the type pill). */
export const TYPE_META: Record<QuestionType, { label: string; dot: DotColor }> = {
  flashcard: { label: "Flashcard", dot: "primary" },
  cloze_mcq: { label: "Fill the blank", dot: "primary" },
  meaning_in_context: { label: "Meaning in context", dot: "primary" },
  sense_disambiguation: { label: "Which sense?", dot: "primary" },
  word_from_translation: { label: "Choose the word", dot: "primary" },
  translation_from_word: { label: "Choose the meaning", dot: "primary" },
  listening_cloze: { label: "Listen & fill", dot: "violet" },
  listening_choice: { label: "Listen & choose", dot: "violet" },
  image_choice: { label: "Match the picture", dot: "sky" },
  cloze_typing: { label: "Type the word", dot: "primary" },
  dictation: { label: "Dictation", dot: "violet" },
  pronunciation: { label: "Say it", dot: "amber" },
};

/** The current question type, as a small dotted pill in the top chrome. */
export function TypePill({ type }: { type: QuestionType }) {
  const meta = TYPE_META[type];
  return (
    <span className="lr-typepill">
      <span className={cn("dot", meta.dot !== "primary" && meta.dot)} />
      {meta.label}
    </span>
  );
}
