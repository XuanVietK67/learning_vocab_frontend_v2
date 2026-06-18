import { cn } from "@/lib/utils";

/** Soft chip colors cycled across the topic wrap for an energetic catalog feel. */
const TOPIC_STYLES = [
  "bg-(--primary-soft) text-(--primary-ink)",
  "bg-(--sky-soft) text-(--sky)",
  "bg-(--violet-soft) text-(--violet)",
  "bg-(--amber-soft) text-(--amber-2)",
] as const;

const TOPICS = [
  "Travel",
  "Food & Cooking",
  "Business",
  "Daily Life",
  "Science",
  "Health",
  "Technology",
  "Nature",
  "Culture",
  "Sports",
  "Music",
  "News",
] as const;

const DECKS = [
  {
    name: "Café & Restaurant",
    level: "A2",
    meta: "48 words · ordering, menus, paying",
    words: ["bill", "reserve", "recommend"],
    badge: "bg-(--primary-soft) text-(--primary-ink)",
  },
  {
    name: "Startup & Work",
    level: "B1",
    meta: "60 words · meetings, email, roadmaps",
    words: ["deadline", "launch", "feedback"],
    badge: "bg-(--violet-soft) text-(--violet)",
  },
  {
    name: "Travel Essentials",
    level: "A2",
    meta: "52 words · airports, hotels, directions",
    words: ["boarding", "luggage", "nearby"],
    badge: "bg-(--primary-soft) text-(--primary-ink)",
  },
] as const;

/**
 * Static taste of the catalog — topic tags and curated decks. Illustrative only
 * (no backend call); real data loads once a learner signs in.
 */
export function Showcase() {
  return (
    <section className="mk-band-sky py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mk-reveal mx-auto mb-10 max-w-xl text-center">
          <div className="mb-3.5 text-xs font-bold tracking-[0.12em] text-(--ink-3) uppercase">
            A taste of the catalog
          </div>
          <h2 className="mb-3.5 font-(family-name:--serif) text-3xl font-medium tracking-tight text-(--ink) sm:text-4xl">
            Topics for the words you actually use
          </h2>
          <p className="text-lg leading-relaxed text-(--ink-2)">
            A representative sample of the decks and topics waiting inside.
          </p>
        </div>

        <div className="mk-reveal mx-auto mb-12 flex max-w-3xl flex-wrap justify-center gap-2.5">
          {TOPICS.map((topic, index) => (
            <span
              key={topic}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold",
                TOPIC_STYLES[index % TOPIC_STYLES.length],
              )}
            >
              {topic}
            </span>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {DECKS.map((deck) => (
            <div key={deck.name} className="lr-card hoverlift mk-reveal p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold tracking-tight text-(--ink)">
                  {deck.name}
                </h3>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold",
                    deck.badge,
                  )}
                >
                  {deck.level}
                </span>
              </div>
              <p className="mb-4 text-sm text-(--ink-3)">{deck.meta}</p>
              <div className="flex flex-wrap gap-2">
                {deck.words.map((word) => (
                  <span
                    key={word}
                    className="rounded-full border border-(--line-2) bg-(--card-2) px-3 py-1.5 text-[13px] font-semibold text-(--ink-2)"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
