"use client";

import { useEffect, useState } from "react";

import type { ClozeMcqPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { OptionList } from "./_shared/option-list";
import { SentenceBlank } from "./_shared/sentence-blank";
import { SentenceGloss } from "./_shared/sentence-gloss";
import { useLearnSettings } from "../_chrome/settings-context";

type Props = QuizQuestionProps & { prompt: ClozeMcqPrompt };

/** Fill the blank by choosing one option. Reports the chosen option text. */
export function ClozeMcqQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const settings = useLearnSettings();
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  useEffect(() => {
    onAnswerChange(selected);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-6">
      {prompt.audioUrl && (
        <div className="flex justify-center">
          <AudioButton src={prompt.audioUrl} size="sm" autoPlay={settings.autoplay} />
        </div>
      )}

      <div>
        <SentenceBlank
          text={prompt.sentenceWithBlank}
          value={revealed ? result.correctAnswer : selected}
          state={revealed ? "ok" : null}
        />
        {revealed && <SentenceGloss translation={prompt.hintTranslation} />}
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
