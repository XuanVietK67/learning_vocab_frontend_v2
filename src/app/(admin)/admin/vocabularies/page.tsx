import type { Metadata } from "next";

import { Pagination } from "@/components/admin/pagination";
import { VocabFilters } from "@/components/admin/vocab-filters";
import { VocabTable } from "@/components/admin/vocab-table";
import {
  CEFR_LEVELS,
  type AdminVocabularyFilters,
  type VocabSource,
} from "@/lib/admin/types";
import { listAdminVocabularies } from "@/lib/admin/vocabularies";
import type { CefrLevel } from "@/lib/auth/types";

export const metadata: Metadata = {
  title: "Vocabulary",
};

const PAGE_SIZE = 20;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** First value of a (possibly repeated) search param. */
function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

export default async function AdminVocabulariesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const cefrRaw = one(sp.cefrLevel);
  const sourceRaw = one(sp.source);
  const pageNum = Number.parseInt(one(sp.page) ?? "1", 10);

  const filters: AdminVocabularyFilters = {
    q: one(sp.q),
    language: one(sp.language),
    cefrLevel: CEFR_LEVELS.includes(cefrRaw as CefrLevel)
      ? (cefrRaw as CefrLevel)
      : undefined,
    source:
      sourceRaw === "system" || sourceRaw === "user"
        ? (sourceRaw as VocabSource)
        : undefined,
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
    limit: PAGE_SIZE,
  };

  const result = await listAdminVocabularies(filters);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Vocabulary
        </h1>
        <p className="text-sm text-muted-foreground">
          Every word in the catalog — system and user-submitted.
        </p>
      </header>

      <VocabFilters />

      {result.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
          No vocabularies match these filters.
        </div>
      ) : (
        <VocabTable items={result.data} />
      )}

      <Pagination
        page={result.page}
        limit={result.limit}
        total={result.total}
      />
    </div>
  );
}
