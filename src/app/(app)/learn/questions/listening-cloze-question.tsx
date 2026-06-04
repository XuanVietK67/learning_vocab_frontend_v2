"use client";

import { useEffect, useState } from "react";

import type { ListeningClozePrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { HintChip } from "./_shared/hint-chip";
import { OptionList } from "./_shared/option-list";
import { SentenceBlank } from "./_shared/sentence-blank";

type Props = QuizQuestionProps & { prompt: ListeningClozePrompt };

/** Listen, then fill the blank from the options. Reports the chosen option text. */
export function ListeningClozeQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  useEffect(() => {
    onAnswerChange(selected);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const blankState =
    revealed && selected !== null ? (selected === result.correctAnswer ? "ok" : "bad") : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 py-1">
        {prompt.audioUrl ? (
          <div className="relative grid place-items-center p-3">
            <span className="learn-orb-ring" aria-hidden="true" />
            <AudioButton src={prompt.audioUrl} autoPlay size="lg" label="Replay audio" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Audio unavailable</p>
        )}
        <span className="text-[13px] font-bold text-muted-foreground">Tap to replay</span>
      </div>

      <SentenceBlank text={prompt.sentenceWithBlank} value={selected} state={blankState} />
      <HintChip hint={prompt.hintTranslation} />

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
