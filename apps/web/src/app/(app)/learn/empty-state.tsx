import Link from "next/link";
import {
  ClockIcon,
  DumbbellIcon,
  PartyPopperIcon,
  PlusCircleIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TrophyIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatTimeUntil } from "@/lib/format";
import type { EmptyReason } from "@/lib/me/learn/types";

interface EmptyStateProps {
  reason: EmptyReason | null;
  nextDueAt: string | null;
  /** This session was itself a free-practice run (changes the exhausted copy). */
  practice?: boolean;
  /** When set, offer a "Practice again" CTA that re-studies ignoring due dates. */
  practiceHref?: string;
  /** Label for the practice CTA (e.g. "Practice this deck"). */
  practiceLabel?: string;
  /** The session had questions, but the user's question-type filter hid them all. */
  filtered?: boolean;
  /** Turn every question type back on and restart (paired with `filtered`). */
  onRestoreTypes?: () => void;
}

type Tint = "primary" | "violet" | "amber";

interface Copy {
  icon: LucideIcon;
  tint: Tint;
  title: string;
  body: string;
  /** Primary action. */
  cta: { label: string; href: string };
  /** Secondary action. */
  alt: { label: string; href: string };
}

const TINT_TILE: Record<Tint, string> = {
  primary: "bg-(--primary-soft) text-(--primary-ink)",
  violet: "bg-(--violet-soft) text-(--violet)",
  amber: "bg-(--amber-soft) text-(--amber-2)",
};

function copyFor(
  reason: EmptyReason | null,
  nextDueAt: string | null,
  practice: boolean,
  filtered: boolean,
): Copy {
  // The user filtered out every type this session's words offered.
  if (filtered) {
    return {
      icon: SlidersHorizontalIcon,
      tint: "violet",
      title: "Those question types are off",
      body: "This session's words only had question types you've turned off. Turn some back on to study them.",
      cta: { label: "Back to dashboard", href: "/dashboard" },
      alt: { label: "Browse topics", href: "/learn?mode=topic" },
    };
  }

  // A practice run never waits on a clock — exhaustion just means "all drilled".
  if (practice) {
    return {
      icon: TrophyIcon,
      tint: "primary",
      title: "Drilled them all!",
      body: "You’ve practised every word in this set. Take a breather or pick another.",
      cta: { label: "Back to dashboard", href: "/dashboard" },
      alt: { label: "Pick another deck", href: "/learn?mode=deck" },
    };
  }

  switch (reason) {
    case "no_due_cards":
      return {
        icon: PartyPopperIcon,
        tint: "primary",
        title: "All caught up!",
        body: nextDueAt
          ? `You’ve reviewed everything due. Come back ${formatTimeUntil(nextDueAt)}.`
          : "You’ve reviewed everything due today. Nice momentum.",
        cta: { label: "Back to dashboard", href: "/dashboard" },
        alt: { label: "Study ahead anyway", href: "/learn?mode=daily" },
      };
    case "no_more_at_level":
      return {
        icon: SparklesIcon,
        tint: "violet",
        title: "No new words at your level",
        body: "You’ve learned everything unlocked so far. Branch into a topic to keep going.",
        cta: { label: "Browse topics", href: "/learn?mode=topic" },
        alt: { label: "Back to dashboard", href: "/dashboard" },
      };
    case "no_enrollment":
      return {
        icon: PlusCircleIcon,
        tint: "amber",
        title: "Nothing to study yet",
        body: "Pick a deck or a topic and we’ll start building your daily reviews.",
        cta: { label: "Choose a deck", href: "/learn?mode=deck" },
        alt: { label: "Browse topics", href: "/learn?mode=topic" },
      };
    case "deck_exhausted":
      return {
        icon: TrophyIcon,
        tint: "amber",
        title: "You finished this deck!",
        body: "Every word in this deck is in rotation. Ready for the next one?",
        cta: { label: "Pick another deck", href: "/learn?mode=deck" },
        alt: { label: "Back to dashboard", href: "/dashboard" },
      };
    default:
      return {
        icon: ClockIcon,
        tint: "primary",
        title: "Nothing to study",
        body: "There are no questions for this session right now.",
        cta: { label: "Back to dashboard", href: "/dashboard" },
        alt: { label: "Study the daily mix", href: "/learn?mode=daily" },
      };
  }
}

/** Terminal empty-session screen, keyed by the server's `emptyReason`. */
export function EmptyState({
  reason,
  nextDueAt,
  practice = false,
  practiceHref,
  practiceLabel = "Practice these words",
  filtered = false,
  onRestoreTypes,
}: EmptyStateProps) {
  const { icon: Icon, tint, title, body, cta, alt } = copyFor(
    reason,
    nextDueAt,
    practice,
    filtered,
  );
  // In practice mode there's no clock to count down to.
  const showCountdown = !practice && !filtered && reason === "no_due_cards" && nextDueAt;
  const showRestore = filtered && Boolean(onRestoreTypes);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="learn-anim-in learn-card p-9 text-center sm:p-10">
        <div
          className={cn(
            "lr-pop lr-float mx-auto mb-5 grid size-23 place-items-center rounded-3xl",
            TINT_TILE[tint],
          )}
        >
          <Icon className="size-11" strokeWidth={1.8} />
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight">{title}</h1>
        <p className="mt-3 text-(--ink-2)">{body}</p>

        {showCountdown && nextDueAt && (
          <div className="mt-5 flex justify-center">
            <span className="lr-chip">
              <ClockIcon className="size-4" />
              Next review {formatTimeUntil(nextDueAt)}
            </span>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-2.5">
          {showRestore && (
            <button
              type="button"
              onClick={onRestoreTypes}
              className="lr-btn lr-btn--primary lr-btn--lg lr-btn--block"
            >
              <SlidersHorizontalIcon className="size-5" />
              Turn all types on
            </button>
          )}
          {practiceHref && !filtered && (
            <Link
              href={practiceHref}
              className="lr-btn lr-btn--primary lr-btn--lg lr-btn--block"
            >
              <DumbbellIcon className="size-5" />
              {practiceLabel}
            </Link>
          )}
          <Link
            href={cta.href}
            className={cn(
              "lr-btn lr-btn--block",
              (practiceHref && !filtered) || showRestore
                ? "lr-btn--ghost lr-btn--md"
                : "lr-btn--primary lr-btn--lg",
            )}
          >
            {cta.label}
          </Link>
          <Link href={alt.href} className="lr-btn lr-btn--ghost lr-btn--md lr-btn--block">
            {alt.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
