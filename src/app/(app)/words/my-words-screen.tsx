"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { BookMarkedIcon, PlusIcon, SearchIcon } from "lucide-react";

import { WordRow, wordGloss } from "@/components/app/word-row";
import { deleteUserVocabulary } from "@/lib/me/vocabulary-actions";
import type { MyWord } from "@/lib/me/types";

/**
 * My Words list (§6.5): header + "Add word", a client-side search over the
 * loaded page, the word rows, and an empty state. Removal is optimistic and
 * then reconciled by a server refresh.
 */
export function MyWordsScreen({ words, total }: { words: MyWord[]; total: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = words.filter((w) => !removing.has(w.id));
    if (!q) return visible;
    return visible.filter(
      (w) =>
        w.lemma.toLowerCase().includes(q) ||
        (wordGloss(w) ?? "").toLowerCase().includes(q),
    );
  }, [words, query, removing]);

  const count = total - removing.size;

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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search my words"
          className="w-full rounded-[14px] border border-(--line-2) bg-(--surface) py-2.5 pr-3 pl-10 text-sm text-(--ink) shadow-(--sh-sm) outline-none placeholder:text-(--ink-3) focus:border-(--primary) focus:ring-4 focus:ring-(--primary-soft)"
        />
      </div>

      <p className="tnum mt-3 mb-2.5 text-[12.5px] text-(--ink-3)">
        {count} {count === 1 ? "word" : "words"}
      </p>

      <div className="lr-card overflow-hidden">
        {filtered.length === 0 ? (
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
          filtered.map((w) => <WordRow key={w.id} word={w} onRemove={() => onRemove(w.id)} />)
        )}
      </div>
    </div>
  );
}
