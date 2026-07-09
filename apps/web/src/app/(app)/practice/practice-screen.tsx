"use client";

import { useCallback, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { practiceItemToWord, practiceWordToItem } from "@/lib/me/practice/item";
import type { PracticeItem, PracticeSuggestions, PracticeWord } from "@/lib/me/practice/types";
import type { PickTopic } from "@/lib/me/practice/queue";
import { ModeTabs, type PracticeMode } from "./mode-tabs";
import { PracticeHub } from "./practice-hub";
import { SpeakMode } from "./speak-mode";
import { WordHeader } from "./word-header";
import { WriteMode } from "./write-mode";

/**
 * Client root of the Practice surface. Owns the **queue** the learner builds in
 * the hub (Quick start + Hand-pick) and the cursor into it (`activeIndex`); when
 * the cursor is null we show the queue-builder hub, otherwise the word-anchored
 * runner for `queue[activeIndex]`. The `?word=` deep-link bypasses the hub by
 * seeding a one-item queue. The runner panels are unchanged — they take a single
 * {@link PracticeWord}; a slim queue bar walks the cursor through the rest.
 */
export function PracticeScreen({
  initialWord,
  initialSuggestions,
  defaultCount,
  topics,
}: {
  initialWord: PracticeWord | null;
  initialSuggestions: PracticeSuggestions;
  defaultCount: number;
  topics: PickTopic[];
}) {
  // Deep-link → a one-item queue, dropped straight into the runner.
  const [queue, setQueue] = useState<PracticeItem[]>(() =>
    initialWord ? [practiceWordToItem(initialWord)] : initialSuggestions.items,
  );
  const [usedFallback, setUsedFallback] = useState(
    initialWord ? false : initialSuggestions.usedFallback,
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(initialWord ? 0 : null);
  const [mode, setMode] = useState<PracticeMode>("write");
  const [sessionScores, setSessionScores] = useState<Record<string, number[]>>({});

  const activeItem = activeIndex === null ? undefined : queue[activeIndex];
  const activeWord = activeItem ? practiceItemToWord(activeItem) : null;

  const recordScore = useCallback(
    (score: number) => {
      if (!activeWord) return;
      setSessionScores((prev) => ({
        ...prev,
        [activeWord.vocabularyId]: [...(prev[activeWord.vocabularyId] ?? []), score],
      }));
    },
    [activeWord],
  );

  if (activeIndex === null || !activeWord) {
    return (
      <div className="mx-auto w-full max-w-235 px-4 py-8 sm:px-7 lg:py-12">
        <PracticeHub
          queue={queue}
          usedFallback={usedFallback}
          defaultCount={defaultCount}
          topics={topics}
          onQueueChange={setQueue}
          onUsedFallbackChange={setUsedFallback}
          onStart={() => setActiveIndex(0)}
        />
      </div>
    );
  }

  const total = queue.length;
  return (
    <div className="mx-auto w-full max-w-220 px-4 py-8 sm:px-6 lg:py-10">
      {total > 1 && (
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <span className="lr-eyebrow">
            Word <span className="tnum">{activeIndex + 1}</span> of{" "}
            <span className="tnum">{total}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveIndex((i) => Math.max(0, (i ?? 0) - 1))}
              disabled={activeIndex === 0}
              className="lr-btn lr-btn--ghost lr-btn--sm disabled:opacity-40"
            >
              <ChevronLeftIcon className="size-4" /> Prev
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((i) => Math.min(total - 1, (i ?? 0) + 1))}
              disabled={activeIndex >= total - 1}
              className="lr-btn lr-btn--soft lr-btn--sm disabled:opacity-40"
            >
              Next word <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div key={activeWord.vocabularyId} className="lr-stagger">
        <WordHeader
          word={activeWord}
          sessionScores={sessionScores[activeWord.vocabularyId] ?? []}
          onExit={() => setActiveIndex(null)}
        />
        <ModeTabs mode={mode} onChange={setMode} />
        {mode === "write" ? (
          <WriteMode word={activeWord} onSwitchMode={setMode} onScored={recordScore} />
        ) : (
          <SpeakMode word={activeWord} onSwitchMode={setMode} onScored={recordScore} />
        )}
      </div>
    </div>
  );
}
