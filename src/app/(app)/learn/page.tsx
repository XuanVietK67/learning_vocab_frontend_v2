import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getTopics } from "@/lib/admin/topics";
import { getMyDecks } from "@/lib/me/decks";
import { getStats } from "@/lib/me/stats";
import { sessionModeSchema } from "@/lib/validations/learn";
import { DeckPicker } from "./deck-picker";
import { SessionRunner } from "./session-runner";
import { SourcePicker } from "./source-picker";
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

  // No mode yet — show the in-app source picker (the new /learn entry).
  if (!mode) {
    return <SourcePicker stats={await getStats()} />;
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
