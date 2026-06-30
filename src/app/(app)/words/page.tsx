import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getMyWords } from "@/lib/me/vocabularies";
import { MyWordsScreen } from "./my-words-screen";
import {
  PAGE_SIZE_COOKIE,
  DEFAULT_PAGE_SIZE,
  clampPageSize,
} from "./pagination-config";

export const metadata: Metadata = { title: "My Words" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** First value of a (possibly repeated) search param. */
function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

/**
 * `/words` — the learner's own private words. Search and page live in the URL
 * (`?q=`, `?page=`); the page size is read from the `words_per_page` cookie the
 * client sets after measuring the viewport, so the server fetches exactly one
 * screenful. Reads happen here (the token is an httpOnly cookie); the client
 * screen owns the search box, the pager, and optimistic removal.
 */
export default async function WordsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = one(sp.q);
  const pageNum = Number.parseInt(one(sp.page) ?? "1", 10);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const cookieStore = await cookies();
  const rawSize = cookieStore.get(PAGE_SIZE_COOKIE)?.value;
  const limit = rawSize ? clampPageSize(Number.parseInt(rawSize, 10)) : DEFAULT_PAGE_SIZE;

  const result = await getMyWords({ q, page, limit });

  // A deep link (or a viewport that shrank the page size) can land past the
  // last page — bounce to the final page so the user never sees an empty card.
  const pageCount = Math.max(1, Math.ceil(result.total / result.limit));
  if (page > pageCount) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (pageCount > 1) params.set("page", String(pageCount));
    const qs = params.toString();
    redirect(qs ? `/words?${qs}` : "/words");
  }

  return (
    <MyWordsScreen
      words={result.data}
      total={result.total}
      page={page}
      limit={result.limit}
      query={q ?? ""}
    />
  );
}
