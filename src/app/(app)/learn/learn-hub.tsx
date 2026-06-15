import Link from "next/link";
import {
  ArrowRightIcon,
  CompassIcon,
  FlameIcon,
  RefreshCwIcon,
  SparklesIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/admin/types";
import type { DeckSummary, StatsResponse } from "@/lib/me/types";
import { CARD, DeckCard, EYEBROW, TopicTile } from "./cards";

interface LearnHubProps {
  stats: StatsResponse | null;
  topics: Topic[];
  decks: DeckSummary[];
}

const RAIL_LIMIT = 6;

/**
 * Entry screen for `/learn` (no `mode` in the URL). A top-aligned, sectioned
 * hub: header + streak, Quick start (Daily-mix hero + Review), then horizontal
 * snapping rails of topics and the caller's decks so a session starts in one
 * click. "See all" deep-links to the full pickers ([topic-picker]/[deck-picker]).
 */
export function LearnHub({ stats, topics, decks }: LearnHubProps) {
  const streakDays = stats?.streakDays ?? 0;
  const dueNow = stats?.dueNow ?? 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-11 pb-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="learn-anim-in">
        <div className={EYEBROW}>Ready to study</div>
        <div className="mt-2.5 flex items-start justify-between gap-4">
          <h1 className="text-[38px] leading-[1.02] font-extrabold tracking-[-0.025em] text-(--ink)">
            What’s the plan?
          </h1>
          {streakDays > 0 && (
            <span className="lr-streak h-9 shrink-0 px-3.5 text-[14px]">
              <FlameIcon className="lr-flame lit size-4 fill-[#ff7a1a] text-[#ff7a1a]" />
              {streakDays}-day streak
            </span>
          )}
        </div>
      </header>

      {/* ── Quick start ────────────────────────────────────── */}
      <section className="learn-anim-in mt-7">
        <div className={cn(EYEBROW, "mb-3.5")}>Quick start</div>

        <Link
          href="/learn?mode=daily"
          className="relative block overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#16c894_0%,#0ca576_60%,#0a8f66_100%)] text-white shadow-(--sh-primary) transition hover:-translate-y-0.5"
        >
          <SparklesField />
          <div className="relative z-[2] flex items-center gap-[18px] p-[26px]">
            <span className="grid size-[54px] shrink-0 place-items-center rounded-2xl border border-white/25 bg-white/20">
              <SparklesIcon className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-bold tracking-[0.14em] uppercase opacity-85">
                Recommended
              </div>
              <div className="mt-0.5 text-[23px] font-extrabold tracking-[-0.02em]">
                Daily mix
              </div>
              <div className="text-sm font-medium opacity-90">
                A balanced set picked for you today
              </div>
            </div>
            <span className="hidden shrink-0 items-center gap-2 rounded-full bg-white px-[18px] py-2.5 text-sm font-bold text-(--primary-ink) shadow-[0_6px_16px_-6px_rgba(0,0,0,0.25)] sm:inline-flex">
              Start <ArrowRightIcon className="size-4" />
            </span>
          </div>
        </Link>

        {dueNow > 0 && (
          <Link
            href="/learn?mode=review"
            className={cn(CARD, "mt-3.5 flex items-center gap-4 p-[18px]")}
          >
            <span className="grid size-[46px] shrink-0 place-items-center rounded-[13px] bg-(--amber-soft) text-(--amber-2)">
              <RefreshCwIcon className="size-[22px]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[17px] font-bold tracking-[-0.01em] text-(--ink)">
                Review
              </div>
              <div className="text-[13.5px] text-(--ink-2)">
                Cards due for their next look
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-(--amber-soft) px-3 py-1.5 text-[13px] font-bold text-(--amber-2)">
              <span className="size-[7px] rounded-full bg-current" />
              {dueNow} due
            </span>
          </Link>
        )}
      </section>

      {/* ── By topic ───────────────────────────────────────── */}
      {topics.length > 0 && (
        <section className="learn-anim-in mt-9">
          <SectionHead label="By topic" seeAllHref="/learn?mode=topic" />
          <div className="lr-rail lr-stagger">
            {topics.slice(0, RAIL_LIMIT).map((topic, i) => (
              <TopicTile key={topic.slug} topic={topic} idx={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Your decks ─────────────────────────────────────── */}
      <section className="learn-anim-in mt-9">
        <SectionHead
          label="Your decks"
          seeAllHref={decks.length > 0 ? "/learn?mode=deck" : undefined}
        />
        {decks.length === 0 ? (
          <Link
            href="/community"
            className="flex items-center gap-4 rounded-[20px] border border-dashed border-(--line-2) bg-gradient-to-b from-white to-[#fbfdfc] p-6 transition hover:-translate-y-0.5 hover:shadow-(--sh-md)"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-[13px] bg-(--primary-soft) text-(--primary-ink)">
              <CompassIcon className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-bold text-(--ink)">No decks yet</div>
              <div className="mt-0.5 text-[13.5px] text-(--ink-2)">
                Browse the community to add your first word set.
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-(--primary) px-4 py-2.5 text-[13.5px] font-bold text-white shadow-(--sh-primary)">
              Browse <ArrowRightIcon className="size-3.5" />
            </span>
          </Link>
        ) : (
          <div className="lr-rail lr-stagger">
            {decks.slice(0, RAIL_LIMIT).map((deck, i) => (
              <DeckCard key={deck.id} deck={deck} idx={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Section label + "See all →" deep-link to the full picker. */
function SectionHead({
  label,
  seeAllHref,
}: {
  label: string;
  seeAllHref?: string;
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-4">
      <h2 className={EYEBROW}>{label}</h2>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="-mr-2 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-(--primary-ink) transition hover:bg-(--primary-soft)"
        >
          See all <ArrowRightIcon className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

/** Decorative sparkle dots scattered in the hero's top-right (design accent). */
function SparklesField() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] opacity-50"
      viewBox="0 0 760 150"
      preserveAspectRatio="none"
      aria-hidden
    >
      <g fill="#fff" opacity="0.9">
        <circle cx="640" cy="34" r="2.2" />
        <circle cx="690" cy="80" r="1.6" />
        <circle cx="600" cy="100" r="1.4" />
        <circle cx="720" cy="46" r="1.8" />
        <circle cx="560" cy="56" r="1.2" />
      </g>
    </svg>
  );
}
