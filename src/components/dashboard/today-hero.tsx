import Link from "next/link";
import { FlameIcon, PlayIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatTimeUntil } from "@/lib/format";
import type { StatsResponse } from "@/lib/me/types";
import { cn } from "@/lib/utils";

/** Primary "Today" card — adapts copy + CTA to the user's queue state. */
export function TodayHero({ stats }: { stats: StatsResponse | null }) {
  if (!stats) {
    return (
      <Card>
        <CardContent className="text-sm text-muted-foreground">
          We couldn&apos;t load your progress right now. Refresh to try again.
        </CardContent>
      </Card>
    );
  }

  const { counts, dueNow, reviewedToday, streakDays, nextDueAt } = stats;
  const total = counts.new + counts.learning + counts.review + counts.mastered;
  const todayTotal = reviewedToday + dueNow;
  const progressPct =
    todayTotal > 0 ? Math.round((reviewedToday / todayTotal) * 100) : 0;

  let heading: string;
  let sub: string;
  let ctaLabel: string;

  if (total === 0) {
    heading = "Ready to learn your first words?";
    sub = "We'll pick words at your level and schedule them as you go.";
    ctaLabel = "Start your first session";
  } else if (dueNow > 0) {
    heading = `${dueNow} ${dueNow === 1 ? "card" : "cards"} due now`;
    sub = "Clear your queue to keep every word on schedule.";
    ctaLabel = "Start daily session";
  } else {
    heading = "You're all caught up";
    sub = nextDueAt
      ? `Next review ${formatTimeUntil(nextDueAt)}.`
      : "Nothing due right now.";
    ctaLabel = "Get ahead";
  }

  return (
    <Card className="gap-5 py-5">
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <FlameIcon
              className={cn(
                "size-4",
                streakDays > 0 ? "text-foreground" : "text-muted-foreground",
              )}
            />
            {streakDays > 0 ? `${streakDays}-day streak` : "No streak yet"}
          </span>
          <span className="text-muted-foreground">
            Goal · {stats.dailyGoalMinutes} min/day
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {heading}
          </h2>
          <p className="text-muted-foreground">{sub}</p>
        </div>

        {todayTotal > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Today&apos;s reviews</span>
              <span className="text-muted-foreground">
                {reviewedToday} done · {dueNow} left
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <Link
          href="/learn?mode=daily"
          className={cn(
            buttonVariants(),
            "h-11 w-full gap-2 px-6 text-base sm:w-fit",
          )}
        >
          <PlayIcon className="size-4" />
          {ctaLabel}
        </Link>
      </CardContent>
    </Card>
  );
}
