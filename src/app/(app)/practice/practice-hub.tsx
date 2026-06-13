"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, Loader2Icon, MicIcon, PenLineIcon, SearchIcon, XIcon } from "lucide-react";

import { AudioButton } from "@/app/(app)/learn/questions/_shared/audio-button";
import type { PracticeWord } from "@/lib/me/practice/types";
import type { PracticeMode } from "./mode-tabs";
import { searchPracticeWordsAction } from "./practice-actions";

/**
 * The Practice hub — where the learner lands with no word in hand. Auto-offers
 * the top due word as a hero (Write/Speak straight away) and, below, a chooser
 * grid of the other due words, with a search to switch to any saved word. Both
 * arrival paths the brief asked to "explore" (auto-pick + chooser) coexist.
 */
export function PracticeHub({
  initialWords,
  onPick,
}: {
  initialWords: PracticeWord[];
  onPick: (word: PracticeWord, mode: PracticeMode) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PracticeWord[] | null>(null);
  const [searching, setSearching] = useState(false);
  const seq = useRef(0);

  // Sync UI flips live in the change handler; the effect only does the async
  // fetch (keeps setState out of the effect body — react-hooks/set-state-in-effect).
  function onQueryChange(value: string) {
    setQuery(value);
    if (value.trim()) {
      setSearching(true);
    } else {
      setResults(null);
      setSearching(false);
    }
  }

  // Debounced search; the latest query wins (sequence guard against races).
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const id = ++seq.current;
    const handle = window.setTimeout(async () => {
      const found = await searchPracticeWordsAction(q);
      if (id === seq.current) {
        setResults(found);
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const isSearching = query.trim().length > 0;
  const hero = initialWords[0] ?? null;
  const rest = initialWords.slice(1);
  const grid = isSearching ? (results ?? []) : rest;

  return (
    <div className="lr-stagger">
      <div className="mb-4.5">
        <span className="lr-eyebrow text-(--sky)">Practice</span>
        <h1 className="mt-1.5 text-[30px] font-extrabold tracking-[-0.02em]">Put a word to work</h1>
        <p className="mt-0.5 text-[15.5px] text-(--ink-2)">
          Write a sentence with it, or say it aloud — and get a clear breakdown.
        </p>
      </div>

      {/* search */}
      <div className="lr-card mb-5.5 flex items-center gap-2.5 rounded-2xl px-4 py-0.5">
        <SearchIcon className="size-5 shrink-0 text-(--ink-3)" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search a word to practice…"
          className="flex-1 border-none bg-transparent py-3 text-[15.5px] text-(--ink) outline-none placeholder:text-(--ink-3)"
          aria-label="Search a word to practice"
        />
        {searching && <Loader2Icon className="size-4 animate-spin text-(--ink-3) motion-reduce:animate-none" />}
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="grid size-6 place-items-center text-(--ink-3) hover:text-(--ink)"
          >
            <XIcon className="size-5" />
          </button>
        )}
      </div>

      {/* hero due word (only when not searching) */}
      {!isSearching && hero && (
        <div className="lr-card lr-pop mb-6.5 overflow-hidden p-0">
          <div className="p-[26px_28px]" style={{ background: "linear-gradient(120deg, var(--sky-soft), var(--surface) 70%)" }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="lr-chip" style={{ color: "var(--sky)" }}>
                <span className="inline-block size-[7px] rounded-full bg-(--sky)" /> Due now
              </span>
            </div>
            <div className="flex items-center gap-4">
              {hero.audioUrl && <AudioButton src={hero.audioUrl} size="lg" label="Hear it" />}
              <div className="min-w-0">
                <div className="lr-word text-[46px]">{hero.lemma}</div>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {hero.ipa && <span className="lr-ipa text-[19px]">{hero.ipa}</span>}
                  {(hero.pos || hero.gloss) && (
                    <span className="text-[15px] text-(--ink-2)">
                      {hero.pos}
                      {hero.pos && hero.gloss ? " · " : ""}
                      {hero.gloss}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-(--line) p-[16px_28px]">
            <button type="button" className="lr-btn lr-btn--soft lr-btn--md" onClick={() => onPick(hero, "write")}>
              <PenLineIcon className="size-4" /> Write
            </button>
            <button type="button" className="lr-btn lr-btn--primary lr-btn--md" onClick={() => onPick(hero, "speak")}>
              <MicIcon className="size-4" /> Speak
            </button>
          </div>
        </div>
      )}

      {/* chooser grid */}
      <span className="lr-eyebrow">
        {isSearching ? `Results for “${query.trim()}”` : "Or pick another word"}
      </span>
      <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {grid.map((w) => (
          <button
            key={w.vocabularyId}
            type="button"
            onClick={() => onPick(w, "write")}
            className="lr-card hoverlift flex items-center gap-3.5 rounded-[18px] p-4 text-left"
          >
            <div className="min-w-0 flex-1">
              <span className="lr-word text-[24px]">{w.lemma}</span>
              {(w.pos || w.gloss) && (
                <div className="mt-0.5 truncate text-[13.5px] text-(--ink-2)">
                  {w.pos}
                  {w.pos && w.gloss ? " · " : ""}
                  {w.gloss}
                </div>
              )}
            </div>
            <ArrowRightIcon className="size-5 shrink-0 text-(--ink-3)" />
          </button>
        ))}
      </div>

      {/* empty states */}
      {isSearching && !searching && grid.length === 0 && (
        <p className="mt-2 p-6 text-center text-[15px] text-(--ink-2)">
          No words match “{query.trim()}”. Try another spelling — Write needs a saved word.
        </p>
      )}
      {!isSearching && initialWords.length === 0 && (
        <p className="mt-2 p-6 text-center text-[15px] text-(--ink-2)">
          Nothing’s due right now. Search any word you’ve saved to practice it.
        </p>
      )}
    </div>
  );
}
