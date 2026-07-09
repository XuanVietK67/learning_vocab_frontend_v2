import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMe } from "@/lib/auth/me";
import { getDeck } from "@/lib/me/decks";
import { ListDetailScreen } from "./list-detail-screen";

export const metadata: Metadata = { title: "List" };

/**
 * `/decks/:id` — one of the caller's lists with its words, plus the two
 * "add words" entry points. Unknown / not-owned ids map to `notFound()`.
 */
export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [deck, me] = await Promise.all([getDeck(id), getMe()]);
  if (!deck) notFound();

  return (
    <ListDetailScreen
      deck={deck}
      appLanguage={me?.targetLanguage ?? "en"}
      nativeLanguage={me?.nativeLanguage ?? "vi"}
      currentUserId={me?.id ?? null}
    />
  );
}
