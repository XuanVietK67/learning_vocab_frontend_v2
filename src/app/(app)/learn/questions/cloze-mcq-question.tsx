"use client";

import { useState } from "react";

import type { ClozeMcqPrompt } from "@/lib/me/learn/types";
import type { BaseQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { CheckButton } from "./_shared/check-button";
import { HintChip } from "./_shared/hint-chip";
import { OptionList } from "./_shared/option-list";
import { SentenceBlank } from "./_shared/sentence-blank";

type Props = BaseQuestionProps & { prompt: ClozeMcqPrompt };

/** Fill the blank by choosing one option. Submits the chosen option text. */
export function ClozeMcqQuestion({ prompt, disabled, result, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  return (
    <div className="flex flex-col gap-5">
      {prompt.audioUrl && <AudioButton src={prompt.audioUrl} />}
      <SentenceBlank text={prompt.sentenceWithBlank} />
      <HintChip hint={prompt.hintTranslation} />

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
