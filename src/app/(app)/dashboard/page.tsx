import type { Metadata } from "next";

import { PracticeModes } from "@/components/dashboard/practice-modes";
import { StatTiles } from "@/components/dashboard/stat-tiles";
import { SuggestedDecks } from "@/components/dashboard/suggested-decks";
import { TodayHero } from "@/components/dashboard/today-hero";
import { getMe } from "@/lib/auth/me";
import { getSuggestedDecks } from "@/lib/me/decks";
import { getStats } from "@/lib/me/stats";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  // The (app) layout guards auth; getMe() is cached so this reuses that request.
  const [user, stats, decks] = await Promise.all([
    getMe(),
    getStats(),
    getSuggestedDecks(),
  ]);

  const total = stats
    ? stats.counts.new +
      stats.counts.learning +
      stats.counts.review +
      stats.counts.mastered
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Welcome back{user ? `, ${user.username}` : ""}
      </h1>

      <TodayHero stats={stats} />
      {stats && total > 0 && <StatTiles counts={stats.counts} />}
      <PracticeModes />
      <SuggestedDecks decks={decks} />
    </div>
  );
}
