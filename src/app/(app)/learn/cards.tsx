import Link from "next/link";
import { BookOpenIcon, DumbbellIcon, TagIcon } from "lucide-react";

import { languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";
import type { CefrLevel } from "@/lib/auth/types";
import type { Topic } from "@/lib/admin/types";
import type { DeckSummary } from "@/lib/me/types";

/** Soft-tint pairs cycled across topic + deck icon tiles (Sprout palette). */
export const TINTS = [
  "bg-(--primary-soft) text-(--primary-ink)",
  "bg-(--violet-soft) text-(--violet)",
  "bg-(--sky-soft) text-[#176e93]",
  "bg-(--amber-soft) text-(--amber-2)",
];

/** Shared rail/grid-card surface: soft white card that lifts on hover. */
export const CARD =
  "shrink-0 rounded-[20px] border border-(--line) bg-(--learn-surface) shadow-(--sh-md) transition hover:-translate-y-0.5 hover:shadow-(--sh-lg)";

/** Mint section eyebrow (uppercase, tracked) used across the hub + pickers. */
export const EYEBROW =
  "text-[12px] font-bold tracking-[0.14em] text-(--primary-ink) uppercase";

/** CEFR badge tint — A→mint, B→sky, C→violet (matches the design). */
const CEFR_TINT: Record<string, string> = {
  A1: "bg-(--primary-soft) text-(--primary-ink)",
  A2: "bg-(--primary-soft) text-(--primary-ink)",
  B1: "bg-(--sky-soft) text-[#176e93]",
  B2: "bg-(--sky-soft) text-[#176e93]",
  C1: "bg-(--violet-soft) text-(--violet)",
  C2: "bg-(--violet-soft) text-(--violet)",
};

export function CefrBadge({ level }: { level: CefrLevel }) {
  return (
    <span
      className={cn(
        "rounded-[7px] px-2 py-[3px] text-[11px] font-extrabold tracking-[0.03em]",
        CEFR_TINT[level] ?? "bg-(--primary-soft) text-(--primary-ink)",
      )}
    >
      {level}
    </span>
  );
}

/**
 * A small "Practice" pill — free re-study ignoring SRS due dates. Rendered as a
 * sibling of the card's stretched study link and lifted above it (`relative z-2`)
 * so it stays independently clickable without nesting one anchor inside another.
 */
function PracticePill({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label="Practice — re-study without waiting for due dates"
      title="Practice — re-study without waiting for due dates"
      className={cn(
        "relative z-[2] inline-flex items-center gap-1 rounded-full border border-(--line) bg-(--learn-surface) px-2.5 py-1 text-[11.5px] font-bold text-(--ink-2) shadow-(--sh-sm) transition hover:border-(--primary) hover:text-(--primary-ink)",
        className,
      )}
    >
      <DumbbellIcon className="size-3.5" />
      Practice
    </Link>
  );
}

/**
 * Topic card — links straight into a topic session, with a corner Practice pill.
 * `fill` makes it stretch to its grid cell (pickers); otherwise it keeps the
 * rail's fixed width. The whole card is a stretched study link; the pill sits
 * above it.
 */
export function TopicTile({
  topic,
  idx,
  fill = false,
}: {
  topic: Topic;
  idx: number;
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        CARD,
        "relative flex flex-col p-[18px]",
        fill ? "w-full" : "w-[172px]",
      )}
    >
      <Link
        href={`/learn?mode=topic&topicSlug=${topic.slug}`}
        aria-label={`Study ${topic.name}`}
        className="absolute inset-0 z-[1] rounded-[20px]"
      />
      <div className="mb-4 flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid size-12 place-items-center rounded-[14px]",
            TINTS[idx % TINTS.length],
          )}
        >
          <TagIcon className="size-5" />
        </span>
        <PracticePill href={`/learn?mode=topic&topicSlug=${topic.slug}&practice=1`} />
      </div>
      <span className="line-clamp-2 text-[16.5px] leading-[1.15] font-bold tracking-[-0.01em] text-(--ink)">
        {topic.name}
      </span>
    </div>
  );
}

/**
 * Compact deck card — icon, name, "N words · language", CEFR badge, plus a
 * Practice pill in the meta row. `fill` stretches it to a grid cell (pickers);
 * otherwise it keeps the rail width. The card is a stretched study link; the
 * pill sits above it (see {@link PracticePill}).
 */
export function DeckCard({
  deck,
  idx,
  fill = false,
}: {
  deck: DeckSummary;
  idx: number;
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        CARD,
        "relative flex flex-col p-[18px]",
        fill ? "w-full" : "w-[256px]",
      )}
    >
      <Link
        href={`/learn?mode=deck&deckId=${deck.id}`}
        aria-label={`Study ${deck.name}`}
        className="absolute inset-0 z-[1] rounded-[20px]"
      />
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-[13px]",
            TINTS[idx % TINTS.length],
          )}
        >
          <BookOpenIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[16.5px] leading-[1.15] font-bold tracking-[-0.01em] text-(--ink)">
            {deck.name}
          </div>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3.5">
        <span className="text-[12.5px] font-medium text-(--ink-2)">
          {deck.vocabCount} words · {languageLabel(deck.language)}
        </span>
        {deck.cefrLevel && <CefrBadge level={deck.cefrLevel} />}
        <PracticePill
          href={`/learn?mode=deck&deckId=${deck.id}&practice=1`}
          className="ml-auto"
        />
      </div>
    </div>
  );
}
