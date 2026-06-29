"use client";

import { Fragment, useEffect, useState } from "react";

import type { SenseDisambiguationPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { OptionList } from "./_shared/option-list";
import { SentenceGloss } from "./_shared/sentence-gloss";

type Props = QuizQuestionProps & { prompt: SenseDisambiguationPrompt };

/** Highlight occurrences of `lemma` (case-insensitive) — fallback when no span. */
function highlightLemma(sentence: string, lemma: string) {
  if (!lemma) return sentence;
  const parts = sentence.split(new RegExp(`(${escapeRegExp(lemma)})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === lemma.toLowerCase() ? (
      <mark key={i} className="lr-mark">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Pick the meaning that fits how the word is used in one example sentence. Wrong
 * options are the word's other senses (polysemy traps); the contract grades the
 * chosen meaning text. `highlightedSpan` pinpoints the word when present; when
 * it's null we highlight occurrences of the lemma instead.
 */
export function SenseDisambiguationQuestion({
  prompt,
  lemma,
  disabled,
  result,
  onAnswerChange,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  useEffect(() => {
    onAnswerChange(selected);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const { sentence, highlightedSpan } = prompt;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="lr-eyebrow mb-3">
          Which meaning matches how “{lemma}” is used?
        </div>
        <p className="lr-sentence text-[26px] text-balance">
          {highlightedSpan ? (
            <>
              {sentence.slice(0, highlightedSpan.start)}
              <mark className="lr-mark">
                {sentence.slice(highlightedSpan.start, highlightedSpan.end)}
              </mark>
              {sentence.slice(highlightedSpan.end)}
            </>
          ) : (
            highlightLemma(sentence, lemma)
          )}
        </p>
        {revealed && <SentenceGloss translation={prompt.sentenceTranslation} />}
      </div>

      <OptionList
        options={prompt.options}
        selected={selected}
        onSelect={setSelected}
        disabled={disabled || revealed}
        correctAnswer={revealed ? result.correctAnswer : null}
      />
    </div>
  );
}
