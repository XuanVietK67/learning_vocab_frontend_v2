"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  ListIcon,
  PlayIcon,
  SproutIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { PracticeItem } from "@/lib/me/practice/types";
import type { PickTopic } from "@/lib/me/practice/queue";
import { getPracticeSuggestionsAction } from "./practice-actions";
import { HandPickView } from "./hand-pick-view";

const COUNT_OPTIONS = [5, 10, 15, 20];

/**
 * The Practice queue builder — the front door when the learner arrives with no
 * word in hand (brief §3). Two doors into one queue: **Quick start** (the
 * asymmetric hero, one tap to a ready set) and **Hand-pick** (the deliberate
 * catalogue door). Both deposit {@link PracticeItem}s into the queue preview
 * below; `onStart` hands the queue to the runner. Queue + fallback state are
 * lifted to {@link import("./practice-screen").PracticeScreen}.
 */
export function PracticeHub({
  queue,
  usedFallback,
  defaultCount,
  topics,
  onQueueChange,
  onUsedFallbackChange,
  onStart,
}: {
  queue: PracticeItem[];
  usedFallback: boolean;
  defaultCount: number;
  topics: PickTopic[];
  onQueueChange: (next: PracticeItem[]) => void;
  onUsedFallbackChange: (next: boolean) => void;
  onStart: () => void;
}) {
  const [view, setView] = useState<"hub" | "pick">("hub");
  const [count, setCount] = useState(defaultCount);
  // Tracks the Quick start *fetch* outcome, independent of live queue edits —
  // removing the last chip must not flip the card to the "learn first" state.
  const [qsState, setQsState] = useState<"loading" | "ready" | "empty">(
    queue.length > 0 ? "ready" : "empty",
  );
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function showToast(message: string) {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }

  // Quick start: regenerate the set for the chosen count. Replaces the queue —
  // "give me N words" is an explicit ask (brief §4.1).
  async function changeCount(n: number) {
    setCount(n);
    setQsState("loading");
    const next = await getPracticeSuggestionsAction(n);
    onQueueChange(next.items);
    onUsedFallbackChange(next.usedFallback);
    setQsState(next.items.length > 0 ? "ready" : "empty");
  }

  // Hand-pick merges into the existing queue, de-duped across paths (brief §6).
  function addToQueue(items: PracticeItem[]) {
    const have = new Set(queue.map((q) => q.vocabularyId));
    const merged = [...queue];
    for (const item of items) {
      if (!have.has(item.vocabularyId)) merged.push(item);
    }
    onQueueChange(merged);
  }

  function removeFromQueue(id: string) {
    onQueueChange(queue.filter((q) => q.vocabularyId !== id));
  }

  const showQueue = qsState !== "loading" && queue.length > 0;

  return (
    <>
      {view === "pick" ? (
        <HandPickView
          topics={topics}
          onAdd={addToQueue}
          onClose={() => setView("hub")}
          onToast={showToast}
        />
      ) : (
        <div className="lr-stagger">
          <h1 className="text-[33px] font-extrabold tracking-[-0.025em] text-(--ink)">
            Practice
          </h1>
          <p className="mt-2 text-[17px] font-medium text-(--ink-2)">
            Pick a few words and prove you can use them.
          </p>

          {/* two doors: Quick start (hero) + Hand-pick (secondary) */}
          <div className="mt-7 flex flex-wrap items-stretch gap-5">
            <div className="lr-card min-w-[min(100%,380px)] flex-[1.8_1_380px] p-7">
              {qsState === "loading" ? (
                <QuickStartSkeleton />
              ) : qsState === "ready" ? (
                <QuickStartReady
                  count={count}
                  picked={queue.length}
                  usedFallback={usedFallback}
                  canStart={queue.length > 0}
                  onCount={changeCount}
                  onStart={onStart}
                />
              ) : (
                <QuickStartEmpty />
              )}
            </div>

            <div className="flex flex-[1_1_240px] flex-col rounded-(--r-card) border border-(--line) bg-(--card-2) p-7 shadow-(--sh-sm)">
              <span className="grid size-11 place-items-center rounded-[14px] border border-(--line-2) bg-(--surface) text-(--ink-2) shadow-(--sh-sm)">
                <ListIcon className="size-5" />
              </span>
              <div className="mt-4 text-[19px] font-bold tracking-[-0.01em] text-(--ink)">
                Hand-pick
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-(--ink-2)">
                Choose words yourself from your catalogue.
              </p>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => setView("pick")}
                className="lr-btn lr-btn--soft lr-btn--md mt-5 w-full"
              >
                Browse words <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>

          {/* queue preview — the proof, not decoration (brief §3, §6) */}
          {showQueue && (
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-base font-bold text-(--ink)">In your queue</span>
                  <span className="tnum text-sm font-medium text-(--ink-3)">
                    · {queue.length} words
                  </span>
                </div>
                {usedFallback && (
                  <span className="inline-flex items-center rounded-full border-[1.5px] border-(--line-2) bg-(--surface) px-3.5 py-1.5 text-[12.5px] font-semibold text-(--ink-2) shadow-(--sh-sm)">
                    Includes extra practice
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {queue.map((word) => (
                  <span
                    key={word.vocabularyId}
                    className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-(--line-2) bg-(--surface) py-2 pr-2 pl-3.5 shadow-(--sh-sm)"
                  >
                    <span className="lr-word text-[17px]">{word.lemma}</span>
                    {word.partOfSpeech && (
                      <span className="text-[11.5px] font-semibold text-(--ink-3)">
                        {word.partOfSpeech}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFromQueue(word.vocabularyId)}
                      aria-label={`Remove ${word.lemma}`}
                      className="grid size-[22px] place-items-center rounded-full bg-(--line) text-[15px] leading-none text-(--ink-2) transition-colors hover:bg-(--line-2) hover:text-(--ink)"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={onStart}
                className="lr-btn lr-btn--primary lr-btn--lg mt-5.5 px-9"
              >
                Start practising
              </button>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-22 left-1/2 z-50 max-w-[88vw] -translate-x-1/2 rounded-[14px] bg-(--ink) px-5 py-3 text-center text-sm font-semibold text-white shadow-(--sh-lg)"
        >
          {toast}
        </div>
      )}
    </>
  );
}

function QuickStartReady({
  count,
  picked,
  usedFallback,
  canStart,
  onCount,
  onStart,
}: {
  count: number;
  picked: number;
  usedFallback: boolean;
  canStart: boolean;
  onCount: (n: number) => void;
  onStart: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3.5">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-[15px]"
          style={{
            background: "radial-gradient(120% 120% at 35% 25%, #2bd6a3, var(--primary) 70%)",
            boxShadow: "var(--sh-primary)",
          }}
        >
          <PlayIcon className="size-5 fill-white text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[19px] font-bold tracking-[-0.01em] text-(--ink)">Quick start</div>
          <div className="mt-0.5 text-[14.5px] text-(--ink-2)">
            <span className="tnum font-bold text-(--ink)">{picked}</span> words picked for you today
          </div>
        </div>
      </div>
      <p className="mt-3.5 text-[13.5px] text-(--ink-3)">due reviews + new words at your level</p>

      <div className="mt-5">
        <div className="mb-2.5 text-[12.5px] font-semibold text-(--ink-3)">How many words</div>
        <div className="inline-flex gap-1.5 rounded-full border-[1.5px] border-(--line-2) bg-(--card-2) p-1.5">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onCount(n)}
              aria-pressed={n === count}
              className={cn(
                "tnum h-[38px] min-w-[46px] rounded-full px-3.5 text-sm font-bold transition-colors",
                n === count
                  ? "bg-(--primary) text-white shadow-(--sh-primary)"
                  : "text-(--ink-2) hover:text-(--ink)",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {usedFallback && (
        <div className="mt-5 flex items-start gap-2.5 rounded-[18px] border border-(--primary-soft-2) bg-(--primary-soft) px-4 py-3.5">
          <CheckIcon className="mt-0.5 size-[18px] shrink-0 text-(--primary-ink)" strokeWidth={2.4} />
          <p className="text-[13.5px] leading-relaxed text-(--primary-ink)">
            You’re caught up on reviews — here are a few extra words at your level.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className="lr-btn lr-btn--primary lr-btn--lg mt-5.5 h-[54px] w-full text-base"
      >
        Start practising
      </button>
    </div>
  );
}

function QuickStartEmpty() {
  return (
    <div className="px-2 py-3.5 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-[20px] bg-(--primary-soft) text-(--primary-ink)">
        <SproutIcon className="size-7.5" />
      </span>
      <div className="mt-4 text-[19px] font-bold text-(--ink)">No words to practise yet</div>
      <p className="mx-auto mt-2 mb-5 max-w-[300px] text-sm leading-relaxed text-(--ink-2)">
        Learn a few words first, then come back to practise using them.
      </p>
      <Link href="/learn" className="lr-btn lr-btn--soft lr-btn--md inline-flex">
        Go to Learn <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}

function QuickStartSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-3.5">
        <div className="lr-sk size-12 rounded-[15px]" />
        <div className="flex-1">
          <div className="lr-sk h-4 w-40 rounded-md" />
          <div className="lr-sk mt-2.5 h-3 w-56 rounded-md" />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <div className="lr-sk h-9 w-26 rounded-full" />
        <div className="lr-sk h-9 w-22 rounded-full" />
        <div className="lr-sk h-9 w-30 rounded-full" />
      </div>
    </div>
  );
}
