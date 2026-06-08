"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { DictationPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { HintChip } from "./_shared/hint-chip";
import { useLearnSettings } from "../_chrome/settings-context";

type Props = QuizQuestionProps & { prompt: DictationPrompt };

/** Play audio, type the sentence you heard. Reports the typed text (trimmed). */
export function DictationQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const settings = useLearnSettings();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const revealed = result !== null;
  const trimmed = value.trim();

  useEffect(() => {
    onAnswerChange(trimmed.length > 0 ? trimmed : null);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const state = revealed ? (result.correct ? "ok" : "bad") : null;

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
        <div className="lr-eyebrow">Write the sentence you hear</div>
        <HintChip hint={prompt.hintTranslation} />
      </div>

      <textarea
        ref={inputRef}
        rows={2}
        value={value}
        disabled={disabled || revealed}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type what you hear…"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Your answer"
        className={cn(
          "lr-input resize-none",
          state === "ok" && "is-correct",
          state === "bad" && "is-wrong",
        )}
        style={{ fontFamily: "var(--serif)" }}
      />
    </div>
  );
}
