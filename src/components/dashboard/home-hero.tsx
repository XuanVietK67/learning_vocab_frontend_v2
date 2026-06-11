import type { ReactNode } from "react";
import Link from "next/link";
import { PlayIcon } from "lucide-react";

import { heroCopy } from "@/lib/me/hero-copy";
import type { StatsResponse } from "@/lib/me/types";
import { cn } from "@/lib/utils";

import { GoalRing } from "./widgets";

/**
 * Direction B "Trophy Room" hero (§7.1): an immersive mint→sky band with a
 * split panel — amber streak/goal side and the mint adaptive-CTA side. Holds
 * the screen's single high-emphasis button. The rank teaser streams in via the
 * `rankTeaser` slot so the hero never waits on the leaderboard call.
 */
export function HomeHero({
  stats,
  username,
  rankTeaser,
}: {
  stats: StatsResponse;
  username: string;
  rankTeaser?: ReactNode;
}) {
  const copy = heroCopy(stats);
  const muted = stats.streakDays <= 0;

  return (
    <section className="hero-band relative overflow-hidden rounded-[36px] border border-(--line) shadow-[var(--sh-lg)]">
      {/* soft corner glow ornament */}
      <div
        aria-hidden
        className={cn(
          "lr-float pointer-events-none absolute -top-9 -right-9 z-0 size-[150px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(255,176,32,0.30),transparent_70%)]",
          muted && "opacity-25",
        )}
      />

      {/* greeting + rank teaser */}
      <div className="relative z-[1] flex items-center justify-between gap-4 px-6 pt-[30px] pb-3 sm:px-9">
        <div>
          <p className="lr-eyebrow mb-2">Welcome back</p>
          <h1 className="serif text-[30px] font-semibold tracking-[-0.02em] text-(--ink)">
            Hi {username} 👋
          </h1>
        </div>
        {rankTeaser}
      </div>

      {/* split panel */}
      <div className="relative z-[1] mx-4 mt-2 mb-[26px] grid grid-cols-1 overflow-hidden rounded-[26px] border border-(--line) shadow-[var(--sh-md)] sm:mx-6 md:grid-cols-[0.78fr_1.22fr]">
        {/* amber streak side */}
        <div
          className={cn(
            "flex flex-col justify-center gap-1.5 border-(--line) px-7 py-[30px] md:border-r",
            muted
              ? "bg-(--card-2)"
              : "bg-[linear-gradient(160deg,#fff6e6,var(--amber-soft))]",
          )}
        >
          <p className={cn("lr-eyebrow", !muted && "!text-(--amber-2)")}>Streak</p>
          {muted ? (
            <>
              <div className="serif text-[48px] leading-none font-semibold text-(--ink-3)">
                —
              </div>
              <p className="mt-0.5 mb-3.5 text-[15px] font-semibold text-(--ink-2)">
                No streak yet
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="serif tnum text-[66px] leading-[0.9] font-semibold text-[#7a4a00]">
                  {stats.streakDays}
                </span>
                <span className="text-[16px] font-extrabold text-(--amber-2)">
                  days
                </span>
              </div>
              <p className="mt-0.5 mb-4 text-[14px] font-semibold text-[#92590a]">
                🔥 Keep the flame alive
              </p>
            </>
          )}
          <div className="flex items-center gap-[13px]">
            <GoalRing
              value={stats.reviewedToday}
              goal={stats.dailyGoalMinutes}
              size={64}
              stroke={8}
              label={false}
            />
            <div className="leading-[1.25]">
              <div className="lr-eyebrow text-[10.5px]">Daily goal</div>
              <div className="serif tnum text-[19px] font-semibold text-(--ink)">
                {stats.reviewedToday}
                <span className="text-[13px] text-(--ink-3)">
                  {" "}
                  / {stats.dailyGoalMinutes} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* mint CTA side */}
        <div className="flex flex-col justify-center gap-3.5 bg-(--surface) px-7 py-8 sm:px-[34px]">
          <p
            className={cn(
              "lr-eyebrow",
              copy.mode === "daily" && "!text-(--primary)",
            )}
          >
            {copy.kicker}
          </p>
          <h2 className="serif text-[40px] leading-[0.98] font-semibold tracking-[-0.025em] whitespace-pre-line text-(--ink) sm:text-[52px]">
            {copy.heading}
          </h2>
          <p className="max-w-[420px] text-[15px] text-(--ink-2)">{copy.sub}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <Link
              href={`/learn?mode=${copy.learnMode}`}
              className="lr-btn lr-btn--primary lr-btn--lg no-underline"
            >
              <PlayIcon size={17} /> {copy.cta}
            </Link>
            {stats.dueNow > 0 && (
              <span className="lr-chip lr-chip--mint tnum font-bold">
                {stats.dueNow} in queue
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
