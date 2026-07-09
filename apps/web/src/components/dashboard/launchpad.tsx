import type { ReactNode } from "react";
import Link from "next/link";
import {
  BookMarkedIcon,
  CompassIcon,
  LayersIcon,
  MicIcon,
  PenLineIcon,
  UsersIcon,
} from "lucide-react";

import { QuickAddWord } from "./quick-add-word";
import { SectionHead } from "./widgets";

/**
 * Direction B launchpad (§7.3): an asymmetric 12-col mosaic — My Words (feature
 * tile + quick-add), Practice, My Lists, Explore, Community. Everything one
 * click away without crowding the daily-loop hero above it.
 */
export function Launchpad({
  wordsCount,
  listsCount,
  communityCount,
}: {
  wordsCount: number;
  listsCount: number;
  communityCount: number;
}) {
  return (
    <section>
      <SectionHead eyebrow="Launchpad" title="Everything, one click away" />
      <div className="grid grid-cols-12 gap-4">
        {/* My Words — feature */}
        <div className="lr-card hoverlift col-span-12 flex items-center gap-6 bg-[linear-gradient(135deg,#fff,var(--primary-soft))] p-[26px] shadow-[var(--sh-sm)] md:col-span-7">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="lr-eyebrow">My Words</p>
              <span className="flex size-9 items-center justify-center rounded-[11px] bg-(--primary) text-white">
                <BookMarkedIcon size={19} />
              </span>
            </div>
            <div className="serif tnum mt-2.5 mb-0.5 text-[54px] leading-none font-semibold text-(--primary-ink)">
              {wordsCount}
            </div>
            <p className="mb-3.5 text-sm text-(--ink-2)">
              {wordsCount ? "words in your collection" : "Start your collection"}
            </p>
            <QuickAddWord hasWords={wordsCount > 0} />
          </div>
        </div>

        {/* Practice */}
        <div className="lr-card hoverlift col-span-12 flex flex-col gap-3 bg-[linear-gradient(135deg,#fff,var(--sky-soft))] p-[26px] shadow-[var(--sh-sm)] md:col-span-5">
          <div className="flex items-center justify-between">
            <p className="lr-eyebrow">Practice</p>
            <span className="flex size-9 items-center justify-center rounded-[11px] bg-(--sky) text-white">
              <MicIcon size={19} />
            </span>
          </div>
          <h3 className="serif mt-0.5 text-[24px] font-semibold tracking-[-0.01em] text-(--ink)">
            Say it out loud
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="lr-chip lr-chip--sky">
              <MicIcon size={13} /> Pronounce
            </span>
            <span className="lr-chip">
              <PenLineIcon size={13} /> Write a line
            </span>
          </div>
          <Link
            href="/practice"
            className="lr-btn lr-btn--soft lr-btn--sm mt-auto self-start !bg-(--sky-soft) !text-[#0f5e80] no-underline"
          >
            Open Practice →
          </Link>
        </div>

        {/* My Lists */}
        <MosaicMini
          eyebrow="My Lists"
          icon={<LayersIcon size={18} />}
          big={listsCount}
          unit={listsCount === 1 ? "list" : "lists"}
          action={listsCount ? "+ New list" : "Make your first"}
          href="/decks"
        />

        {/* Explore */}
        <MosaicLink
          eyebrow="Explore"
          icon={<CompassIcon size={18} />}
          title="The catalog"
          desc="Curated lists, topics & words"
          cta="Browse →"
          href="/explore"
        />

        {/* Community */}
        <MosaicLink
          eyebrow="Community"
          icon={<UsersIcon size={18} />}
          title={communityCount ? `${communityCount} shared` : "Community"}
          desc="Lists published by learners"
          cta="Discover →"
          href="/community"
        />
      </div>
    </section>
  );
}

/** Small count-bearing tile (My Lists). */
function MosaicMini({
  eyebrow,
  icon,
  big,
  unit,
  action,
  href,
}: {
  eyebrow: string;
  icon: ReactNode;
  big: number;
  unit: string;
  action: string;
  href: string;
}) {
  return (
    <div className="lr-card hoverlift col-span-12 flex flex-col gap-2 p-[22px] shadow-[var(--sh-sm)] sm:col-span-6 md:col-span-4">
      <div className="flex items-center justify-between">
        <p className="lr-eyebrow">{eyebrow}</p>
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-(--primary-soft) text-(--primary)">
          {icon}
        </span>
      </div>
      <div className="serif tnum text-[38px] leading-none font-semibold text-(--ink)">
        {big}
      </div>
      <p className="mb-2 text-[13px] text-(--ink-3)">{unit}</p>
      <Link
        href={href}
        className="lr-btn lr-btn--soft lr-btn--sm mt-auto self-start no-underline"
      >
        {action}
      </Link>
    </div>
  );
}

/** Discovery tile (Explore / Community), violet accent. */
function MosaicLink({
  eyebrow,
  icon,
  title,
  desc,
  cta,
  href,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="lr-card hoverlift col-span-12 flex flex-col gap-2 p-[22px] shadow-[var(--sh-sm)] sm:col-span-6 md:col-span-4">
      <div className="flex items-center justify-between">
        <p className="lr-eyebrow">{eyebrow}</p>
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-(--violet-soft) text-(--violet)">
          {icon}
        </span>
      </div>
      <h3 className="serif mt-1 text-[21px] font-semibold text-(--ink)">
        {title}
      </h3>
      <p className="mb-2 text-[13px] text-(--ink-3)">{desc}</p>
      <Link
        href={href}
        className="lr-btn lr-btn--sm mt-auto self-start !bg-(--violet-soft) !text-[#4b3fb0] no-underline"
      >
        {cta}
      </Link>
    </div>
  );
}
