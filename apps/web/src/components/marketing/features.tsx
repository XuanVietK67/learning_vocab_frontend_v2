import {
  FlameIcon,
  LayersIcon,
  MessagesSquareIcon,
  RefreshCwIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Soft chip color for the icon — one accent per pillar, matched to meaning. */
  chip: string;
}

const FEATURES: Feature[] = [
  {
    icon: MessagesSquareIcon,
    title: "Learn in context",
    description:
      "Words live in real sentences, not isolated lists, so the meaning sticks.",
    chip: "bg-(--primary-soft) text-(--primary-ink)",
  },
  {
    icon: RefreshCwIcon,
    title: "Spaced repetition",
    description:
      "A proven schedule resurfaces each word right on time, never wasted.",
    chip: "bg-(--sky-soft) text-(--sky)",
  },
  {
    icon: LayersIcon,
    title: "Topics and decks",
    description:
      "Study by topic, pick a curated deck, or build your own from words you add.",
    chip: "bg-(--violet-soft) text-(--violet)",
  },
  {
    icon: FlameIcon,
    title: "Streaks and goals",
    description:
      "Daily goals and streaks keep your momentum going day after day.",
    chip: "bg-(--amber-soft) text-(--amber-2)",
  },
];

/** Four-up grid of product pillars, one accent per pillar. */
export function Features() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mk-reveal mb-12 max-w-xl">
          <div className="mb-3.5 text-xs font-bold tracking-[0.12em] text-(--ink-3) uppercase">
            Why it works
          </div>
          <h2 className="font-(family-name:--serif) text-3xl font-medium tracking-tight text-(--ink) sm:text-4xl">
            Built around how memory actually works
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="lr-card hoverlift mk-reveal h-full p-7"
            >
              <span
                className={cn(
                  "mb-4.5 flex size-13 items-center justify-center rounded-(--r-tile)",
                  feature.chip,
                )}
              >
                <feature.icon className="size-6" />
              </span>
              <h3 className="mb-2 text-lg font-extrabold tracking-tight text-(--ink)">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-(--ink-2)">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
