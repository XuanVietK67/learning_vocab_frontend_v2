"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { BookMarkedIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Pagination } from "@/components/app/pagination";
import { WordRow } from "@/components/app/word-row";
import { deleteUserVocabulary } from "@/lib/me/vocabulary-actions";
import type { MyWord } from "@/lib/me/types";
import { PAGE_SIZE_COOKIE, clampPageSize } from "./pagination-config";

const SEARCH_DEBOUNCE_MS = 350;
const RESIZE_DEBOUNCE_MS = 150;

/** Fallback row height (px) used only before any row has rendered to measure. */
const ROW_HEIGHT_FALLBACK = 84;
/** Space below the list (pager + bottom page padding) kept clear of rows. */
const RESERVE_BELOW = 100;

/**
 * My Words list (§6.5): header + "Add word", a debounced server-side search,
 * one viewport-sized page of word rows, an empty state, and a pager. Search and
 * page live in the URL (so the whole collection is reachable, not just a loaded
 * slice); the page size is measured from the viewport and persisted in a cookie
 * so the server fetches exactly one screenful. Removal is optimistic and then
 * reconciled by a server refresh.
 */
export function MyWordsScreen({
  words,
  total,
  page,
  limit,
  query,
}: {
  words: MyWord[];
  total: number;
  page: number;
  limit: number;
  query: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(query);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const visible = useMemo(
    () => words.filter((w) => !removing.has(w.id)),
    [words, removing],
  );

  const count = total - removing.size;

  // Push the debounced query into the URL (resetting to page 1) so the server
  // re-fetches across the whole collection. Skip while it already matches.
  useEffect(() => {
    const next = input.trim();
    if (next === query) return;
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (next) params.set("q", next);
      else params.delete("q");
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [input, query, pathname, router, searchParams]);

  // Measure how many rows fit the viewport and, when that differs from the size
  // the server used, persist it in a cookie and re-fetch. Seeding the cookie
  // means repeat visits render the right count server-side with no flash.
  useEffect(() => {
    function fitToViewport() {
      const card = cardRef.current;
      // Only size against real word rows — skip the (taller) empty state.
      if (!card || visible.length === 0) return;

      // The tallest currently-rendered row is the true pitch; measuring it
      // (instead of a constant) stays correct across zoom, font, and wrapping.
      let rowHeight = 0;
      for (const child of Array.from(card.children)) {
        rowHeight = Math.max(rowHeight, (child as HTMLElement).offsetHeight);
      }
      if (rowHeight < 1) rowHeight = ROW_HEIGHT_FALLBACK;

      const top = card.getBoundingClientRect().top;
      const available = window.innerHeight - top - RESERVE_BELOW;
      const fit = clampPageSize(available / rowHeight);
      if (fit === limit) return;

      document.cookie = `${PAGE_SIZE_COOKIE}=${fit}; path=/; max-age=31536000; samesite=lax`;
      // A new page size shifts page boundaries, so return to page 1.
      const params = new URLSearchParams(searchParams);
      params.delete("page");
      const qs = params.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;
      if (page > 1) router.push(target);
      else router.refresh();
    }

    let timer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(timer);
      timer = setTimeout(fitToViewport, RESIZE_DEBOUNCE_MS);
    }
    fitToViewport();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [limit, page, pathname, router, searchParams, visible.length]);

  function onRemove(id: string) {
    setRemoving((cur) => new Set(cur).add(id));
    startTransition(async () => {
      const res = await deleteUserVocabulary(id);
      if (!res.ok) {
        setRemoving((cur) => {
          const next = new Set(cur);
          next.delete(id);
          return next;
        });
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-(--ink)">
            My Words
          </h1>
          <p className="mt-1 text-sm text-(--ink-2)">
            Your private words — ready to study the moment they’re added.
          </p>
        </div>
        <Link href="/words/add" className="lr-btn lr-btn--primary lr-btn--md shrink-0">
          <PlusIcon className="size-4" /> Add word
        </Link>
      </div>

      <div className="relative mt-6 max-w-80">
        <SearchIcon className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--ink-3)" />
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search my words"
          className="w-full rounded-[14px] border border-(--line-2) bg-(--surface) py-2.5 pr-3 pl-10 text-sm text-(--ink) shadow-(--sh-sm) outline-none placeholder:text-(--ink-3) focus:border-(--primary) focus:ring-4 focus:ring-(--primary-soft)"
        />
      </div>

      <p className="tnum mt-3 mb-2.5 text-[12.5px] text-(--ink-3)">
        {count} {count === 1 ? "word" : "words"}
      </p>

      <div className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <div ref={cardRef} className="lr-card overflow-hidden">
          {visible.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mb-3.5 inline-flex rounded-full bg-(--muted) p-3.5 text-(--ink-3)">
                <BookMarkedIcon className="size-5" />
              </span>
              <p className="text-[15px] font-semibold text-(--ink)">
                {query ? "No words match that search" : "No words yet"}
              </p>
              <p className="mt-1 text-[13.5px] text-(--ink-3)">
                {query
                  ? "Try a different term."
                  : "Add your first word to start building your vocabulary."}
              </p>
              {!query && (
                <Link
                  href="/words/add"
                  className="lr-btn lr-btn--primary lr-btn--sm mt-4 inline-flex"
                >
                  <PlusIcon className="size-4" /> Add your first word
                </Link>
              )}
            </div>
          ) : (
            visible.map((w) => (
              <WordRow key={w.id} word={w} onRemove={() => onRemove(w.id)} />
            ))
          )}
        </div>

        {total > limit && <Pagination page={page} limit={limit} total={total} />}
      </div>
    </div>
  );
}
