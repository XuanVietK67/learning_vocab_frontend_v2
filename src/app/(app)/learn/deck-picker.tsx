import Link from "next/link";
import { LayersIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { languageLabel } from "@/lib/languages";
import type { DeckSummary } from "@/lib/me/types";

interface DeckPickerProps {
  decks: DeckSummary[];
}

/** Deck selection step shown before a `mode=deck` session can start. */
export function DeckPicker({ decks }: DeckPickerProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Choose a deck</h1>
        <p className="text-muted-foreground">Study one of your saved collections.</p>
      </div>

      {decks.length === 0 ? (
        <p className="text-muted-foreground">
          You don&apos;t have any decks yet. Browse decks to add one.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/learn?mode=deck&deckId=${deck.id}`} className="group">
              <Card className="h-full transition-shadow group-hover:ring-foreground/20">
                <CardContent className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <LayersIcon className="size-5" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium">{deck.name}</span>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{deck.vocabCount} words</span>
                      <span aria-hidden>·</span>
                      <span>{languageLabel(deck.language)}</span>
                      {deck.cefrLevel && <Badge variant="secondary">{deck.cefrLevel}</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "self-start")}>
        Back to dashboard
      </Link>
    </div>
  );
}
