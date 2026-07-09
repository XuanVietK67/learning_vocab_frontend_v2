"use client";

import { useEffect, useState } from "react";

import type { TranslationFromWordPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { OptionList } from "./_shared/option-list";

type Props = QuizQuestionProps & { prompt: TranslationFromWordPrompt };

/** Show the word, pick its translation. Reports the chosen translation. */
export function TranslationFromWordQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  useEffect(() => {
    onAnswerChange(selected);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-7">
      <div className="pt-2 text-center">
        <div className="lr-eyebrow mb-3.5">What does this mean?</div>
        <div className="lr-word text-[52px]">{prompt.lemma}</div>
      </div>

      <OptionList
        options={prompt.options}
        selected={selected}
        onSelect={setSelected}
        disabled={disabled || revealed}
        correctAnswer={revealed ? result.correctAnswer : null}
        variant="grid"
      />
    </div>
  );
}
