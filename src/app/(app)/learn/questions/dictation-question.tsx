"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { DictationPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { HintChip } from "./_shared/hint-chip";

type Props = QuizQuestionProps & { prompt: DictationPrompt };

/** Play audio, type the word you heard. Reports the typed text (trimmed). */
export function DictationQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
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

  const state = revealed ? (result.correct ? "ok" : "bad") : null;

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
        <span className="text-[13px] font-bold text-muted-foreground">Type the word you hear</span>
      </div>

      <div className="flex justify-center">
        <input
          ref={inputRef}
          value={value}
          disabled={disabled || revealed}
          onChange={(e) => setValue(e.target.value)}
          placeholder="········"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label="Your answer"
          className={cn(
            "w-full max-w-[320px] rounded-[14px] border-[2.5px] bg-secondary px-4 py-3 text-center text-[22px] font-bold text-(--primary-d) outline-none placeholder:tracking-widest placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30",
            state === "ok" && "border-(--ok) bg-(--ok-bg) text-(--ok)",
            state === "bad" && "border-(--bad) bg-(--bad-bg) text-(--bad)",
            !state && "border-primary",
          )}
        />
      </div>

      <HintChip hint={prompt.hintTranslation} />

      {revealed && !result.correct && (
        <p className="text-center text-sm text-muted-foreground">
          Answer: <b className="text-(--ok)">{result.correctAnswer}</b>
        </p>
      )}
    </div>
  );
}
