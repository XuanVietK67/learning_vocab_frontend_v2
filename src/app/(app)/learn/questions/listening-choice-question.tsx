"use client";

import { useEffect, useState } from "react";

import type { ListeningChoicePrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { OptionList } from "./_shared/option-list";
import { useLearnSettings } from "../_chrome/settings-context";

type Props = QuizQuestionProps & { prompt: ListeningChoicePrompt };

/** Listen, then pick the matching word. Reports the chosen word. */
export function ListeningChoiceQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const settings = useLearnSettings();
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  useEffect(() => {
    onAnswerChange(selected);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2.5">
        {prompt.audioUrl ? (
          <AudioButton
            src={prompt.audioUrl}
            autoPlay={settings.autoplay}
            size="lg"
            tone="violet"
            label="Replay audio"
          />
        ) : (
          <p className="text-sm text-(--ink-3)">Audio unavailable</p>
        )}
        <div className="lr-eyebrow">Which word did you hear?</div>
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
