import type { Metadata } from "next";
import Link from "next/link";
import { ListChecksIcon, PlusIcon } from "lucide-react";

import { Pagination } from "@/components/admin/pagination";
import { QuickAddMenu } from "@/components/admin/quick-add-menu";
import { VocabFilters } from "@/components/admin/vocab-filters";
import { VocabTable } from "@/components/admin/vocab-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

  const [result, pendingDrafts] = await Promise.all([
    listAdminVocabularies(filters),
    listAdminVocabularies({ isApproved: false, limit: 1 }),
  ]);
  const pendingCount = pendingDrafts.total;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:py-10">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Vocabulary
          </h1>
          <p className="text-sm text-muted-foreground">
            Every word in the catalog — system and user-submitted.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuickAddMenu />
          <Link
            href="/admin/vocabularies/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <PlusIcon className="size-4" />
            New word
          </Link>
        </div>
      </header>

      {pendingCount > 0 && (
        <Link
          href="/admin/vocabularies/review"
          className="flex items-center gap-3 rounded-xl border border-amber-200/70 bg-amber-50/50 px-4 py-3 text-sm transition-colors hover:bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10 dark:hover:bg-amber-500/15"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <ListChecksIcon className="size-4" />
          </span>
          <span className="flex-1">
            <span className="font-medium">
              {pendingCount} draft{pendingCount === 1 ? "" : "s"} waiting for
              review
            </span>
            <span className="block text-xs text-muted-foreground">
              AI-generated words are hidden from learners until you approve them.
            </span>
          </span>
          <span className="shrink-0 text-sm font-medium text-amber-700 dark:text-amber-300">
            Review →
          </span>
        </Link>
      )}

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
