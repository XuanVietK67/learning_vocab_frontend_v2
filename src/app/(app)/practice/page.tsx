import type { Metadata } from "next";

import { getPracticeWord, getPracticeWords } from "@/lib/me/practice/words";
import { PracticeScreen } from "./practice-screen";

export const metadata: Metadata = { title: "Practice" };

/**
 * Practice route (server). Resolves the screen's initial data on the server —
 * the `?word=<id>` deep-link lands the user straight on that word; otherwise we
 * load the hub's due-word list. The `(app)` layout already guards auth and
 * supplies the branded `.app-shell`, so this page only owns the content.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ word?: string }>;
}) {
  const { word } = await searchParams;
  const [initialWord, initialWords] = await Promise.all([
    word ? getPracticeWord(word) : Promise.resolve(null),
    getPracticeWords(),
  ]);

  return <PracticeScreen initialWord={initialWord} initialWords={initialWords} />;
}
