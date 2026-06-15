import type { Metadata } from "next";

import { getMe } from "@/lib/auth/me";
import { getPublicDeck } from "@/lib/me/decks";
import { PreviewScreen } from "./preview-screen";

export const metadata: Metadata = { title: "List preview" };

/**
 * `/community/:id` — read-only preview of a shared (or seeded) list, with a
 * "Save to my lists" clone CTA. A `null` deck means it went private or was
 * deleted (the API hides existence with a `404`) → the screen shows an
 * "unavailable" state. Words show the viewer's native language.
 */
export default async function CommunityDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();
  const deck = await getPublicDeck(id, me?.nativeLanguage ?? "vi");

  return (
    <PreviewScreen deck={deck} deckId={id} isLoggedIn={Boolean(me)} />
  );
}
