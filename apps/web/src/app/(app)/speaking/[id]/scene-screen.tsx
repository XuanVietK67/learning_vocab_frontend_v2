"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  TargetIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { CatalogueWord } from "@/lib/me/practice/types";
import { cefrBadge, topicLabel } from "@/lib/me/speaking/format";
import {
  searchVocabularyAction,
  startSessionAction,
} from "@/lib/me/speaking/session-actions";
import type { SpeakingScenario } from "@/lib/me/speaking/types";
import { stashStart } from "../_shared/handoff";

const MAX_WORDS = 50;

/**
 * The pre-flight (brief §4.2): scene brief + useful phrases + an optional word
 * picker, then Start. Picking is optional ("skip" is fine). Start posts the
 * session, stashes the handle for the live screen, and hands off — branching the
 * documented failures (429 daily cap, 503 unavailable, 404 gone) into inline
 * notices rather than a thrown error.
 */
export function SceneScreen({ scenario }: { scenario: SpeakingScenario }) {
  const router = useRouter();
  const badge = cefrBadge(scenario.cefrLevel);

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<CatalogueWord[] | null>(null);
  const [selected, setSelected] = useState<Record<string, CatalogueWord>>({});
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<{ message: string; quota: boolean } | null>(null);
  const seq = useRef(0);

  // Load a first page on mount, then debounce searches; latest request wins.
  useEffect(() => {
    const id = ++seq.current;
    const handle = window.setTimeout(
      async () => {
        const found = await searchVocabularyAction({ q: search.trim() || undefined });
        if (id === seq.current) setRows(found);
      },
      search.trim() ? 280 : 0,
    );
    return () => window.clearTimeout(handle);
  }, [search]);

  const selectedList = Object.values(selected);
  const selectedCount = selectedList.length;
  const atCap = selectedCount >= MAX_WORDS;

  // Selected words pinned first, then catalogue rows not already picked.
  const visible: CatalogueWord[] = [
    ...selectedList,
    ...(rows ?? []).filter((w) => !selected[w.vocabularyId]),
  ];

  function toggle(word: CatalogueWord) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[word.vocabularyId]) delete next[word.vocabularyId];
      else if (!atCap) next[word.vocabularyId] = word;
      return next;
    });
  }

  async function start() {
    if (starting) return;
    setStarting(true);
    setError(null);
    const res = await startSessionAction({
      scenarioId: scenario.id,
      vocabularyIds: Object.keys(selected),
    });

    if (res.ok) {
      stashStart(res.session);
      router.push(`/speaking/${scenario.id}/session?sid=${res.session.id}`);
      return; // keep the button busy through the navigation
    }

    if (res.kind === "notFound") {
      router.replace("/speaking");
      return;
    }
    setError({ message: res.message, quota: res.kind === "quota" });
    setStarting(false);
  }

  const pickedSummary =
    selectedCount === 0
      ? "No target words — that's fine, you can just talk."
      : `${selectedCount} target ${selectedCount === 1 ? "word" : "words"} ready to weave in`;

  return (
    <div className="speak-shell speak-field min-h-full">
      <div className="mx-auto w-full max-w-[940px] px-5 pt-6 pb-20 sm:px-7">
        <Link
          href="/speaking"
          className="mb-3 inline-flex items-center gap-1.5 py-1.5 text-sm font-bold text-(--ink-2) transition-colors hover:text-(--ink)"
        >
          <ArrowLeftIcon className="size-4" /> All scenarios
        </Link>

        <div className="lr-card overflow-hidden">
          {/* scene header */}
          <div className="speak-band px-7 pt-8 pb-7 sm:px-9">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="rounded-full px-3 py-1 text-[12px] font-extrabold"
                style={{ background: badge.bg, color: badge.fg }}
              >
                {scenario.cefrLevel ?? "Any level"}
              </span>
              <span className="lr-chip lr-chip--violet text-[13px]">
                {topicLabel(scenario.topic)}
              </span>
            </div>
            <h1 className="serif mt-3 text-[32px] leading-[1.05] font-medium tracking-[-0.01em] text-(--ink) sm:text-[38px]">
              {scenario.title}
            </h1>
            <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed font-medium text-(--ink-2) sm:text-base">
              {scenario.setting}
            </p>

            {/* the cast */}
            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              <RoleChip kind="you" role={scenario.userRole} />
              <span className="font-bold text-(--ink-3)">↔</span>
              <RoleChip kind="ai" role={scenario.aiRole} />
            </div>
          </div>

          {/* body */}
          <div className="px-7 pt-6 pb-8 sm:px-9">
            {/* mission */}
            <div className="flex items-start gap-3 rounded-(--r-tile) border border-(--line) bg-(--card-2) px-4 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-(--primary-soft) text-(--primary-ink)">
                <TargetIcon className="size-5" />
              </span>
              <div>
                <p className="lr-eyebrow">Your mission</p>
                <p className="mt-0.5 text-base font-semibold text-(--ink)">
                  {scenario.goal}
                </p>
              </div>
            </div>

            {/* useful phrases */}
            {scenario.seedPhrases.length > 0 && (
              <section className="mt-6">
                <p className="lr-eyebrow mb-3">Useful phrases</p>
                <div className="flex flex-wrap gap-2">
                  {scenario.seedPhrases.map((phrase) => (
                    <span key={phrase} className="lr-chip lr-chip--mint text-sm">
                      {phrase}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* pick words */}
            <section className="mt-7">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <p className="lr-eyebrow">Pick words to practise</p>
                <p className="text-[13px] font-semibold text-(--ink-3)">
                  optional · they light up as you use them
                </p>
              </div>

              <div className="relative mb-3.5">
                <SearchIcon className="absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-(--ink-3)" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your words"
                  aria-label="Search words to practise"
                  className="lr-input pl-11 text-[15px]"
                />
              </div>

              {rows === null ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="lr-sk h-9 w-28 rounded-full" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <p className="py-2 text-sm font-medium text-(--ink-3)">
                  No words match — you can still talk without targets.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {visible.map((word) => {
                    const on = Boolean(selected[word.vocabularyId]);
                    return (
                      <button
                        key={word.vocabularyId}
                        type="button"
                        aria-pressed={on}
                        disabled={!on && atCap}
                        onClick={() => toggle(word)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                          on
                            ? "bg-(--primary) text-white shadow-[var(--sh-primary)]"
                            : "border-[1.5px] border-(--line-2) bg-(--surface) text-(--ink-2) hover:text-(--ink)",
                        )}
                      >
                        {on ? <CheckIcon className="size-3.5" strokeWidth={3} /> : <PlusIcon className="size-3.5" />}
                        {word.lemma}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* errors */}
            {error && (
              <div
                className={cn(
                  "mt-6 flex items-start gap-2.5 rounded-(--r-tile) px-4 py-3 text-sm font-semibold",
                  error.quota
                    ? "bg-(--amber-soft) text-(--warn-ink)"
                    : "bg-(--bad-soft) text-(--bad-ink)",
                )}
              >
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            {/* start */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="button"
                onClick={() => void start()}
                disabled={starting}
                className="lr-btn lr-btn--primary lr-btn--lg"
              >
                {starting ? (
                  <>
                    <Loader2Icon className="size-5 animate-spin" /> Starting…
                  </>
                ) : (
                  <>
                    Start the conversation <ArrowRightIcon className="size-5" />
                  </>
                )}
              </button>
              <p className="text-[13px] font-semibold text-(--ink-3)">{pickedSummary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A facing avatar chip — mint for the learner, violet for the AI partner. */
function RoleChip({ kind, role }: { kind: "you" | "ai"; role: string }) {
  const you = kind === "you";
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2",
        you ? "bg-(--primary-soft)" : "bg-(--violet-soft)",
      )}
    >
      <span
        className="grid size-[34px] place-items-center rounded-full text-[13px] font-extrabold text-white"
        style={{
          background: you
            ? "radial-gradient(120% 120% at 35% 25%, #2bd6a3, var(--primary) 70%)"
            : "radial-gradient(120% 120% at 35% 25%, #a99bff, var(--violet) 70%)",
        }}
      >
        {you ? "You" : "AI"}
      </span>
      <span className={cn("font-bold", you ? "text-(--primary-ink)" : "text-[#4b3fb0]")}>
        {role}
      </span>
    </div>
  );
}
