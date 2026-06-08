"use client";

import { Fragment, useEffect, useState } from "react";

import type { SenseDisambiguationPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { OptionList } from "./_shared/option-list";

type Props = QuizQuestionProps & { prompt: SenseDisambiguationPrompt };

/** Highlight occurrences of `lemma` (case-insensitive) inside an example. */
function highlight(sentence: string, lemma: string) {
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
 * Disambiguate the studied word across example sentences, then pick the meaning
 * that applies. The contract grades a single chosen meaning; the sentences are
 * shown as context and the options are a single-select of meanings.
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

  return (
    <div className="flex flex-col gap-5">
      <div className="lr-word text-[30px]">{lemma}</div>

      <div className="flex flex-col gap-2.5">
        {prompt.sentences.map((s, index) => (
          <div
            key={s.exampleId}
            className="lr-sentence rounded-2xl bg-(--card-2) px-4 py-3 text-[19px] leading-relaxed"
          >
            <span className="mr-2 align-middle text-xs font-bold text-(--ink-3)">{index + 1}.</span>
            {highlight(s.sentence, lemma)}
          </div>
        ))}
      </div>

      <div className="lr-eyebrow">
        Which meaning matches how “{lemma}” is used?
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
