"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FolderPlusIcon, ListIcon, PlusIcon } from "lucide-react";

import { BulkImportSheet } from "@/components/app/bulk-import-sheet";
import { deleteDeck } from "@/lib/me/deck-actions";
import type { DeckSummary } from "@/lib/me/types";
import { ListCard } from "./list-card";

/**
 * My Lists (§6.1): a grid of the learner's own study lists with a "New list"
 * CTA, an empty state, and the bulk-import sheet (opened from a card's ⋯ menu).
 */
export function ListsScreen({
  decks,
  appLanguage,
  nativeLanguage,
}: {
  decks: DeckSummary[];
  appLanguage: string;
  nativeLanguage: string;
}) {
  const router = useRouter();
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [bulkDeck, setBulkDeck] = useState<DeckSummary | null>(null);
  const [, startTransition] = useTransition();

  const visible = decks.filter((d) => !removed.has(d.id));

  function onDelete(deck: DeckSummary) {
    setRemoved((cur) => new Set(cur).add(deck.id));
    startTransition(async () => {
      const res = await deleteDeck(deck.id);
      if (!res.ok) {
        setRemoved((cur) => {
          const next = new Set(cur);
          next.delete(deck.id);
          return next;
        });
        toast.error(res.error ?? "Couldn't delete that list.");
      } else {
        toast.success(`Deleted "${deck.name}"`);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-(--ink)">Lists</h1>
          <p className="mt-1 text-sm text-(--ink-2)">
            Group words into study lists — paste many at once with bulk import.
          </p>
        </div>
        <Link href="/decks/new" className="lr-btn lr-btn--primary lr-btn--md shrink-0">
          <FolderPlusIcon className="size-4" /> New list
        </Link>
      </div>

      {visible.length === 0 ? (
        <div className="lr-card mt-6 px-6 py-14 text-center">
          <span className="mb-3.5 inline-flex rounded-full bg-(--muted) p-3.5 text-(--ink-3)">
            <ListIcon className="size-5" />
          </span>
          <p className="text-[15px] font-semibold text-(--ink)">No lists yet</p>
          <p className="mt-1 text-[13.5px] text-(--ink-3)">
            Create a list, then bulk-import words to fill it fast.
          </p>
          <Link href="/decks/new" className="lr-btn lr-btn--primary lr-btn--sm mt-4 inline-flex">
            <FolderPlusIcon className="size-4" /> Create your first list
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((deck) => (
            <ListCard key={deck.id} deck={deck} onBulkImport={setBulkDeck} onDelete={onDelete} />
          ))}
          <Link
            href="/decks/new"
            className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-[30px] border border-dashed border-(--line-2) text-[13.5px] font-semibold text-(--ink-3) transition-colors hover:border-(--primary) hover:bg-(--primary-soft)/40 hover:text-(--ink)"
          >
            <PlusIcon className="size-5" /> New list
          </Link>
        </div>
      )}

      {bulkDeck && (
        <BulkImportSheet
          deckId={bulkDeck.id}
          deckName={bulkDeck.name}
          appLanguage={appLanguage}
          nativeLanguage={nativeLanguage}
          open={Boolean(bulkDeck)}
          onClose={() => setBulkDeck(null)}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}
