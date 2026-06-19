/**
 * `/leaderboard` — the words-mastered (all-time) board. Header band + board tabs
 * (the weekly `new_words` tab is disabled until backend Phase 2), a podium for
 * the top 3, the ranked list, and the caller's pinned standing. Fully
 * server-rendered (read-only, single page); see leaderboard_design_context.md.
 */
import Link from "next/link";
import {
  RotateCwIcon,
  TrophyIcon,
  WifiOffIcon,
} from "lucide-react";

import type { UserResponse } from "@/lib/auth/types";
import type { LeaderboardResponse } from "@/lib/me/types";

import { NoRankPrompt, RankRow, YouRow } from "./leaderboard-rows";
import { Podium } from "./podium";

export function LeaderboardScreen({
  board,
  user,
}: {
  board: LeaderboardResponse | null;
  user: UserResponse | null;
}) {
  return (
    <div className="lr-stagger mx-auto w-full max-w-[860px] px-4 pt-6 pb-[150px] sm:px-6">
      <div className="flex flex-col gap-[22px]">
        <Header />
        <div className="lr-card p-5">
          {board === null ? (
            <ErrorState />
          ) : board.data.length === 0 ? (
            <EmptyState />
          ) : (
            <Board board={board} />
          )}
        </div>
      </div>

      {board && <Footer board={board} user={user} />}
    </div>
  );
}

/* ---------- Header band + board tabs ---------- */
function Header() {
  return (
    <div className="lb-band relative overflow-hidden rounded-[30px] border border-(--line) px-8 pt-[30px] pb-[26px] shadow-[var(--sh-md)]">
      <div className="flex items-center gap-3.5">
        <span className="flex size-[46px] flex-none items-center justify-center rounded-[14px] bg-(--violet-soft) text-(--violet) shadow-[inset_0_0_0_1px_rgba(123,108,255,0.25)]">
          <TrophyIcon size={24} strokeWidth={1.8} />
        </span>
        <h1 className="serif text-[40px] leading-[1.05] font-medium tracking-[-0.01em] text-(--ink)">
          Leaderboard
        </h1>
      </div>
      <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.5] text-(--ink-2)">
        See how your words-mastered rank stacks up against the community.
      </p>

      <div role="tablist" className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          role="tab"
          aria-selected="true"
          className="inline-flex items-center gap-2 rounded-full border border-[#cdc4ff] bg-(--violet-soft) px-4 py-2.5 text-[13.5px] font-bold text-[#5a4fd6]"
        >
          <span className="size-[7px] rounded-full bg-(--violet)" />
          Mastered · all-time
        </button>
        <button
          type="button"
          role="tab"
          aria-disabled="true"
          disabled
          title="Coming soon"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-(--line) bg-(--card-2) px-4 py-2.5 text-[13.5px] font-semibold text-(--ink-3)"
        >
          New words · this week
          <span className="rounded-full bg-(--line) px-1.5 py-0.5 text-[10px] font-extrabold tracking-[0.05em] text-(--ink-3) uppercase">
            Soon
          </span>
        </button>
      </div>
    </div>
  );
}

/* ---------- Populated: podium + ranked list ---------- */
function Board({ board }: { board: LeaderboardResponse }) {
  const { data, me } = board;
  const top = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <>
      <Podium top={top} />
      {rest.length > 0 && (
        <>
          <div className="mx-0.5 my-[18px] h-px bg-(--line)" />
          <div>
            {rest.map((entry) => (
              <RankRow
                key={entry.userId}
                entry={entry}
                isMe={me.rank !== null && me.rank === entry.rank}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ---------- Sticky footer: you-row or no-rank prompt ---------- */
function Footer({
  board,
  user,
}: {
  board: LeaderboardResponse;
  user: UserResponse | null;
}) {
  const { data, me } = board;

  if (me.rank === null) {
    return <NoRankPrompt optedOut={user?.leaderboardOptOut ?? false} />;
  }
  // Already visible in the list (sequential ranks → in-list when rank ≤ count).
  // The in-list row carries the highlight, so skip the sticky duplicate.
  if (me.rank <= data.length) return null;

  return (
    <YouRow
      rank={me.rank}
      value={me.value}
      username={user?.username ?? null}
      avatarUrl={user?.avatarUrl ?? null}
    />
  );
}

/* ---------- States ---------- */
function EmptyState() {
  return (
    <div className="px-6 py-[54px] text-center">
      <span className="mb-4 inline-flex size-[52px] items-center justify-center rounded-2xl bg-(--violet-soft) text-(--violet)">
        <TrophyIcon size={26} strokeWidth={1.7} />
      </span>
      <p className="serif mb-1 text-lg font-bold text-(--ink)">
        No one&apos;s reached mastery yet.
      </p>
      <p className="text-[14.5px] text-(--ink-2)">
        Be the first to master a word and claim the top spot.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="px-6 py-[54px] text-center">
      <span className="mb-4 inline-flex size-[52px] items-center justify-center rounded-2xl bg-(--card-2) text-(--ink-3)">
        <WifiOffIcon size={26} strokeWidth={1.7} />
      </span>
      <p className="mb-1 text-[17px] font-bold text-(--ink)">
        We couldn&apos;t load the leaderboard right now.
      </p>
      <p className="mb-5 text-sm text-(--ink-2)">
        Check your connection and try again.
      </p>
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-2 rounded-full border border-[#cdc4ff] bg-(--violet-soft) px-5 py-2.5 text-sm font-bold text-[#5a4fd6] no-underline"
      >
        <RotateCwIcon size={15} /> Try again
      </Link>
    </div>
  );
}
