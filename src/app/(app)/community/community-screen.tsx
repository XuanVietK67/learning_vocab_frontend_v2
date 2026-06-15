"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";

import { LANGUAGES } from "@/lib/languages";
import type { DeckSummary, Page } from "@/lib/me/types";
import { ListCard } from "../decks/list-card";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

/**
 * Community browse grid (design §6.2). Language / Level filters and pagination
 * are URL-driven — changing one pushes a new query, the server refetches, and
 * `loading.tsx` shows skeletons during the transition. Resets to page 1 on any
 * filter change.
 */
export function CommunityScreen({
  result,
  language,
  cefrLevel,
}: {
  result: Page<DeckSummary>;
  language: string;
  cefrLevel: string;
}) {
  const router = useRouter();
  const { data, page, limit, total } = result;
  const pages = Math.max(1, Math.ceil(total / limit));

  function go(next: { language?: string; cefrLevel?: string; page?: number }) {
    const qs = new URLSearchParams();
    const lang = next.language ?? language;
    const level = next.cefrLevel ?? cefrLevel;
    // Any filter change resets paging; explicit page moves keep the filters.
    const targetPage = next.page ?? 1;
    if (lang && lang !== "any") qs.set("language", lang);
    if (level && level !== "any") qs.set("cefrLevel", level);
    if (targetPage > 1) qs.set("page", String(targetPage));
    const query = qs.toString();
    router.push(query ? `/community?${query}` : "/community");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-(--ink)">Community</h1>
          <p className="mt-1 text-sm text-(--ink-2)">
            Discover lists people have shared — copy any into your own.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2">
          <span className="text-[13px] font-bold text-(--ink-3)">Language</span>
          <select
            className="lr-select"
            value={language}
            onChange={(e) => go({ language: e.target.value })}
          >
            <option value="any">Any language</option>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2">
          <span className="text-[13px] font-bold text-(--ink-3)">Level</span>
          <select
            className="lr-select"
            value={cefrLevel}
            onChange={(e) => go({ cefrLevel: e.target.value })}
          >
            <option value="any">Any level</option>
            {CEFR_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </label>
        <span className="tnum ml-auto text-[13px] font-bold text-(--ink-3)">
          {total} {total === 1 ? "list" : "lists"}
        </span>
      </div>

      {total === 0 ? (
        <EmptyState onClear={() => go({ language: "any", cefrLevel: "any" })} hasFilter={language !== "any" || cefrLevel !== "any"} />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((deck) => (
              <ListCard key={deck.id} deck={deck} mode="community" />
            ))}
          </div>
          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3.5">
              <button
                type="button"
                className="lr-btn lr-btn--ghost lr-btn--sm"
                disabled={page <= 1}
                onClick={() => go({ page: page - 1 })}
              >
                <ChevronLeftIcon className="size-4" /> Prev
              </button>
              <span className="tnum text-[13.5px] font-bold text-(--ink-2)">
                Page {page} / {pages}
              </span>
              <button
                type="button"
                className="lr-btn lr-btn--ghost lr-btn--sm"
                disabled={page >= pages}
                onClick={() => go({ page: page + 1 })}
              >
                Next <ChevronRightIcon className="size-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ onClear, hasFilter }: { onClear: () => void; hasFilter: boolean }) {
  return (
    <div className="lr-card mt-6 border-dashed bg-(--card-2) px-6 py-14 text-center">
      <span className="mb-4 inline-flex size-16 items-center justify-center rounded-[20px] bg-(--muted) text-(--ink-3)">
        <SearchIcon className="size-7" />
      </span>
      <h3 className="font-heading text-lg font-bold text-(--ink)">
        No public lists yet for this filter
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-(--ink-2)">
        Try a different language or level — or check back soon as more learners share.
      </p>
      {hasFilter && (
        <button type="button" className="lr-btn lr-btn--soft lr-btn--md mt-4 inline-flex" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
