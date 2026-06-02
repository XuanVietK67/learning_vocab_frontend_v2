import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DeckSummary } from "@/lib/me/types";

/** "Suggested for you" row from /v1/me/decks/suggested. Renders nothing when empty. */
export function SuggestedDecks({ decks }: { decks: DeckSummary[] }) {
  if (decks.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-medium tracking-tight">
        Suggested for you
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <Link
            key={deck.id}
            href={`/learn?mode=deck&deckId=${deck.id}`}
            className="group"
          >
            <Card className="h-full transition-shadow group-hover:ring-foreground/20">
              <CardContent className="flex h-full flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium leading-snug">{deck.name}</span>
                  {deck.cefrLevel && (
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      {deck.cefrLevel}
                    </span>
                  )}
                </div>
                {deck.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {deck.description}
                  </p>
                )}
                <span className="mt-auto flex items-center gap-1 text-sm text-muted-foreground">
                  {deck.vocabCount} words
                  <ChevronRightIcon className="size-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
