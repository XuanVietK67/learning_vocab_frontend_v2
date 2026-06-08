import Link from "next/link";
import { BookOpenIcon, ChevronRightIcon } from "lucide-react";

import { languageLabel } from "@/lib/languages";
import type { DeckSummary } from "@/lib/me/types";
import { PickerHead } from "./picker-head";

interface DeckPickerProps {
  decks: DeckSummary[];
}

/** Deck selection step shown before a `mode=deck` session can start. */
export function DeckPicker({ decks }: DeckPickerProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-150 flex-col justify-center px-4 py-8">
      <div className="learn-anim-in">
        <PickerHead
          eyebrow="By deck"
          title="Choose a deck"
          sub="Study one of your saved collections."
        />

        {decks.length === 0 ? (
          <p className="text-(--ink-2)">
            You don’t have any decks yet. Browse decks to add one.
          </p>
        ) : (
          <div className="lr-stagger flex flex-col gap-2.5">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                href={`/learn?mode=deck&deckId=${deck.id}`}
                className="learn-card flex items-center gap-3.5 p-4 transition hover:-translate-y-0.5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-(--sky-soft) text-[#176e93]">
                  <BookOpenIcon className="size-5.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-extrabold">{deck.name}</div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-(--ink-2)">
                    <span>{deck.vocabCount} words</span>
                    <span aria-hidden>·</span>
                    <span>{languageLabel(deck.language)}</span>
                    {deck.cefrLevel && (
                      <span className="rounded-full bg-(--card-2) px-2 py-0.5 text-xs font-bold">
                        {deck.cefrLevel}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRightIcon className="size-5 shrink-0 text-(--ink-3)" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
