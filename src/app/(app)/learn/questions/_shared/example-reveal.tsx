import { LanguagesIcon } from "lucide-react";

import type { HighlightSpan, WordExample } from "@/lib/me/learn/types";

interface ExampleRevealProps {
  /** The word-in-context example, or null/undefined when the backend sent none. */
  example: WordExample | null | undefined;
}

/**
 * Post-answer example: the studied word shown in a real sentence (+ its
 * translation), rendered under the correct/incorrect strip on every question
 * type so the reveal teaches the word in context, not just the bare lemma.
 * Renders nothing until the backend supplies `example` (forward-compatible).
 */
export function ExampleReveal({ example }: ExampleRevealProps) {
  if (!example?.sentence) return null;
  const { sentence, translation, highlightedSpan } = example;

  return (
    <div className="lr-ex lr-pop">
      <div className="lr-eyebrow">Example</div>
      <p className="lr-sentence text-[17px]">
        {renderSentence(sentence, highlightedSpan)}
      </p>
      {translation && (
        <p className="lr-ex-tr">
          <LanguagesIcon className="size-4.5" strokeWidth={2} />
          <span>{translation}</span>
        </p>
      )}
    </div>
  );
}

/** Bold the studied word inside the sentence when a valid span is provided. */
function renderSentence(sentence: string, span: HighlightSpan | null) {
  if (!span || span.start < 0 || span.end > sentence.length || span.start >= span.end) {
    return sentence;
  }
  return (
    <>
      {sentence.slice(0, span.start)}
      <mark className="lr-mark">{sentence.slice(span.start, span.end)}</mark>
      {sentence.slice(span.end)}
    </>
  );
}
