"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ClozeTypingPrompt } from "@/lib/me/learn/types";
import type { BaseQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { CheckButton } from "./_shared/check-button";
import { HintChip } from "./_shared/hint-chip";
import { SentenceBlank } from "./_shared/sentence-blank";

type Props = BaseQuestionProps & { prompt: ClozeTypingPrompt };

/** Fill the blank by typing the word. Submits the typed text (trimmed). */
export function ClozeTypingQuestion({ prompt, disabled, result, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const revealed = result !== null;
  const trimmed = value.trim();

  function submit() {
    if (!disabled && trimmed.length > 0) onSubmit(trimmed);
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {prompt.audioUrl && <AudioButton src={prompt.audioUrl} />}
      <SentenceBlank text={prompt.sentenceWithBlank} />
      <HintChip hint={prompt.hintTranslation} />

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled || revealed}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder="Type the word…"
        aria-label="Your answer"
        className={cn(
          "h-11 text-base",
          revealed && result.correct && "border-green-600/50",
          revealed && !result.correct && "border-destructive/50",
        )}
      />

      {!revealed && (
        <CheckButton type="submit" disabled={disabled || trimmed.length === 0} />
      )}
    </form>
  );
}
