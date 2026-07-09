/**
 * Shared home widgets (Direction B). Pure presentational Server Components —
 * no client JS — composed by the home sections. Colors resolve from the
 * `.app-shell` Sprout tokens (see globals.css); the `.lr-*`/`.serif`/`.tnum`
 * atoms come from there too.
 */
import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  ChevronRightIcon,
  FlameIcon,
  MedalIcon,
  UsersIcon,
} from "lucide-react";

import type { StatsCounts, DeckSummary } from "@/lib/me/types";
import { cn } from "@/lib/utils";

/* ---------- Count ramp (new → mastered), mint deepening (§7.2) ---------- */
export const ORDER: (keyof StatsCounts)[] = [
  "new",
  "learning",
  "review",
  "mastered",
];

export const RAMP: Record<keyof StatsCounts, { color: string; label: string }> = {
  new: { color: "var(--ink-3)", label: "New" },
  learning: { color: "var(--primary-soft-2)", label: "Learning" },
  review: { color: "var(--primary)", label: "Review" },
  mastered: { color: "var(--primary-ink)", label: "Mastered" },
};

export function countsTotal(counts: StatsCounts): number {
  return ORDER.reduce((sum, key) => sum + counts[key], 0);
}

/* ---------- List card provenance (§7.4) ---------- */
export type ListCardKind = "official" | "mine" | "community";

/**
 * Home-rail deck. `visibility`, `ownerId`, and `author` now live on `DeckSummary`
 * itself (the share/clone feature), so this is just an alias kept for call-site
 * readability.
 */
export type HomeDeck = DeckSummary;

/* ---------- Streak badge (amber, serif number) ---------- */
export function StreakBadge({ days, big = false }: { days: number; big?: boolean }) {
  const muted = days <= 0;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-extrabold",
        big ? "py-[9px] pr-4 pl-[11px] text-[15px]" : "py-[7px] pr-[13px] pl-[9px] text-[13px]",
        muted
          ? "border-(--line-2) bg-(--card-2) text-(--ink-3)"
          : "border-[#ffe2ad] bg-[linear-gradient(135deg,var(--amber-soft),#fff)] text-[#92590a]",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full",
          big ? "size-[30px]" : "size-[26px]",
          muted
            ? "bg-[#cdd6d1]"
            : "bg-[linear-gradient(135deg,var(--amber),var(--amber-2))] shadow-[0_4px_10px_-2px_rgba(255,140,30,0.5)]",
        )}
      >
        <FlameIcon className="text-white" size={big ? 17 : 15} strokeWidth={2.2} />
      </span>
      {muted ? (
        <span>No streak yet</span>
      ) : (
        <span>
          <b className={cn("serif tnum", big ? "text-[18px]" : "text-[15px]")}>
            {days}
          </b>
          -day streak
        </span>
      )}
    </div>
  );
}

