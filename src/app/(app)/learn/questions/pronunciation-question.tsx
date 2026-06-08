"use client";

import { useEffect, useState } from "react";
import { MicIcon, SquareIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PronunciationPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { useSpeechRecognition } from "./_shared/use-speech-recognition";
import { useLearnSettings } from "../_chrome/settings-context";

type Props = QuizQuestionProps & { prompt: PronunciationPrompt };

/**
 * Show the word; the user taps to speak it. On Chromium we run the Web Speech
 * API and submit the transcript; where it's unsupported (Firefox/Safari) we fall
 * back to a typed answer so the step is still answerable. Reports the transcript
 * (or typed text); the server grades it leniently against the lemma.
 */
export function PronunciationQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
  const settings = useLearnSettings();
  const { supported, listening, transcript, error, start, stop } = useSpeechRecognition();
  const [typed, setTyped] = useState("");
  const revealed = result !== null;

  const spoken = transcript.trim();
  const typedTrim = typed.trim();

  useEffect(() => {
    const answer = supported ? spoken : typedTrim;
    onAnswerChange(answer.length > 0 ? answer : null);
  }, [supported, spoken, typedTrim]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="lr-eyebrow">Say this word aloud</div>
      <div className="lr-word text-[48px]">{prompt.lemma}</div>
      {settings.showPhonetic && prompt.ipa && <div className="lr-ipa text-[22px]">{prompt.ipa}</div>}

      {prompt.audioUrl && (
        <div className="flex items-center gap-2 text-[13px] font-semibold text-(--ink-3)">
          <AudioButton src={prompt.audioUrl} size="sm" label="Hear the pronunciation" />
          reference
        </div>
      )}

      {supported ? (
        <div className="flex w-full flex-col items-center gap-3">
          <button
            type="button"
            disabled={disabled || revealed}
            onClick={() => (listening ? stop() : start())}
            aria-label={listening ? "Stop recording" : "Start recording"}
            className={cn("lr-mic", listening && "recording")}
          >
            <span className="pulse" />
            {listening ? (
              <SquareIcon className="size-8" strokeWidth={2.4} />
            ) : (
              <MicIcon className="size-9" strokeWidth={2.1} />
            )}
          </button>
          <span className="text-sm font-bold text-(--ink-2)">
            {listening ? "Listening… tap to stop" : "Tap to speak"}
          </span>

          {spoken && (
            <p className="text-base">
              You said: <b className="text-(--ink)">{spoken}</b>
            </p>
          )}
          {error && !spoken && (
            <p className="text-sm text-(--bad-ink)">Couldn’t hear that — tap the mic to try again.</p>
          )}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-sm text-(--ink-2)">
            Speech recognition isn’t available in this browser — type what you’d say instead.
          </p>
          <input
            value={typed}
            disabled={disabled || revealed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={prompt.lemma}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-label="Type what you'd say"
            className="lr-input max-w-80 text-center"
          />
        </div>
      )}
    </div>
  );
}
