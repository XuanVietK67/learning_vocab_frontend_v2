"use client";

import { useEffect, useState } from "react";

import type { WordFromTranslationPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { OptionList } from "./_shared/option-list";

type Props = QuizQuestionProps & { prompt: WordFromTranslationPrompt };

/** Show the translation, pick the matching word. Reports the chosen word. */
export function WordFromTranslationQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  useEffect(() => {
    onAnswerChange(selected);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-7">
      <div className="pt-2 text-center">
        <div className="lr-eyebrow mb-3.5">Choose the word for</div>
        <p className="text-[40px] leading-tight font-extrabold tracking-tight text-balance">
          {prompt.translation}
        </p>
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
