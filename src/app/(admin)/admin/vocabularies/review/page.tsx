import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ListChecksIcon } from "lucide-react";

import { ReviewQueue } from "./review-queue";
import { listAdminVocabularies } from "@/lib/admin/vocabularies";

export const metadata: Metadata = {
  title: "Review drafts",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

export default async function ReviewDraftsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = one(sp.q);

  const result = await listAdminVocabularies({
    isApproved: false,
    q,
    limit: 100,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/admin/vocabularies"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Vocabulary
      </Link>

      <header className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <ListChecksIcon className="size-4.5" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Review drafts
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-generated drafts awaiting approval. Quality can be wrong — IPA and
            example sentences especially. Approve to publish, or reject to delete.
            {q ? ` Filtered to “${q}”.` : ""}
          </p>
        </div>
      </header>

      <ReviewQueue drafts={result.data} query={q} />
    </div>
  );
}
