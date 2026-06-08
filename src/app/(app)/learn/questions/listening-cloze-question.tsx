"use client";

import { useEffect, useState } from "react";

import type { ListeningClozePrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { HintChip } from "./_shared/hint-chip";
import { OptionList } from "./_shared/option-list";
import { SentenceBlank } from "./_shared/sentence-blank";
import { useLearnSettings } from "../_chrome/settings-context";

type Props = QuizQuestionProps & { prompt: ListeningClozePrompt };

/** Listen, then fill the blank from the options. Reports the chosen option text. */
export function ListeningClozeQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
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
            label="Replay sentence"
          />
        ) : (
          <p className="text-sm text-(--ink-3)">Audio unavailable</p>
        )}
        <span className="text-[13px] font-semibold text-(--ink-3)">Tap to replay</span>
      </div>

      <SentenceBlank
        text={prompt.sentenceWithBlank}
        value={revealed ? result.correctAnswer : selected}
        state={revealed ? "ok" : null}
        size="sm"
      />
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
