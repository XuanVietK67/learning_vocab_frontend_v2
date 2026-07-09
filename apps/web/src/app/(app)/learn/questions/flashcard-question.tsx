"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "lucide-react";

import type { FlashcardPrompt } from "@/lib/me/learn/types";
import type { FlashcardQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { ImageTile } from "./_shared/image-tile";
import { useLearnSettings } from "../_chrome/settings-context";

type Props = FlashcardQuestionProps & { prompt: FlashcardPrompt };

/** Study card: term + image tile, flip to the meaning, then one tap to continue. */
export function FlashcardQuestion({ prompt, disabled, result, onSubmit }: Props) {
  const settings = useLearnSettings();
  const [flipped, setFlipped] = useState(false);
  const revealed = result !== null || flipped;

  // Keyboard: Space flips the card; Enter reveals it, then commits ("Got it").
  // Ignored while typing elsewhere, once graded, or mid-submit.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (result !== null || disabled) return;
        if (flipped) onSubmit("good");
        else setFlipped(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, result, disabled, onSubmit]);

  return (
    <div className="flex flex-1 flex-col">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex flex-1 cursor-pointer flex-col text-left"
        aria-label={revealed ? "Hide meaning" : "Reveal meaning"}
      >
        {!revealed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            {settings.showImage && <ImageTile alt="" className="size-33" float />}
            <div>
              <div className="lr-word text-[52px]">{prompt.lemma}</div>
              {settings.showPhonetic && prompt.ipa && (
                <div className="lr-ipa mt-1.5 text-[22px]">{prompt.ipa}</div>
              )}
              {prompt.partOfSpeech && (
                <div className="mt-2 text-sm font-medium text-(--ink-2)">{prompt.partOfSpeech}</div>
              )}
            </div>
            <span className="lr-btn lr-btn--soft lr-btn--md">Tap to reveal</span>
          </div>
        ) : (
          <div className="learn-anim-in flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="lr-word text-[34px]">{prompt.lemma}</span>
              {settings.showPhonetic && prompt.ipa && (
                <span className="lr-ipa text-[17px]">{prompt.ipa}</span>
              )}
            </div>
            {prompt.senses.map((sense, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 border-t border-(--line) pt-3 first:border-t-0 first:pt-0"
              >
                {sense.translation && (
                  <p className="text-2xl font-extrabold text-(--primary-ink)">{sense.translation}</p>
                )}
                {sense.gloss && <p className="font-semibold">{sense.gloss}</p>}
                {sense.definition && (
                  <p className="text-base leading-relaxed text-pretty">{sense.definition}</p>
                )}
                {sense.example && (
                  <div className="mt-1 rounded-2xl bg-(--card-2) px-4 py-3">
                    <p className="lr-word text-lg italic">“{sense.example.sentence}”</p>
                    {sense.example.translation && (
                      <p className="mt-1 text-sm text-(--ink-2)">{sense.example.translation}</p>
                    )}
                  </div>
                )}
                {(sense.synonyms.length > 0 || sense.antonyms.length > 0) && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {sense.synonyms.map((s) => (
                      <span key={`syn-${s}`} className="lr-chip px-2.5 py-1 text-xs">
                        {s}
                      </span>
                    ))}
                    {sense.antonyms.map((a) => (
                      <span key={`ant-${a}`} className="lr-chip px-2.5 py-1 text-xs">
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
        <div className="mt-4 flex justify-center">
          <AudioButton
            src={prompt.audioUrl}
            autoPlay={settings.autoplay}
            size="sm"
            label="Play pronunciation"
          />
        </div>
      )}

      {/* Commit control — one tap to continue (only while ungraded and revealed) */}
      {result === null && flipped && (
        <div className="mt-4">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSubmit("good")}
            className="lr-btn lr-btn--primary lr-btn--lg lr-btn--block"
          >
            Got it
            <ArrowRightIcon className="size-5" strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}
