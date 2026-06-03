"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { SentenceBuildPrompt } from "@/lib/me/learn/types";
import type { BaseQuestionProps } from "./types";
import { CheckButton } from "./_shared/check-button";

type Props = BaseQuestionProps & { prompt: SentenceBuildPrompt };

/**
 * Assemble the target sentence from shuffled tokens. Tracks placement by token
 * index (tokens can repeat) and submits the space-joined result.
 */
export function SentenceBuildQuestion({ prompt, disabled, result, onSubmit }: Props) {
  const { tokens } = prompt;
  const [placed, setPlaced] = useState<number[]>([]);
  const revealed = result !== null;

  const inBank = tokens.map((_, i) => i).filter((i) => !placed.includes(i));
  const allPlaced = placed.length === tokens.length;
  const answer = placed.map((i) => tokens[i]).join(" ");

  function place(index: number) {
    if (disabled || revealed) return;
    setPlaced((prev) => [...prev, index]);
  }
  function remove(index: number) {
    if (disabled || revealed) return;
    setPlaced((prev) => prev.filter((i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Build this sentence:
        <span className="mt-1 block text-base font-medium text-foreground text-balance">
          {prompt.translation}
        </span>
      </p>

      {/* Answer tray */}
      <div
        className={cn(
          "flex min-h-14 flex-wrap content-start gap-2 rounded-xl border border-dashed p-3",
          revealed && result.correct && "border-green-600/50 bg-green-600/5",
          revealed && !result.correct && "border-destructive/50 bg-destructive/5",
          !revealed && "border-border bg-muted/30",
        )}
      >
        {placed.length === 0 && (
          <span className="text-sm text-muted-foreground">Tap words to build the sentence…</span>
        )}
        {placed.map((tokenIndex) => (
          <button
            key={tokenIndex}
            type="button"
            disabled={disabled || revealed}
            onClick={() => remove(tokenIndex)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm shadow-sm disabled:cursor-default"
          >
            {tokens[tokenIndex]}
          </button>
        ))}
      </div>

      {/* Token bank */}
      {!revealed && (
        <div className="flex flex-wrap gap-2">
          {inBank.map((tokenIndex) => (
            <button
              key={tokenIndex}
              type="button"
              disabled={disabled}
              onClick={() => place(tokenIndex)}
              className="rounded-lg border border-border bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-muted/70"
            >
              {tokens[tokenIndex]}
            </button>
          ))}
        </div>
      )}

      {revealed && !result.correct && (
        <p className="text-sm text-muted-foreground">
          Answer: <span className="font-medium text-foreground">{result.correctAnswer}</span>
        </p>
      )}

      {!revealed && (
        <CheckButton
          disabled={disabled || !allPlaced}
          onClick={() => onSubmit(answer)}
        />
      )}
    </div>
  );
}
