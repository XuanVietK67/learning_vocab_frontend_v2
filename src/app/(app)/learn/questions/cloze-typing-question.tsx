"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { ClozeTypingPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { HintChip } from "./_shared/hint-chip";
import { SentenceBlank } from "./_shared/sentence-blank";

type Props = QuizQuestionProps & { prompt: ClozeTypingPrompt };

/** Fill the blank by typing the word inline. Reports the typed text (trimmed). */
export function ClozeTypingQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
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

  const input = (
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
      style={{ width: `${Math.max(8, value.length + 2)}ch` }}
      className={cn(
        "mx-1 inline-block rounded-t-md border-b-[2.5px] bg-secondary px-2 py-0.5 text-center align-baseline text-[22px] font-bold text-(--primary-d) outline-none placeholder:tracking-widest placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30",
        state === "ok" && "border-(--ok) bg-(--ok-bg) text-(--ok)",
        state === "bad" && "border-(--bad) bg-(--bad-bg) text-(--bad)",
        !state && "border-primary",
      )}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      {prompt.audioUrl && (
        <div className="flex justify-center">
          <AudioButton src={prompt.audioUrl} size="sm" variant="ghost" />
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Complete the sentence by typing the missing word.
      </p>

      <SentenceBlank text={prompt.sentenceWithBlank} slot={input} size="lg" />
      <HintChip hint={prompt.hintTranslation} />

      {revealed && !result.correct && (
        <p className="text-center text-sm text-muted-foreground">
          Answer: <b className="text-(--ok)">{result.correctAnswer}</b>
        </p>
      )}
    </div>
  );
}
