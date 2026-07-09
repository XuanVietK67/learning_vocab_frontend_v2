import type { Metadata } from "next";

import { getMe } from "@/lib/auth/me";
import { CreateListForm } from "./create-list-form";

export const metadata: Metadata = { title: "New list" };

/** `/decks/new` — create a personal list, then fill it with words. */
export default async function NewDeckPage() {
  const me = await getMe();
  return <CreateListForm appLanguage={me?.targetLanguage ?? "en"} />;
}
