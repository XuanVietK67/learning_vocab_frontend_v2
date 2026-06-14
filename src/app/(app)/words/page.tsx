import type { Metadata } from "next";

import { getMyWords } from "@/lib/me/vocabularies";
import { MyWordsScreen } from "./my-words-screen";

export const metadata: Metadata = { title: "My Words" };

/**
 * `/words` — the learner's own private words. Loads the first page server-side
 * (the token lives in an httpOnly cookie, so reads happen here, not on the
 * client) and hands the list to a client screen that owns search + removal.
 */
export default async function WordsPage() {
  const { data, total } = await getMyWords({ limit: 100 });
  return <MyWordsScreen words={data} total={total} />;
}
