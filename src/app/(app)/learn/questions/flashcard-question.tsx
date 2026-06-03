"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FLASHCARD_RATINGS,
  type FlashcardPrompt,
  type FlashcardRating,
} from "@/lib/me/learn/types";
import type { BaseQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";

type Props = BaseQuestionProps & { prompt: FlashcardPrompt };

const RATING_LABELS: Record<FlashcardRating, string> = {
  forgot: "Forgot",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

const RATING_CLASSES: Record<FlashcardRating, string> = {
  forgot: "border-destructive/40 text-destructive hover:bg-destructive/10",
  hard: "border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400",
  good: "border-border hover:bg-muted",
  easy: "border-green-600/40 text-green-700 hover:bg-green-600/10 dark:text-green-400",
};

/** Study card: reveal the word's meaning, then self-rate recall. */
export function FlashcardQuestion({ prompt, disabled, result, onSubmit }: Props) {
  const [flipped, setFlipped] = useState(false);
  const revealed = result !== null || flipped;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-8 text-center">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            {prompt.lemma}
          </h2>
          {prompt.audioUrl && <AudioButton src={prompt.audioUrl} label="Play pronunciation" />}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {prompt.ipa && <span>{prompt.ipa}</span>}
          {prompt.partOfSpeech && <Badge variant="secondary">{prompt.partOfSpeech}</Badge>}
        </div>

        {!revealed && (
          <p className="mt-2 text-sm text-muted-foreground">Tap reveal when you&apos;ve recalled it.</p>
        )}

        {revealed && (
          <div className="mt-2 flex w-full flex-col gap-4 text-left">
            {prompt.senses.map((sense, index) => (
              <div key={index} className="flex flex-col gap-1 border-t border-border pt-3 first:border-t-0 first:pt-0">
                {sense.gloss && <p className="font-medium">{sense.gloss}</p>}
                {sense.definition && (
                  <p className="text-sm text-muted-foreground">{sense.definition}</p>
                )}
                {sense.translation && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Translation: </span>
                    {sense.translation}
                  </p>
                )}
                {sense.example && (
                  <p className="mt-1 text-sm italic text-muted-foreground">
                    “{sense.example.sentence}”
                    {sense.example.translation && ` — ${sense.example.translation}`}
                  </p>
                )}
                {(sense.synonyms.length > 0 || sense.antonyms.length > 0) && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {sense.synonyms.map((s) => (
                      <Badge key={`syn-${s}`} variant="outline">
                        {s}
                      </Badge>
                    ))}
                    {sense.antonyms.map((a) => (
                      <Badge key={`ant-${a}`} variant="ghost">
                        ≠ {a}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive controls (hidden once graded — the runner shows Continue) */}
      {result === null && !flipped && (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full text-base"
          onClick={() => setFlipped(true)}
        >
          Reveal answer
        </Button>
      )}

      {result === null && flipped && (
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground">How well did you know it?</p>
          <div className="grid grid-cols-4 gap-2">
            {FLASHCARD_RATINGS.map((rating) => (
              <Button
                key={rating}
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => onSubmit(rating)}
                className={cn("h-11 text-sm", RATING_CLASSES[rating])}
              >
                {RATING_LABELS[rating]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
