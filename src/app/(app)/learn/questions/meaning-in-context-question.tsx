"use client";

import { useEffect, useState } from "react";

import type { MeaningInContextPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { OptionList } from "./_shared/option-list";

type Props = QuizQuestionProps & { prompt: MeaningInContextPrompt };

/** Pick the meaning that fits the highlighted word. Reports the chosen text. */
export function MeaningInContextQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
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
    <div className="flex flex-col gap-6">
      <div>
        <div className="lr-eyebrow mb-3">What does the highlighted word mean?</div>
        <p className="lr-sentence text-[26px] text-balance">
          {before}
          <mark className="lr-mark">{span}</mark>
          {after}
        </p>
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
