"use client";

import { useEffect, useState } from "react";

import type { MeaningInContextPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { OptionList } from "./_shared/option-list";

type Props = QuizQuestionProps & { prompt: MeaningInContextPrompt };

/** Pick the meaning that fits the highlighted word. Reports the chosen text. */
export function MeaningInContextQuestion({
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
  const before = sentence.slice(0, highlightedSpan.start);
  const span = sentence.slice(highlightedSpan.start, highlightedSpan.end);
  const after = sentence.slice(highlightedSpan.end);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-muted/60 px-5 py-4">
        <p className="text-lg leading-relaxed text-balance">
          {before}
          <mark className="bg-[linear-gradient(transparent_60%,rgba(91,141,239,0.38)_60%)] px-0.5 font-bold text-foreground">
            {span}
          </mark>
          {after}
        </p>
      </div>

      <p className="text-center text-base font-semibold">
        What does <span className="text-(--primary-d)">{lemma}</span> mean here?
      </p>

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
