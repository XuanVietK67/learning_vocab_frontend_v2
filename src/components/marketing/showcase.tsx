import { Card, CardContent } from "@/components/ui/card";

const TOPICS = [
  "Food & Drink",
  "Travel",
  "Education",
  "Business",
  "Nature",
  "Technology",
  "Health",
  "Sport",
  "Daily Life",
  "Science",
] as const;

const DECKS = [
  { name: "Travel Essentials", level: "A2", count: 50 },
  { name: "Business Email", level: "B1", count: 40 },
  { name: "Everyday Verbs", level: "A1", count: 60 },
] as const;

/**
 * Static taste of the catalog — topic tags and curated decks. Illustrative only
 * (no backend call); real data loads once a learner signs in.
 */
export function Showcase() {
  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex max-w-xl flex-col gap-3">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            A catalog worth exploring
          </h2>
          <p className="text-lg text-muted-foreground">
            Thousands of curated words across topics and ready-made decks — plus
            the words you add yourself.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground"
            >
              {topic}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {DECKS.map((deck) => (
            <Card key={deck.name}>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-heading font-medium tracking-tight">
                    {deck.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {deck.count} words
                  </span>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                  {deck.level}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
