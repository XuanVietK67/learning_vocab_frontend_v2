"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { FLASHCARD_RATINGS, type FlashcardRating } from "@/lib/me/learn/types";
import type { FlashcardQuestionProps } from "./types";
import type { FlashcardPrompt } from "@/lib/me/learn/types";
import { AudioButton } from "./_shared/audio-button";
import { useLearnSettings } from "../_chrome/settings-context";

type Props = FlashcardQuestionProps & { prompt: FlashcardPrompt };

const RATING_LABELS: Record<FlashcardRating, string> = {
  forgot: "Forgot",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

const RATING_CLASSES: Record<FlashcardRating, string> = {
  forgot: "border-(--bad)/40 text-(--bad) hover:bg-(--bad-bg)",
  hard: "border-amber-500/40 text-amber-600 hover:bg-amber-500/10",
  good: "border-border hover:bg-muted",
  easy: "border-(--ok)/40 text-(--ok) hover:bg-(--ok-bg)",
};

const TILE_PALETTE = ["#F26D8F", "#5B8DEF", "#23B79B", "#F6A33C", "#9B6BE8", "#13A97B"];

function tileColor(word: string) {
  let h = 0;
  for (const c of word || "x") h = (h * 31 + c.charCodeAt(0)) % 997;
  return TILE_PALETTE[h % TILE_PALETTE.length];
}

/** Study card: image tile + term, flip to the meaning, then self-rate recall. */
export function FlashcardQuestion({ prompt, disabled, result, onSubmit }: Props) {
  const settings = useLearnSettings();
  const [flipped, setFlipped] = useState(false);
  const revealed = result !== null || flipped;
  const color = tileColor(prompt.lemma);

  // Space/Enter toggles the reveal (ignored while typing elsewhere).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full max-w-[520px] cursor-pointer text-center"
        aria-label={revealed ? "Hide meaning" : "Reveal meaning"}
      >
        {!revealed ? (
          <div className="flex flex-col items-center gap-3.5">
            {settings.showImage && (
              <div
                className="relative grid h-30 w-42 place-items-center rounded-[18px] shadow-[0_12px_26px_-10px_rgba(0,0,0,0.28)]"
                style={{
                  background: `linear-gradient(150deg, ${color}, color-mix(in oklab, ${color}, black 16%))`,
                }}
              >
                <ImageIcon className="size-8 text-white/90" strokeWidth={1.7} />
                {prompt.partOfSpeech && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/25 px-2 py-0.5 text-[10.5px] font-bold text-white backdrop-blur-sm">
                    {prompt.partOfSpeech}
                  </span>
                )}
              </div>
            )}
            <div className="text-[42px] font-bold leading-tight tracking-tight text-balance">
              {prompt.lemma}
            </div>
            {settings.showPhonetic && prompt.ipa && (
              <div className="text-lg italic text-muted-foreground">{prompt.ipa}</div>
            )}
            <div className="text-[13px] font-medium text-muted-foreground/70">Tap to reveal ↻</div>
          </div>
        ) : (
          <div className="learn-anim-in flex flex-col gap-4 text-left">
            {prompt.senses.map((sense, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 border-t border-border pt-3 first:border-t-0 first:pt-0"
              >
                {sense.translation && (
                  <p className="text-center text-2xl font-extrabold text-(--primary-d)">
                    {sense.translation}
                  </p>
                )}
                {sense.gloss && <p className="text-center font-semibold">{sense.gloss}</p>}
                {sense.definition && (
                  <p className="text-center text-base leading-relaxed text-foreground text-pretty">
                    {sense.definition}
                  </p>
                )}
                {sense.example && (
                  <p className="text-center text-[15px] italic text-muted-foreground">
                    “{sense.example.sentence}”
                    {sense.example.translation && ` — ${sense.example.translation}`}
                  </p>
                )}
                {(sense.synonyms.length > 0 || sense.antonyms.length > 0) && (
                  <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                    {sense.synonyms.map((s) => (
                      <span
                        key={`syn-${s}`}
                        className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                    {sense.antonyms.map((a) => (
                      <span
                        key={`ant-${a}`}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground"
                      >
                        ≠ {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </button>

      {/* Audio control */}
      {prompt.audioUrl && (
        <AudioButton
          src={prompt.audioUrl}
          autoPlay={settings.autoplay}
          size="md"
          variant="ghost"
          label="Play pronunciation"
        />
      )}

      {/* Self-rating (only while still ungraded and revealed) */}
      {result === null && flipped && (
        <div className="flex w-full flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground">How well did you know it?</p>
          <div className="grid grid-cols-4 gap-2">
            {FLASHCARD_RATINGS.map((rating) => (
              <button
                key={rating}
                type="button"
                disabled={disabled}
                onClick={() => onSubmit(rating)}
                className={cn(
                  "rounded-[14px] border-[1.5px] py-2.5 text-sm font-bold transition active:scale-[0.98] disabled:opacity-60",
                  RATING_CLASSES[rating],
                )}
              >
                {RATING_LABELS[rating]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
