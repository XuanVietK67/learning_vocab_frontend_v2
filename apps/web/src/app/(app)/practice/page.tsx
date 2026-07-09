import type { Metadata } from "next";

import { getPracticeWord } from "@/lib/me/practice/words";
import { getPracticeSuggestions, getPracticeTopics } from "@/lib/me/practice/queue";
import { PracticeScreen } from "./practice-screen";

export const metadata: Metadata = { title: "Practice" };

/** Default quick-start size — sensible, one tap away (brief §4.1, §10.2). */
const DEFAULT_COUNT = 8;

/**
 * Practice route (server). The `?word=<id>` deep-link skips the picker and lands
 * straight in the word-anchored runner; otherwise we prefetch the Quick start
 * queue (so the hub renders ready, no client loading flash) and the topic
 * taxonomy for the Hand-pick filters. The `(app)` layout already guards auth and
 * supplies the branded `.app-shell`, so this page only owns the content.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ word?: string }>;
}) {
  const { word } = await searchParams;
  const [initialWord, initialSuggestions, topics] = await Promise.all([
    word ? getPracticeWord(word) : Promise.resolve(null),
    getPracticeSuggestions(DEFAULT_COUNT),
    getPracticeTopics(),
  ]);

  return (
    <PracticeScreen
      initialWord={initialWord}
      initialSuggestions={initialSuggestions}
      defaultCount={DEFAULT_COUNT}
      topics={topics}
    />
  );
}
