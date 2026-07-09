import type { Metadata } from "next";

import { getCommunityDecks } from "@/lib/me/decks";
import { CommunityScreen } from "./community-screen";

export const metadata: Metadata = { title: "Community" };

/**
 * `/community` — the public catalog of lists learners have shared. Filters
 * (`language` / `cefrLevel`) and `page` are URL-driven, so the server refetches
 * on every change. Renders the same `ListCard` family as My Lists, in community
 * mode (read-only, links to the preview).
 */
export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ language?: string; cefrLevel?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const language = sp.language ?? "any";
  const cefrLevel = sp.cefrLevel ?? "any";
  const page = Math.max(1, Number(sp.page) || 1);

  const result = await getCommunityDecks({ language, cefrLevel, page });

  return <CommunityScreen result={result} language={language} cefrLevel={cefrLevel} />;
}
