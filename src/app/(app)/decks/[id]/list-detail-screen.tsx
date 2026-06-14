"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeftIcon, ClipboardListIcon, InboxIcon, ListIcon, PlusIcon } from "lucide-react";

import { BulkImportSheet } from "@/components/app/bulk-import-sheet";
import { WordRow } from "@/components/app/word-row";
import { deckAccent } from "../list-card";
import { languageLabel } from "@/lib/languages";
import type { DeckDetail } from "@/lib/me/types";

/**
 * List detail (§6.3): the list header with its two "add words" entry points,
 * the member words, and an empty state. The bulk-import sheet refreshes this
 * screen as words land.
 */
export function ListDetailScreen({
  deck,
  appLanguage,
  nativeLanguage,
}: {
  deck: DeckDetail;
  appLanguage: string;
  nativeLanguage: string;
}) {
  const router = useRouter();
  const [bulkOpen, setBulkOpen] = useState(false);
  const accent = deckAccent(deck.id);
  const words = deck.vocabularies ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/decks"
        className="mb-4 inline-flex items-center gap-1 text-[13px] text-(--ink-3) hover:text-(--ink)"
      >
        <ChevronLeftIcon className="size-4" /> Lists
      </Link>

      <div className="flex flex-wrap items-start gap-4">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-[14px]"
          style={{ background: `color-mix(in oklch, ${accent} 16%, transparent)`, color: accent }}
        >
          <ListIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-(--ink)">{deck.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-(--ink-3)">
            {deck.description && <span>{deck.description}</span>}
            <span className="tnum">{words.length} words</span>
            <span>{languageLabel(deck.language)}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2.5">
          <Link href="/words/add" className="lr-btn lr-btn--soft lr-btn--md">
            <PlusIcon className="size-4" /> Add word
          </Link>
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="lr-btn lr-btn--primary lr-btn--md"
          >
            <ClipboardListIcon className="size-4" /> Bulk import
          </button>
        </div>
      </div>

      <div className="lr-card mt-6 overflow-hidden">
        {words.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mb-3.5 inline-flex rounded-full bg-(--muted) p-3.5 text-(--ink-3)">
              <InboxIcon className="size-5" />
            </span>
            <p className="text-[15px] font-semibold text-(--ink)">This list is empty</p>
            <p className="mt-1 text-[13.5px] text-(--ink-3)">
              Paste a batch of words and we’ll build them all into this list.
            </p>
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="lr-btn lr-btn--primary lr-btn--sm mt-4 inline-flex"
            >
              <ClipboardListIcon className="size-4" /> Bulk import words
            </button>
          </div>
        ) : (
          words.map((w) => <WordRow key={w.id} word={w} />)
        )}
      </div>

      {bulkOpen && (
        <BulkImportSheet
          deckId={deck.id}
          deckName={deck.name}
          appLanguage={appLanguage}
          nativeLanguage={nativeLanguage}
          open
          onClose={() => setBulkOpen(false)}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}
