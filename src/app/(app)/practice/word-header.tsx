"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon, SearchIcon } from "lucide-react";

import { AudioButton } from "@/app/(app)/learn/questions/_shared/audio-button";
import type { PracticeWord } from "@/lib/me/practice/types";
import { listPronunciationScoresAction } from "./practice-actions";
import { Sparkline } from "./_shared/sparkline";

/**
 * The constant top of the Practice screen — shared across both mode tabs and all
 * states. Carries the serif lemma, IPA (hidden when null), reference-audio orb
 * (hidden when null), gloss, a back/switch affordance to the hub, and a per-word
 * "Your attempts" history strip. The history is the word's Speak scores
 * (`GET /v1/pronunciation/attempts`) plus any scores earned this session.
 */
export function WordHeader({
  word,
  sessionScores,
  onExit,
}: {
  word: PracticeWord;
  sessionScores: number[];
  onExit: () => void;
}) {
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    void listPronunciationScoresAction(word.vocabularyId).then((scores) => {
      if (active) setHistory(scores);
    });
    return () => {
      active = false;
    };
  }, [word.vocabularyId]);

  const attempts = [...history, ...sessionScores];
  const recent = attempts.slice(-3);

  return (
    <div className="lr-card mb-[18px] p-[22px_26px]">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="-ml-1 flex items-center gap-1.5 rounded-[10px] py-1 pr-2 pl-1 text-sm font-bold text-(--ink-2) transition-colors hover:text-(--ink)"
        >
          <ChevronLeftIcon className="size-5" /> Practice
        </button>
        <button
          type="button"
          onClick={onExit}
          className="lr-chip cursor-pointer transition-colors hover:bg-(--card-2)"
        >
          <SearchIcon className="size-4" /> Switch word
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
            <span className="lr-word text-[44px]">{word.lemma}</span>
            {word.ipa && <span className="lr-ipa text-[20px]">{word.ipa}</span>}
          </div>
          {(word.pos || word.gloss) && (
            <div className="mt-[7px] text-[15.5px] text-(--ink-2)">
              {word.pos}
              {word.pos && word.gloss ? " · " : ""}
              {word.gloss ? `“${word.gloss}”` : ""}
            </div>
          )}
        </div>
        {word.audioUrl && (
          <AudioButton src={word.audioUrl} size="md" label="Play reference pronunciation" />
        )}
      </div>

      <hr className="my-[14px] border-none" style={{ height: 1, background: "var(--line)" }} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="lr-eyebrow">Your attempts</span>
          {attempts.length >= 2 ? (
            <>
              <Sparkline data={attempts} />
              <span className="tnum text-[13.5px] font-bold text-(--ink-2)">{recent.join(" · ")}</span>
            </>
          ) : (
            <span className="text-[13.5px] font-semibold text-(--ink-3)">
              No attempts yet — your scores will track here.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
