"use client";

import { useState } from "react";

import type { MeaningInContextPrompt } from "@/lib/me/learn/types";
import type { BaseQuestionProps } from "./types";
import { CheckButton } from "./_shared/check-button";
import { OptionList } from "./_shared/option-list";

type Props = BaseQuestionProps & { prompt: MeaningInContextPrompt };

/** Pick the meaning that fits the highlighted word. Submits the chosen text. */
export function MeaningInContextQuestion({ prompt, disabled, result, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  const { sentence, highlightedSpan } = prompt;
  const before = sentence.slice(0, highlightedSpan.start);
  const span = sentence.slice(highlightedSpan.start, highlightedSpan.end);
  const after = sentence.slice(highlightedSpan.end);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-lg leading-relaxed text-balance">
        {before}
        <mark className="rounded bg-primary/15 px-1 font-semibold text-foreground">
          {span}
        </mark>
        {after}
      </p>
      <p className="text-sm text-muted-foreground">
        What does the highlighted word mean here?
      </p>

      <OptionList
        options={prompt.options}
        selected={selected}
        onSelect={setSelected}
        disabled={disabled || revealed}
        correctAnswer={revealed ? result.correctAnswer : null}
      />

      {!revealed && (
        <CheckButton
          disabled={disabled || selected === null}
          onClick={() => selected !== null && onSubmit(selected)}
        />
      )}
    </div>
  );
}