/* ---------- Amber goal ring (reviewed vs daily goal) ---------- */
export function GoalRing({
  value,
  goal,
  size = 116,
  stroke = 11,
  accent = "var(--amber)",
  label = true,
}: {
  value: number;
  goal: number;
  size?: number;
  stroke?: number;
  accent?: string;
  label?: boolean;
}) {
  const pct = goal ? Math.min(1, value / goal) : 0;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--card-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      {label && (
        <div className="donut-center">
          <div
            className="serif tnum font-semibold text-(--ink)"
            style={{ fontSize: size * 0.27 }}
          >
            {value}
          </div>
          <div className="tnum text-[12px] font-bold text-(--ink-3)">
            / {goal} min
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Progress donut over counts (mint ramp) ---------- */
export function ProgressDonut({
  counts,
  size = 168,
  stroke = 22,
}: {
  counts: StatsCounts;
  size?: number;
  stroke?: number;
}) {
  const total = countsTotal(counts);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--card-2)"
          strokeWidth={stroke}
        />
        {total > 0 &&
          ORDER.map((key) => {
            const frac = counts[key] / total;
            const seg = (
              <circle
                key={key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={RAMP[key].color}
                strokeWidth={stroke}
                strokeDasharray={`${circ * frac} ${circ}`}
                strokeDashoffset={-circ * acc}
              />
            );
            acc += frac;
            return seg;
          })}
      </svg>
      <div className="donut-center">
        <div
          className="serif tnum font-semibold text-(--ink)"
          style={{ fontSize: size * 0.24 }}
        >
          {total}
        </div>
        <p className="lr-eyebrow mt-[3px] text-[10.5px]">words</p>
      </div>
    </div>
  );
}

/* ---------- Progress legend ---------- */
export function ProgressLegend({
  counts,
  cols = 2,
}: {
  counts: StatsCounts;
  cols?: number;
}) {
  return (
    <div
      className="grid gap-x-[22px] gap-y-[10px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
    >
      {ORDER.map((key) => (
        <div key={key} className="flex items-center gap-[9px]">
          <span
            className="size-[11px] shrink-0 rounded-[4px]"
            style={{ background: RAMP[key].color }}
          />
          <span className="text-[13.5px] font-semibold text-(--ink-2)">
            {RAMP[key].label}
          </span>
          <span className="serif tnum ml-auto text-[18px] font-semibold text-(--ink)">
            {counts[key]}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Provenance badge ---------- */
export function Provenance({
  kind,
  author,
}: {
  kind: ListCardKind;
  author?: string | null;
}) {
  if (kind === "official") {
    return (
      <span className="prov prov--official">
        <BadgeCheckIcon size={13} /> Official
      </span>
    );
  }
  if (kind === "community") {
    return (
      <span className="prov prov--community">
        <UsersIcon size={12} /> Community{author ? ` · @${author}` : ""}
      </span>
    );
  }
  return <span className="prov prov--mine">Mine</span>;
}

/* ---------- CEFR pill ---------- */
export function CefrPill({ level }: { level: string }) {
  return <span className="lr-typepill">{level}</span>;
}

/* ---------- List card — one family, provenance varies (§7.4) ---------- */
export function ListCard({ deck, kind }: { deck: HomeDeck; kind: ListCardKind }) {
  const meta = (
    <>
      <div className="flex items-center justify-between gap-2.5">
        <Provenance kind={kind} author={deck.author} />
        {kind === "mine" && deck.visibility && (
          <span
            className={cn(
              "lr-typepill",
              deck.visibility === "public"
                ? "!bg-(--primary-soft) !text-(--primary-ink)"
                : "!bg-(--card-2) !text-(--ink-3)",
            )}
          >
            {deck.visibility === "public" ? "Public" : "Private"}
          </span>
        )}
      </div>
      <div>
        <h4 className="serif mb-[7px] text-[19px] leading-[1.15] font-semibold tracking-[-0.01em] text-(--ink)">
          {deck.name}
        </h4>
        {deck.description && (
          <p className="line-clamp-2 text-[13.5px] leading-[1.5] text-(--ink-2)">
            {deck.description}
          </p>
        )}
      </div>
      <div className="mt-auto flex items-center gap-[9px] pt-1">
        {deck.cefrLevel && <CefrPill level={deck.cefrLevel} />}
        <span className="tnum text-[13px] font-semibold text-(--ink-3)">
          {deck.vocabCount} words
        </span>
        {kind === "community" ? (
          <Link
            href="/community"
            className="lr-btn lr-btn--soft lr-btn--sm ml-auto"
          >
            Clone
          </Link>
        ) : (
          <ChevronRightIcon size={18} className="ml-auto text-(--ink-3)" />
        )}
      </div>
    </>
  );

  const cardClass =
    "lr-card hoverlift flex flex-col gap-3 p-5 shadow-[var(--sh-sm)]";

  // Community cards aren't a single link (the Clone button is its own link, and
  // nesting <a> is invalid) — the whole-card link is reserved for study decks.
  if (kind === "community") {
    return <div className={cardClass}>{meta}</div>;
  }

  return (
    <Link
      href={`/learn?mode=deck&deckId=${deck.id}`}
      className={cn(cardClass, "no-underline")}
    >
      {meta}
    </Link>
  );
}

/* ---------- Rank teaser (violet) ---------- */
export function RankTeaser({ rank }: { rank: number | null }) {
  if (rank == null) return null;
  return (
    <Link
      href="/leaderboard"
      className="lr-chip lr-chip--violet font-bold no-underline"
    >
      <MedalIcon size={15} className="text-(--violet)" />
      <span className="tnum">#{rank}</span>
      <span className="opacity-70">· You</span>
      <ArrowRightIcon size={13} />
    </Link>
  );
}

/* ---------- Section header ---------- */
export function SectionHead({
  eyebrow,
  title,
  sub,
  aside,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-[18px] flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="lr-eyebrow mb-[7px]">{eyebrow}</p>}
        <h2 className="serif text-[25px] font-semibold tracking-[-0.015em] text-(--ink)">
          {title}
        </h2>
        {sub && <p className="mt-1.5 text-sm text-(--ink-2)">{sub}</p>}
      </div>
      {aside}
    </div>
  );
}

/* ---------- Skeleton block ---------- */
export function Sk({ className }: { className?: string }) {
  return <div className={cn("lr-sk", className)} />;
}
