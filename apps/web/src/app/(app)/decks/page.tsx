import type { Metadata } from "next";

import { getMe } from "@/lib/auth/me";
import { getMyDecks } from "@/lib/me/decks";
import { ListsScreen } from "./lists-screen";

export const metadata: Metadata = { title: "My Lists" };

/** `/decks` — the learner's own study lists, with create + bulk-import entry points. */
export default async function DecksPage() {
  const [decks, me] = await Promise.all([getMyDecks(), getMe()]);
  return (
    <ListsScreen
      decks={decks}
      appLanguage={me?.targetLanguage ?? "en"}
      nativeLanguage={me?.nativeLanguage ?? "vi"}
    />
  );
}
