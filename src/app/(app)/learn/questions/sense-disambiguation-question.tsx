"use client";

import { useState } from "react";

import type { SenseDisambiguationPrompt } from "@/lib/me/learn/types";
import type { BaseQuestionProps } from "./types";
import { CheckButton } from "./_shared/check-button";
import { OptionList } from "./_shared/option-list";

type Props = BaseQuestionProps & { prompt: SenseDisambiguationPrompt };

/**
 * Disambiguate the studied word across example sentences, then pick the meaning
 * that applies. The contract grades a single chosen meaning, so the sentences
 * are shown as context and the options are a single-select of meanings.
 */
export function SenseDisambiguationQuestion({
  prompt,
  lemma,
  disabled,
  result,
  onSubmit,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Which meaning matches how{" "}
        <span className="font-semibold text-foreground">{lemma}</span> is used?
      </p>

      <ul className="flex flex-col gap-2">
        {prompt.sentences.map((s, index) => (
          <li
            key={s.exampleId}
            className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-base leading-relaxed"
          >
            <span className="mr-2 text-xs font-medium text-muted-foreground">
              {index + 1}.
            </span>
            {s.sentence}
          </li>
        ))}
      </ul>

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
