import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import type { DeckSummary } from "@/lib/me/types";

import { ListCard, SectionHead } from "./widgets";

/**
 * "Trending shared lists" rail (`/v1/decks/public`) — lists published by other
 * learners, badged **Community** with a Clone affordance. Renders nothing when
 * empty.
 */
export function CommunityRail({ decks }: { decks: DeckSummary[] }) {
  if (decks.length === 0) return null;

  return (
    <section>
      <SectionHead
        eyebrow="From the community"
        title="Trending shared lists"
        aside={
          <Link href="/community" className="lr-chip lr-chip--violet no-underline">
            All community <ArrowRightIcon size={13} />
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {decks.slice(0, 2).map((deck) => (
          <ListCard key={deck.id} deck={deck} kind="community" />
        ))}
      </div>
    </section>
  );
}
