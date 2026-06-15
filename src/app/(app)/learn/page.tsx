import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getTopics } from "@/lib/admin/topics";
import { getMyDecks } from "@/lib/me/decks";
import { getStats } from "@/lib/me/stats";
import { sessionModeSchema } from "@/lib/validations/learn";
import { DeckPicker } from "./deck-picker";
import { LearnHub } from "./learn-hub";
import { SessionRunner } from "./session-runner";
import { TopicPicker } from "./topic-picker";

export const metadata: Metadata = {
  title: "Learn",
};

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; topicSlug?: string; deckId?: string }>;
}) {
  const { mode, topicSlug, deckId } = await searchParams;

  // No mode yet — show the learn hub (quick start + topic/deck rails).
  if (!mode) {
    const [stats, topics, decks] = await Promise.all([
      getStats(),
      getTopics(),
      getMyDecks(),
    ]);
    return <LearnHub stats={stats} topics={topics} decks={decks} />;
  }

  const parsedMode = sessionModeSchema.safeParse(mode);
  if (!parsedMode.success) redirect("/dashboard");
  const selectedMode = parsedMode.data;

  // Topic/deck modes need a target first — show the picker until one is chosen.
  if (selectedMode === "topic" && !topicSlug) {
    return <TopicPicker topics={await getTopics()} />;
  }
  if (selectedMode === "deck" && !deckId) {
    return <DeckPicker decks={await getMyDecks()} />;
  }

  return <SessionRunner mode={selectedMode} topicSlug={topicSlug} deckId={deckId} />;
}
