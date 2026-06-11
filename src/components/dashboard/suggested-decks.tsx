import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import type { DeckSummary } from "@/lib/me/types";

import { ListCard, SectionHead } from "./widgets";

/**
 * "Suggested for you" rail (`/v1/me/decks/suggested`) — system/curated content,
 * badged **Official** so it never reads as the user's own. Renders nothing when
 * empty.
 */
export function SuggestedDecks({ decks }: { decks: DeckSummary[] }) {
  if (decks.length === 0) return null;

  return (
    <section>
      <SectionHead
        eyebrow="Curated for you"
        title="Suggested for you"
        sub="App-curated picks — badged Official, never your own."
        aside={
          <Link href="/explore" className="lr-chip no-underline">
            Explore all <ArrowRightIcon size={13} />
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.slice(0, 3).map((deck) => (
          <ListCard key={deck.id} deck={deck} kind="official" />
        ))}
      </div>
    </section>
  );
}
