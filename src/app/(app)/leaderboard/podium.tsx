/**
 * Top-3 medal podium (design "medal cards" variant). #1 sits center and raised
 * with a gold halo + amber-tinted card; #2/#3 flank it in silver/bronze. Medals
 * stay warm metal regardless of the screen's violet accent. Degrades to whatever
 * entries exist (1 or 2) without leaving empty pedestals.
 */
import type { LeaderboardEntry } from "@/lib/me/types";
import { cn } from "@/lib/utils";

import { EntryAvatar } from "./entry-avatar";

type Place = 1 | 2 | 3;

const MEDAL: Record<Place, { ring: string; badge: string }> = {
  1: { ring: "#ffb020", badge: "#ffb020" },
  2: { ring: "#aeb7bd", badge: "#aeb7bd" },
  3: { ring: "#cd8a4e", badge: "#cd8a4e" },
};

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: Place }) {
  const featured = place === 1;
  const medal = MEDAL[place];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-[var(--r-tile)] border px-3.5 text-center",
        featured
          ? "flex-[1.12] border-[#ffe6b0] bg-[#fffaf0] pt-6 pb-5 shadow-[0_10px_26px_rgba(255,176,32,0.16)]"
          : "flex-1 border-(--line) bg-(--card-2) pt-[22px] pb-[18px]",
      )}
    >
      <div className="relative">
        <EntryAvatar
          username={entry.username}
          avatarUrl={entry.avatarUrl}
          size={featured ? 74 : 62}
          ring={medal.ring}
        />
        <span
          className={cn(
            "serif absolute -right-1.5 -bottom-1.5 flex items-center justify-center rounded-full border-2 border-white text-white",
            featured ? "size-7 text-base" : "size-6 text-sm",
          )}
          style={{ background: medal.badge }}
        >
          {place}
        </span>
      </div>
      <div
        className={cn(
          "max-w-full overflow-hidden font-bold text-ellipsis whitespace-nowrap text-(--ink)",
          featured ? "text-[15.5px]" : "text-[14.5px]",
        )}
      >
        {entry.username ?? "—"}
      </div>
      <div
        className={cn(
          "serif tnum font-medium text-(--ink)",
          featured ? "text-[32px]" : "text-[26px]",
        )}
      >
        {entry.value}
      </div>
      <div
        className={cn(
          "text-[11px] font-semibold tracking-[0.04em] uppercase",
          featured ? "text-[#b07d12]" : "text-(--ink-3)",
        )}
      >
        mastered
      </div>
    </div>
  );
}

export function Podium({ top }: { top: LeaderboardEntry[] }) {
  const byPlace: Record<Place, LeaderboardEntry | undefined> = {
    1: top[0],
    2: top[1],
    3: top[2],
  };
  // Center #1: render present places in 2 · 1 · 3 order so the leader sits middle.
  const order: Place[] = [2, 1, 3];

  return (
    <div className="flex items-stretch justify-center gap-3.5">
      {order.map((place) => {
        const entry = byPlace[place];
        return entry ? (
          <PodiumCard key={place} entry={entry} place={place} />
        ) : null;
      })}
    </div>
  );
}
