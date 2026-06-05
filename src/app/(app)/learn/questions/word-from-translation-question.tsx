"use client";

import { useEffect, useState } from "react";

import type { WordFromTranslationPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { OptionList } from "./_shared/option-list";

type Props = QuizQuestionProps & { prompt: WordFromTranslationPrompt };

/** Show the translation, pick the matching word. Reports the chosen word. */
export function WordFromTranslationQuestion({
  prompt,
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
      <div className="rounded-2xl bg-muted/60 px-5 py-6 text-center">
        <p className="text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
          Which word means
        </p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-(--primary-d) text-balance">
          {prompt.translation}
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
