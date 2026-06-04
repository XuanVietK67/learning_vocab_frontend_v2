"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { SentenceBuildPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";

type Props = QuizQuestionProps & { prompt: SentenceBuildPrompt };

/**
 * Assemble the target sentence from shuffled tokens. Tracks placement by token
 * index (tokens can repeat) and reports the space-joined result once every token
 * is placed.
 */
export function SentenceBuildQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const { tokens } = prompt;
  const [placed, setPlaced] = useState<number[]>([]);
  const revealed = result !== null;

  const inBank = tokens.map((_, i) => i).filter((i) => !placed.includes(i));
  const allPlaced = placed.length === tokens.length;
  const answer = placed.map((i) => tokens[i]).join(" ");

  useEffect(() => {
    onAnswerChange(allPlaced ? answer : null);
  }, [placed]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <p className="text-center text-sm text-muted-foreground">
        Arrange the words into the right order.
        <span className="mt-1 block text-base font-semibold text-foreground text-balance">
          {prompt.translation}
        </span>
      </p>

      {/* Answer tray */}
      <div
        className={cn(
          "flex min-h-18.5 flex-wrap content-start items-center gap-2 rounded-2xl border-2 border-dashed p-3",
          revealed && result.correct && "border-(--ok) border-solid bg-(--ok-bg)",
          revealed && !result.correct && "border-(--bad) border-solid bg-(--bad-bg)",
          !revealed && "border-border bg-[#fafbfc]",
        )}
      >
        {placed.length === 0 && (
          <span className="m-auto text-sm font-semibold text-muted-foreground">
            Tap words to build the sentence…
          </span>
        )}
        {placed.map((tokenIndex) => (
          <button
            key={tokenIndex}
            type="button"
            disabled={disabled || revealed}
            onClick={() => remove(tokenIndex)}
            className="rounded-xl border-[1.5px] border-primary bg-secondary px-3.5 py-2 text-base font-bold text-(--primary-d) transition active:translate-y-0.5 disabled:cursor-default"
          >
            {tokens[tokenIndex]}
          </button>
        ))}
      </div>

      {/* Token bank */}
      {!revealed && (
        <div className="flex min-h-12 flex-wrap gap-2">
          {inBank.map((tokenIndex) => (
            <button
              key={tokenIndex}
              type="button"
              disabled={disabled}
              onClick={() => place(tokenIndex)}
              className="rounded-xl border-[1.5px] border-border bg-card px-3.5 py-2 text-base font-bold text-foreground shadow-[0_2px_0_var(--line)] transition hover:border-primary/45 active:translate-y-0.5 active:shadow-none"
            >
              {tokens[tokenIndex]}
            </button>
          ))}
        </div>
      )}

      {revealed && !result.correct && (
        <p className="text-center text-sm text-muted-foreground">
          Answer: <b className="text-foreground">{result.correctAnswer}</b>
        </p>
      )}
    </div>
  );
}
