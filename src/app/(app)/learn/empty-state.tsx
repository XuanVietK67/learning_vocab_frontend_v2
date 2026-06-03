import Link from "next/link";
import {
  CheckCircle2Icon,
  LayersIcon,
  PlusCircleIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimeUntil } from "@/lib/format";
import type { EmptyReason } from "@/lib/me/learn/types";

interface EmptyStateProps {
  reason: EmptyReason | null;
  nextDueAt: string | null;
}

interface Copy {
  icon: LucideIcon;
  title: string;
  body: string;
}

function copyFor(reason: EmptyReason | null, nextDueAt: string | null): Copy {
  switch (reason) {
    case "no_due_cards":
      return {
        icon: CheckCircle2Icon,
        title: "All caught up",
        body: nextDueAt
          ? `Nothing due right now. Come back ${formatTimeUntil(nextDueAt)}.`
          : "Nothing is due right now — check back later.",
      };
    case "no_more_at_level":
      return {
        icon: SparklesIcon,
        title: "No new words at your level",
        body: "Try raising your level in settings, or study a specific topic.",
      };
    case "no_enrollment":
      return {
        icon: PlusCircleIcon,
        title: "Nothing to study yet",
        body: "Pick a deck or topic to add words to your study set.",
      };
    case "deck_exhausted":
      return {
        icon: LayersIcon,
        title: "You've finished this deck",
        body: "Every word in this deck is scheduled. Try another deck or your daily mix.",
      };
    default:
      return {
        icon: CheckCircle2Icon,
        title: "Nothing to study",
        body: "There are no questions for this session right now.",
      };
  }
}

/** Terminal empty-session screen, keyed by the server's `emptyReason`. */
export function EmptyState({ reason, nextDueAt }: EmptyStateProps) {
  const { icon: Icon, title, body } = copyFor(reason, nextDueAt);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-foreground">
        <Icon className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{body}</p>
      </div>
      <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-5")}>
        Back to dashboard
      </Link>
    </div>
  );
}
