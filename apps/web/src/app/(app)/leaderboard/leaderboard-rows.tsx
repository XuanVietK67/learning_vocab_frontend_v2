/**
 * The ranked-list row family for the leaderboard: a plain `RankRow` (rank ≥ 4),
 * the sticky violet `YouRow` (the caller's pinned standing), and `NoRankPrompt`
 * (shown instead of the you-row when the caller has no rank — branching
 * opted-out vs no-activity). All server-rendered; no client JS.
 */
import Link from "next/link";
import { BookOpenIcon, EyeOffIcon } from "lucide-react";

import type { LeaderboardEntry } from "@/lib/me/types";
import { cn } from "@/lib/utils";

import { EntryAvatar } from "./entry-avatar";

/** One ranked learner (ranks 4+). Highlights a violet band when it's the caller. */
export function RankRow({
  entry,
  isMe = false,
}: {
  entry: LeaderboardEntry;
  isMe?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 border-b border-(--line) px-2.5 py-[11px] transition-colors",
        isMe
          ? "rounded-xl border-transparent bg-(--violet-soft)"
          : "hover:bg-(--card-2)",
      )}
    >
      <div className="serif tnum w-[30px] flex-none text-right text-[17px] text-(--ink-3)">
        {entry.rank}
      </div>
      <EntryAvatar username={entry.username} avatarUrl={entry.avatarUrl} size={38} />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-[14.5px] font-semibold text-(--ink)">
          {entry.username ?? "—"}
        </span>
        {isMe && (
          <span className="rounded-full bg-(--violet) px-2 py-0.5 text-[10px] font-extrabold tracking-[0.04em] text-white uppercase">
            You
          </span>
        )}
      </div>
      <div className="tnum flex-none text-[15.5px] font-bold text-(--ink)">
        {entry.value}
      </div>
    </div>
  );
}

/** Sticky pinned row for the caller's own standing (when ranked and not in the visible list). */
export function YouRow({
  rank,
  value,
  username,
  avatarUrl,
}: {
  rank: number;
  value: number;
  username: string | null;
  avatarUrl: string | null;
}) {
  return (
    <div className="sticky bottom-[18px] z-20 mt-[18px]">
      <div className="flex items-center gap-3.5 rounded-[20px] border-[1.5px] border-[#cdc4ff] bg-(--violet-soft) px-[18px] py-3.5 shadow-[0_14px_34px_rgba(123,108,255,0.22)]">
        <div className="serif tnum w-[46px] flex-none text-right text-2xl text-[#5a4fd6]">
          {rank}
        </div>
        <EntryAvatar username={username ?? "You"} avatarUrl={avatarUrl} size={40} />
        <div className="flex flex-1 items-center gap-2">
          <span className="text-[15px] font-bold text-(--ink)">You</span>
          <span className="rounded-full bg-(--violet) px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-[0.04em] text-white uppercase">
            your rank
          </span>
        </div>
        <div className="tnum flex-none text-base font-extrabold text-[#5a4fd6]">
          {value}
        </div>
      </div>
    </div>
  );
}

/**
 * Shown in the sticky slot when `me.rank` is null. Opted-out users get a route to
 * Settings to re-appear; users with no qualifying activity get a study nudge.
 */
export function NoRankPrompt({ optedOut }: { optedOut: boolean }) {
  const copy = optedOut
    ? {
        title: "You're hidden from the leaderboard",
        sub: "Turn on “Appear on leaderboard” to claim your rank.",
        cta: "Open Settings",
        href: "/settings",
      }
    : {
        title: "Study a word to join the board",
        sub: "Master your first word and you’ll appear here.",
        cta: "Start studying",
        href: "/learn",
      };

  return (
    <div className="sticky bottom-[18px] z-20 mt-[18px]">
      <div className="flex items-center gap-4 rounded-[20px] border-[1.5px] border-[#cdc4ff] bg-(--surface) px-5 py-4 shadow-[0_14px_34px_rgba(123,108,255,0.18)]">
        <span className="flex size-[42px] flex-none items-center justify-center rounded-xl bg-(--violet-soft) text-(--violet)">
          {optedOut ? <EyeOffIcon size={22} /> : <BookOpenIcon size={22} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold text-(--ink)">{copy.title}</div>
          <div className="mt-px text-[13px] text-(--ink-2)">{copy.sub}</div>
        </div>
        {optedOut ? (
          <Link
            href={copy.href}
            className="inline-flex flex-none items-center rounded-full border border-[#cdc4ff] bg-(--violet-soft) px-4 py-2.5 text-[13.5px] font-bold text-[#5a4fd6] no-underline"
          >
            {copy.cta}
          </Link>
        ) : (
          <Link
            href={copy.href}
            className="lr-btn lr-btn--primary lr-btn--sm flex-none no-underline"
          >
            {copy.cta}
          </Link>
        )}
      </div>
    </div>
  );
}
