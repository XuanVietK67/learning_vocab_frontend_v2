"use client";

import { useCallback, useState } from "react";

import type { PracticeWord } from "@/lib/me/practice/types";
import { ModeTabs, type PracticeMode } from "./mode-tabs";
import { PracticeHub } from "./practice-hub";
import { SpeakMode } from "./speak-mode";
import { WordHeader } from "./word-header";
import { WriteMode } from "./write-mode";

/**
 * Client root of the Practice surface. Owns the two pieces of screen state — the
 * selected `word` (null ⇒ the hub) and the active `mode` — and threads
 * session-earned scores into the shared header's history strip. The header stays
 * mounted across tab switches; only the mode panel swaps. Keyed by
 * `vocabularyId` so switching words resets both panels cleanly.
 */
export function PracticeScreen({
  initialWord,
  initialWords,
}: {
  initialWord: PracticeWord | null;
  initialWords: PracticeWord[];
}) {
  const [word, setWord] = useState<PracticeWord | null>(initialWord);
  const [mode, setMode] = useState<PracticeMode>("write");
  const [sessionScores, setSessionScores] = useState<Record<string, number[]>>({});

  const pick = useCallback((next: PracticeWord, nextMode: PracticeMode = "write") => {
    setWord(next);
    setMode(nextMode);
  }, []);

  const recordScore = useCallback(
    (score: number) => {
      if (!word) return;
      setSessionScores((prev) => ({
        ...prev,
        [word.vocabularyId]: [...(prev[word.vocabularyId] ?? []), score],
      }));
    },
    [word],
  );

  if (!word) {
    return (
      <div className="mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6 lg:py-10">
        <PracticeHub initialWords={initialWords} onPick={pick} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6 lg:py-10">
      <div key={word.vocabularyId} className="lr-stagger">
        <WordHeader
          word={word}
          sessionScores={sessionScores[word.vocabularyId] ?? []}
          onExit={() => setWord(null)}
        />
        <ModeTabs mode={mode} onChange={setMode} />
        {mode === "write" ? (
          <WriteMode word={word} onSwitchMode={setMode} onScored={recordScore} />
        ) : (
          <SpeakMode word={word} onSwitchMode={setMode} onScored={recordScore} />
        )}
      </div>
    </div>
  );
}
