"use client";

import { useState } from "react";

import type { ListeningClozePrompt } from "@/lib/me/learn/types";
import type { BaseQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { CheckButton } from "./_shared/check-button";
import { HintChip } from "./_shared/hint-chip";
import { OptionList } from "./_shared/option-list";
import { SentenceBlank } from "./_shared/sentence-blank";

type Props = BaseQuestionProps & { prompt: ListeningClozePrompt };

/** Listen, then fill the blank from the options. Submits the chosen option text. */
export function ListeningClozeQuestion({ prompt, disabled, result, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center py-2">
        {prompt.audioUrl ? (
          <AudioButton src={prompt.audioUrl} autoPlay label="Replay audio" />
        ) : (
          <p className="text-sm text-muted-foreground">Audio unavailable</p>
        )}
      </div>

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
