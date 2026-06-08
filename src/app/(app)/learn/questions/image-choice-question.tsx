"use client";

import { useEffect, useState } from "react";

import type { ImageChoicePrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { ImageTile } from "./_shared/image-tile";
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3.5">
        <ImageTile
          src={prompt.imageUrl}
          alt="Pick the matching word"
          className="size-37"
          float
        />
        <div className="lr-eyebrow">Which word matches the picture?</div>
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
