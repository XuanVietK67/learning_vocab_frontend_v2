import {
  FlameIcon,
  LayersIcon,
  MessagesSquareIcon,
  RefreshCwIcon,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: MessagesSquareIcon,
    title: "Learn in context",
    description:
      "Six question types generated from real sentences — cloze, meaning-in-context, sentence building, listening, and more.",
  },
  {
    icon: RefreshCwIcon,
    title: "Spaced repetition",
    description:
      "An SM-2 scheduler with Anki-style learning steps plans every review for the moment you're about to forget.",
  },
  {
    icon: LayersIcon,
    title: "Topics & decks",
    description:
      "Study by topic or curated deck, or build your own decks from words you add to your personal catalog.",
  },
  {
    icon: FlameIcon,
    title: "Streaks & goals",
    description:
      "Daily-minute goals, streaks, and mastery tracking turn steady practice into a habit you keep.",
  },
];

/** Four-up grid of product pillars. */
export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="flex max-w-xl flex-col gap-3">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Built to make words stick
        </h2>
        <p className="text-lg text-muted-foreground">
          Every part of the app is designed around one idea: you remember words
          you&apos;ve met in context.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="h-full">
            <CardContent className="flex h-full flex-col gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <feature.icon className="size-5" />
              </span>
              <h3 className="font-heading text-lg font-medium tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
