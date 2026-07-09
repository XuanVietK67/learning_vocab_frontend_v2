import { GlobeIcon, LockIcon } from "lucide-react";

import type { DeckVisibility } from "@/lib/me/types";
import { cn } from "@/lib/utils";

/**
 * The identity cue on every list card + detail header (design §5.1). Three
 * states keyed off `visibility` + `ownerId`:
 *   - seeded catalog (`system` / `ownerId === null`) → muted "Catalog"
 *   - public → mint Globe + "Public" (or "Community" on someone else's card)
 *   - private → muted Lock + "Private"
 *
 * Colour is never the only signal — the icon + label always pair.
 */
export function VisibilityBadge({
  visibility,
  ownerId,
  community = false,
  className,
}: {
  visibility: DeckVisibility;
  ownerId: string | null;
  /** On a community card, label public decks "Community" instead of "Public". */
  community?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none";

  if (visibility === "system" || ownerId === null) {
    return (
      <span className={cn(base, "bg-(--muted) text-(--ink-3)", className)}>Catalog</span>
    );
  }

  if (visibility === "public") {
    return (
      <span className={cn(base, "bg-(--primary-soft) text-(--primary-ink)", className)}>
        <GlobeIcon className="size-3" strokeWidth={2.4} />
        {community ? "Community" : "Public"}
      </span>
    );
  }

  return (
    <span className={cn(base, "bg-(--muted) text-(--ink-3)", className)}>
      <LockIcon className="size-3" strokeWidth={2.4} />
      Private
    </span>
  );
}
