"use client";

import { useEffect, useState } from "react";

import type { ImageChoicePrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { OptionList } from "./_shared/option-list";

type Props = QuizQuestionProps & { prompt: ImageChoicePrompt };

/** Show the image, pick the matching word. Reports the chosen word. */
export function ImageChoiceQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = result !== null;

  useEffect(() => {
    onAnswerChange(selected);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center">
        {/* Arbitrary backend-supplied URL — not a configured next/image host. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={prompt.imageUrl}
          alt="Pick the matching word"
          loading="lazy"
          className="h-44 w-full max-w-[320px] rounded-[18px] object-cover shadow-[0_12px_26px_-10px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-foreground/10"
        />
      </div>

      <p className="text-center text-base font-semibold">Which word matches this picture?</p>

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
