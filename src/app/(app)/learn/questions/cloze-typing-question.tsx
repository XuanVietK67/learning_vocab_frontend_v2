"use client";

import { useEffect, useRef, useState } from "react";

import type { ClozeTypingPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { HintChip } from "./_shared/hint-chip";
import { SentenceBlank } from "./_shared/sentence-blank";
import { useLearnSettings } from "../_chrome/settings-context";

type Props = QuizQuestionProps & { prompt: ClozeTypingPrompt };

/** Fill the blank by typing the word inline. Reports the typed text (trimmed). */
export function ClozeTypingQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const settings = useLearnSettings();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const revealed = result !== null;
  const trimmed = value.trim();

  useEffect(() => {
    onAnswerChange(trimmed.length > 0 ? trimmed : null);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // While answering, the blank is an inline input. On reveal we replace it with
  // the canonical answer (green); the footer reveal-bar surfaces any miss.
  const input = (
    <input
      ref={inputRef}
      value={value}
      disabled={disabled || revealed}
      onChange={(e) => setValue(e.target.value)}
      placeholder="·····"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      enterKeyHint="done"
      aria-label="Your answer"
      style={{ width: `${Math.max(6, value.length + 2)}ch` }}
      className="mx-1 inline-block min-w-22 rounded-t-lg border-b-[3px] border-(--primary) bg-(--primary-soft) px-2.5 text-center align-baseline text-[26px] font-semibold text-(--primary-ink) outline-none placeholder:text-(--ink-3) focus:bg-(--primary-soft-2)"
    />
  );

  return (
    <div className="flex flex-col gap-6">
      {prompt.audioUrl && (
        <div className="flex justify-center">
          <AudioButton src={prompt.audioUrl} size="sm" autoPlay={settings.autoplay} />
        </div>
      )}

      <div className="lr-eyebrow">Type the missing word</div>

      <SentenceBlank
        text={prompt.sentenceWithBlank}
        slot={revealed ? undefined : input}
        value={revealed ? result.correctAnswer : undefined}
        state={revealed ? "ok" : null}
      />
      <HintChip hint={prompt.hintTranslation} />
    </div>
  );
}
