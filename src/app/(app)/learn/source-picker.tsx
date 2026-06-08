import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  FlameIcon,
  RefreshCwIcon,
  SparklesIcon,
  TagIcon,
} from "lucide-react";

import type { StatsResponse } from "@/lib/me/types";

/**
 * Entry screen for `/learn` (no `mode` in the URL): pick what to study. Daily
 * mix and Review start immediately; By topic / By deck fall through to their
 * sub-pickers. Review only appears when cards are actually due (brief §4).
 */
export function SourcePicker({ stats }: { stats: StatsResponse | null }) {
  const streakDays = stats?.streakDays ?? 0;
  const dueNow = stats?.dueNow ?? 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-150 flex-col justify-center px-4 py-8">
      <div className="learn-anim-in">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="lr-eyebrow mb-2">Ready to study</div>
            <h1 className="text-[34px] leading-tight font-extrabold tracking-tight">
              What’s the plan?
            </h1>
          </div>
          {streakDays > 0 && (
            <span className="lr-streak h-9 px-3.5 text-[15px]">
              <FlameIcon className="lr-flame lit size-5 fill-[#ff7a1a] text-[#ff7a1a]" />
              {streakDays}-day
            </span>
          )}
        </div>

        {/* Daily mix — hero */}
        <Link
          href="/learn?mode=daily"
          className="mb-3.5 flex items-center gap-4 rounded-[30px] bg-gradient-to-br from-[#14c08c] to-[#0ca576] p-6 text-white shadow-(--sh-primary) transition hover:-translate-y-0.5"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20">
            <SparklesIcon className="size-7" />
          </span>
          <div className="flex-1">
            <div className="text-xl font-extrabold">Daily mix</div>
            <div className="text-sm font-semibold text-white/90">
              A balanced set picked for you today
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-white/20 px-4 py-2.5 text-[15px] font-extrabold sm:flex">
            Start <ArrowRightIcon className="size-4.5" />
          </span>
        </Link>

        {/* Review — only when cards are due */}
        {dueNow > 0 && (
          <Link
            href="/learn?mode=review"
            className="learn-card mb-3.5 flex items-center gap-4 p-5 transition hover:-translate-y-0.5"
          >
            <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-(--amber-soft) text-(--amber-2)">
              <RefreshCwIcon className="size-6" />
            </span>
            <div className="flex-1">
              <div className="text-lg font-extrabold">Review</div>
              <div className="text-sm text-(--ink-2)">Cards due for their next look</div>
            </div>
            <span className="rounded-full bg-(--amber-soft) px-3 py-1.5 text-sm font-extrabold text-[#b5650c]">
              {dueNow} due
            </span>
          </Link>
        )}

        {/* Topic + Deck */}
        <div className="grid grid-cols-2 gap-3.5">
          <Link
            href="/learn?mode=topic"
            className="learn-card flex flex-col items-start gap-3 p-5 transition hover:-translate-y-0.5"
          >
            <span className="grid size-13 place-items-center rounded-2xl bg-(--violet-soft) text-(--violet)">
              <TagIcon className="size-6" />
            </span>
            <div>
              <div className="text-lg font-extrabold">By topic</div>
              <div className="mt-0.5 text-[13.5px] text-(--ink-2)">Focus a theme you care about</div>
            </div>
          </Link>
          <Link
            href="/learn?mode=deck"
            className="learn-card flex flex-col items-start gap-3 p-5 transition hover:-translate-y-0.5"
          >
            <span className="grid size-13 place-items-center rounded-2xl bg-(--sky-soft) text-(--sky)">
              <BookOpenIcon className="size-6" />
            </span>
            <div>
              <div className="text-lg font-extrabold">By deck</div>
              <div className="mt-0.5 text-[13.5px] text-(--ink-2)">Curated &amp; your own word sets</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
