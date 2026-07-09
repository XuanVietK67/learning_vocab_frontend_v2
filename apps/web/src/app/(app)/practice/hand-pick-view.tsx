"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, CheckIcon, Loader2Icon, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CefrLevel } from "@/lib/auth/types";
import type { CatalogueWord, PracticeItem } from "@/lib/me/practice/types";
import type { PickTopic } from "@/lib/me/practice/queue";
import { searchCatalogueAction, submitPracticeSetAction } from "./practice-actions";

const MAX_SELECTION = 50;
const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * Hand-pick (`POST /v1/me/practice/sets`) — the deliberate door. A filterable
 * catalogue checkbox list (`GET /v1/vocabularies`) with a sticky selection
 * summary that surfaces the live count + the 1–50 cap *before* the request.
 * Validating returns the practiceable `items` (merged into the queue, in sent
 * order) and skips any stale ids (§5.3).
 */
export function HandPickView({
  topics,
  onAdd,
  onClose,
  onToast,
}: {
  topics: PickTopic[];
  onAdd: (items: PracticeItem[]) => void;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [cefr, setCefr] = useState<"all" | CefrLevel>("all");
  const [topic, setTopic] = useState("all");
  const [rows, setRows] = useState<CatalogueWord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, CatalogueWord>>({});
  const [validating, setValidating] = useState(false);
  const seq = useRef(0);

  // The loading flip lives in the change handlers below (not the effect body) to
  // keep setState out of the effect — the effect only runs the async fetch.
  // Debounce the free-text search; the latest request wins (seq guard).
  useEffect(() => {
    const id = ++seq.current;
    const handle = window.setTimeout(
      async () => {
        const found = await searchCatalogueAction({
          q: search.trim() || undefined,
          cefrLevel: cefr === "all" ? undefined : cefr,
          topic: topic === "all" ? undefined : topic,
        });
        if (id === seq.current) {
          setRows(found);
          setLoading(false);
        }
      },
      search.trim() ? 300 : 0,
    );
    return () => window.clearTimeout(handle);
  }, [search, cefr, topic]);

  function onSearchChange(value: string) {
    setSearch(value);
    setLoading(true);
  }
  function selectCefr(next: "all" | CefrLevel) {
    setCefr(next);
    setLoading(true);
  }
  function selectTopic(next: string) {
    setTopic(next);
    setLoading(true);
  }

  const selectedCount = Object.keys(selected).length;
  const overCap = selectedCount > MAX_SELECTION;
  const addDisabled = selectedCount === 0 || overCap || validating;

  function toggle(word: CatalogueWord) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[word.vocabularyId]) delete next[word.vocabularyId];
      else next[word.vocabularyId] = word;
      return next;
    });
  }

  async function add() {
    const ids = Object.keys(selected);
    if (ids.length === 0 || overCap) return;
    setValidating(true);
    const res = await submitPracticeSetAction(ids);
    setValidating(false);

    if (!res.ok) {
      onToast(res.message);
      return;
    }

    const { items, inaccessibleVocabularyIds } = res.result;
    const skipped = inaccessibleVocabularyIds.length;

    // All requested words went stale — keep the learner here to re-pick (§5.4).
    if (items.length === 0) {
      // Uncheck the stale rows so the selection reflects reality.
      setSelected((prev) => {
        const next = { ...prev };
        for (const id of inaccessibleVocabularyIds) delete next[id];
        return next;
      });
      onToast("None of those are available right now.");
      return;
    }

    onAdd(items);
    setSelected({});
    onClose();
    onToast(
      skipped > 0
        ? `Added ${items.length}. ${skipped} ${skipped === 1 ? "word was" : "words were"} no longer available and ${skipped === 1 ? "was" : "were"} skipped.`
        : `Added ${items.length} ${items.length === 1 ? "word" : "words"} to your queue.`,
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-190 pb-32">
        <button
          type="button"
          onClick={onClose}
          className="lr-btn lr-btn--ghost lr-btn--sm -ml-1"
        >
          <ArrowLeftIcon className="size-4" /> Practice
        </button>

        <h1 className="mt-4 text-[28px] font-extrabold tracking-[-0.02em] text-(--ink)">
          Choose words
        </h1>
        <p className="mt-1 mb-5 text-[15px] font-medium text-(--ink-2)">
          Tick the words you want, then add them to your queue.
        </p>

        {/* search */}
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-4 size-[19px] -translate-y-1/2 text-(--ink-3)" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search words"
            aria-label="Search words"
            className="lr-input pl-11 text-[15px]"
          />
          {loading && rows !== null && (
            <Loader2Icon className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-(--ink-3) motion-reduce:animate-none" />
          )}
        </div>

        {/* CEFR filter */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <FilterChip active={cefr === "all"} onClick={() => selectCefr("all")}>
            All levels
          </FilterChip>
          {CEFR_LEVELS.map((lvl) => (
            <FilterChip key={lvl} active={cefr === lvl} onClick={() => selectCefr(lvl)}>
              {lvl}
            </FilterChip>
          ))}
        </div>

        {/* topic filter */}
        {topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <FilterChip active={topic === "all"} onClick={() => selectTopic("all")}>
              All topics
            </FilterChip>
            {topics.map((t) => (
              <FilterChip key={t.slug} active={topic === t.slug} onClick={() => selectTopic(t.slug)}>
                {t.name}
              </FilterChip>
            ))}
          </div>
        )}

        {/* list */}
        <div className="mt-4.5 overflow-hidden rounded-(--r-tile) border border-(--line) bg-(--surface) shadow-(--sh-sm)">
          {rows === null ? (
            <ListSkeleton />
          ) : rows.length === 0 ? (
            <div className="p-9 text-center text-sm text-(--ink-3)">
              No words match your filters.
            </div>
          ) : (
            rows.map((word) => (
              <Row
                key={word.vocabularyId}
                word={word}
                selected={Boolean(selected[word.vocabularyId])}
                onToggle={() => toggle(word)}
              />
            ))
          )}
        </div>
      </div>

      {/* sticky selection summary */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-(--line-2) bg-(--surface)/85 shadow-[0_-8px_24px_-16px_rgba(16,40,32,0.2)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-190 items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="tnum text-base font-bold text-(--ink)">
              {selectedCount} selected
            </span>
            <span
              className={cn(
                "text-[13px] font-semibold",
                overCap ? "text-(--warn-ink)" : "text-(--ink-3)",
              )}
            >
              {overCap ? `${MAX_SELECTION} max` : `· max ${MAX_SELECTION}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void add()}
            disabled={addDisabled}
            className="lr-btn lr-btn--primary lr-btn--md"
          >
            {validating ? <Loader2Icon className="size-[18px] animate-spin" /> : null}
            Add to queue
          </button>
        </div>
      </div>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-[34px] rounded-full border-[1.5px] px-3.5 text-[13.5px] font-semibold transition-colors",
        active
          ? "border-(--primary) bg-(--primary-soft) text-(--primary-ink)"
          : "border-(--line-2) bg-(--surface) text-(--ink-2) hover:text-(--ink)",
      )}
    >
      {children}
    </button>
  );
}

function Row({
  word,
  selected,
  onToggle,
}: {
  word: CatalogueWord;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={word.lemma}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3.5 border-b border-(--line) px-4.5 py-3.5 text-left transition-colors last:border-b-0",
        selected ? "bg-(--primary-soft)" : "bg-(--surface) hover:bg-(--card-2)",
      )}
    >
      <span
        className={cn(
          "grid size-[22px] shrink-0 place-items-center rounded-[7px] border-2 text-white transition-colors",
          selected ? "border-(--primary) bg-(--primary)" : "border-(--line-2)",
        )}
      >
        {selected && <CheckIcon className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2.5">
          <span className="lr-word text-[18px]">{word.lemma}</span>
          {word.partOfSpeech && (
            <span className="text-[11.5px] font-semibold text-(--ink-3)">
              {word.partOfSpeech}
            </span>
          )}
        </span>
        <span
          className={cn(
            "truncate text-[13px]",
            word.gloss ? "text-(--ink-2)" : "text-(--ink-3) italic",
          )}
        >
          {word.gloss ?? "No definition yet"}
        </span>
      </span>
      {word.cefrLevel && (
        <span className="shrink-0 text-[11px] font-bold tracking-[0.02em] text-(--ink-3)">
          {word.cefrLevel}
        </span>
      )}
    </button>
  );
}

function ListSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 border-b border-(--line) px-4.5 py-3.5 last:border-b-0"
        >
          <div className="lr-sk size-[22px] rounded-[7px]" />
          <div className="flex-1">
            <div className="lr-sk h-4 w-32 rounded-md" />
            <div className="lr-sk mt-2 h-3 w-48 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
