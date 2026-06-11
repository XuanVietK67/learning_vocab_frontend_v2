import type { Metadata } from "next";
import { Suspense } from "react";

import { CommunityRail } from "@/components/dashboard/community-rail";
import { HomeHero } from "@/components/dashboard/home-hero";
import { Launchpad } from "@/components/dashboard/launchpad";
import { ProgressGarden } from "@/components/dashboard/progress-garden";
import { SuggestedDecks } from "@/components/dashboard/suggested-decks";
import { RankTeaser, Sk } from "@/components/dashboard/widgets";
import { getMe } from "@/lib/auth/me";
import { getMyDecks, getPublicDecks, getSuggestedDecks } from "@/lib/me/decks";
import { getMyRank } from "@/lib/me/leaderboard";
import { getStats } from "@/lib/me/stats";
import { getWordsCount } from "@/lib/me/vocabularies";

export const metadata: Metadata = {
  title: "Home",
};

export default async function DashboardPage() {
  // Hero + progress + the My-Lists count run on these fast, cached calls (the
  // (app) layout already resolved getMe, so it's reused here). The secondary
  // rails below the fold stream in their own Suspense boundaries so nothing
  // blocks the hero — and each source degrades independently (§6, §8).
  const [user, stats, suggested, myDecks] = await Promise.all([
    getMe(),
    getStats(),
    getSuggestedDecks(),
    getMyDecks(),
  ]);

  return (
    <div className="lr-stagger mx-auto flex w-full max-w-[1140px] flex-col gap-9 px-4 py-8 sm:px-6 lg:py-10">
      {stats ? (
        <>
          <HomeHero
            stats={stats}
            username={user?.username ?? "there"}
            rankTeaser={
              <Suspense fallback={null}>
                <RankTeaserSlot />
              </Suspense>
            }
          />
          <ProgressGarden counts={stats.counts} />
        </>
      ) : (
        <StatsError />
      )}

      <Suspense fallback={<LaunchpadSkeleton />}>
        <LaunchpadSection listsCount={myDecks.length} />
      </Suspense>

      <SuggestedDecks decks={suggested} />

      <Suspense fallback={null}>
        <CommunitySection />
      </Suspense>
    </div>
  );
}

/** Streams the rank teaser into the hero corner without blocking it. */
async function RankTeaserSlot() {
  const me = await getMyRank();
  return <RankTeaser rank={me.rank} />;
}

/** Below-fold launchpad: words count + community count are secondary fetches. */
async function LaunchpadSection({ listsCount }: { listsCount: number }) {
  const [wordsCount, community] = await Promise.all([
    getWordsCount(),
    getPublicDecks(),
  ]);
  return (
    <Launchpad
      wordsCount={wordsCount}
      listsCount={listsCount}
      communityCount={community.length}
    />
  );
}

/** Below-fold community rail (`getPublicDecks` is deduped with the launchpad). */
async function CommunitySection() {
  const community = await getPublicDecks();
  return <CommunityRail decks={community} />;
}

function LaunchpadSkeleton() {
  return (
    <section>
      <Sk className="mb-[18px] h-7 w-56 rounded-[10px]" />
      <div className="grid grid-cols-12 gap-4">
        <Sk className="col-span-12 h-[176px] rounded-[var(--r-card)] md:col-span-7" />
        <Sk className="col-span-12 h-[176px] rounded-[var(--r-card)] md:col-span-5" />
        <Sk className="col-span-12 h-[150px] rounded-[var(--r-card)] sm:col-span-6 md:col-span-4" />
        <Sk className="col-span-12 h-[150px] rounded-[var(--r-card)] sm:col-span-6 md:col-span-4" />
        <Sk className="col-span-12 h-[150px] rounded-[var(--r-card)] sm:col-span-6 md:col-span-4" />
      </div>
    </section>
  );
}

function StatsError() {
  return (
    <section className="lr-card flex flex-col items-center gap-3 p-10 text-center">
      <h2 className="serif text-[22px] font-semibold text-(--ink)">
        We couldn&apos;t load your home right now
      </h2>
      <p className="text-(--ink-2)">Refresh to try again.</p>
    </section>
  );
}
