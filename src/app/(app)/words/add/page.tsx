import type { Metadata } from "next";

import { getMe } from "@/lib/auth/me";
import { getTopics } from "@/lib/admin/topics";
import { AddWordScreen } from "./add-word-screen";

export const metadata: Metadata = { title: "Add a word" };

/**
 * `/words/add` — the add-a-word surface. Defaults to Quick add; `?manual=1`
 * (and the failed-quick-add fallback) opens the manual full form, `?lemma=`
 * pre-fills it. Topics + the user's languages are read here and passed down.
 */
export default async function AddWordPage({
  searchParams,
}: {
  searchParams: Promise<{ lemma?: string; manual?: string }>;
}) {
  const [me, topics, params] = await Promise.all([
    getMe(),
    getTopics(),
    searchParams,
  ]);

  return (
    <AddWordScreen
      initialManual={params.manual === "1"}
      initialLemma={params.lemma ?? ""}
      appLanguage={me?.targetLanguage ?? "en"}
      nativeLanguage={me?.nativeLanguage ?? "vi"}
      topics={topics.map((t) => ({ slug: t.slug, name: t.name }))}
    />
  );
}
