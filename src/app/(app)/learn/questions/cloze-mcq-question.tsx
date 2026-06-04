"use client";

import { useEffect, useState } from "react";

import type { ClozeMcqPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { HintChip } from "./_shared/hint-chip";
import { OptionList } from "./_shared/option-list";
import { SentenceBlank } from "./_shared/sentence-blank";

type Props = QuizQuestionProps & { prompt: ClozeMcqPrompt };

/** Fill the blank by choosing one option. Reports the chosen option text. */
export function ClozeMcqQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  useEffect(() => {
    onAnswerChange(selected);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const blankState =
    revealed && selected !== null ? (selected === result.correctAnswer ? "ok" : "bad") : null;

  return (
    <div className="flex flex-col gap-5">
      {prompt.audioUrl && (
        <div className="flex justify-center">
          <AudioButton src={prompt.audioUrl} size="sm" variant="ghost" />
        </div>
      )}

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
