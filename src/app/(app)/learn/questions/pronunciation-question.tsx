"use client";

import { useEffect, useState } from "react";
import { MicIcon, SquareIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PronunciationPrompt } from "@/lib/me/learn/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { useSpeechRecognition } from "./_shared/use-speech-recognition";

type Props = QuizQuestionProps & { prompt: PronunciationPrompt };

/**
 * Show the word; the user taps to speak it. On Chromium we run the Web Speech
 * API and submit the transcript; where it's unsupported (Firefox/Safari) we fall
 * back to a typed answer so the step is still answerable. Reports the transcript
 * (or typed text); the server grades it leniently against the lemma.
 */
export function PronunciationQuestion({ prompt, disabled, result, onAnswerChange }: Props) {
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
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
          Say this word
        </p>
        <div className="text-[42px] font-bold leading-tight tracking-tight text-balance">
          {prompt.lemma}
        </div>
        {prompt.ipa && <div className="text-lg italic text-muted-foreground">{prompt.ipa}</div>}
      </div>

      {prompt.audioUrl && (
        <AudioButton
          src={prompt.audioUrl}
          size="md"
          variant="ghost"
          label="Hear the pronunciation"
        />
      )}

      {supported ? (
        <div className="flex w-full flex-col items-center gap-3">
          <button
            type="button"
            disabled={disabled || revealed}
            onClick={() => (listening ? stop() : start())}
            aria-label={listening ? "Stop recording" : "Start recording"}
            className={cn(
              "relative grid size-18 place-items-center rounded-full text-white transition active:scale-95 disabled:opacity-60 [&_svg]:size-7",
              listening
                ? "bg-(--bad) shadow-[0_4px_16px_-4px_rgba(176,34,58,0.5)]"
                : "bg-primary shadow-[0_4px_16px_-4px_rgba(19,169,123,0.5)]",
            )}
          >
            {listening && (
              <span
                className="absolute inset-0 animate-ping rounded-full border-[3px] border-(--bad)/50"
                aria-hidden="true"
              />
            )}
            {listening ? <SquareIcon strokeWidth={2.4} /> : <MicIcon strokeWidth={2.2} />}
          </button>
          <span className="text-[13px] font-bold text-muted-foreground">
            {listening ? "Listening… tap to stop" : "Tap to speak"}
          </span>

          {spoken && (
            <p className="text-center text-base">
              You said: <b className="text-foreground">{spoken}</b>
            </p>
          )}
          {error && !spoken && (
            <p className="text-center text-sm text-(--bad)">
              Couldn’t hear that — tap the mic to try again.
            </p>
          )}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-center text-sm text-muted-foreground">
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
            className="w-full max-w-[320px] rounded-[14px] border-[2.5px] border-primary bg-secondary px-4 py-3 text-center text-[22px] font-bold text-(--primary-d) outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}

      {revealed && !result.correct && (
        <p className="text-center text-sm text-muted-foreground">
          Answer: <b className="text-(--ok)">{result.correctAnswer}</b>
        </p>
      )}
    </div>
  );
}
