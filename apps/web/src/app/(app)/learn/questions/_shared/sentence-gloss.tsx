import { LanguagesIcon } from "lucide-react";

interface SentenceGlossProps {
  /** Translation of the example sentence, or null when none was provided. */
  translation: string | null;
}

/**
 * Post-answer reveal of the example sentence's translation. Rendered under the
 * sentence once the answer is graded — a quiet "subtitle" (same serif, italic,
 * muted) rather than a boxed chip, so it reads as the sentence in the learner's
 * language, not a second UI object. Neutral by design: the correct/incorrect
 * accent stays in the footer reveal-bar.
 */
export function SentenceGloss({ translation }: SentenceGlossProps) {
  if (!translation) return null;
  return (
    <p className="lr-gloss lr-pop">
      <LanguagesIcon className="size-4.5" strokeWidth={2} />
      <span>{translation}</span>
    </p>
  );
}
