import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, LayersIcon } from "lucide-react";

import { BulkWizard } from "./bulk-wizard";
import { getTopics } from "@/lib/admin/topics";

export const metadata: Metadata = {
  title: "Bulk import vocabulary",
};

export default async function BulkImportPage() {
  const topics = await getTopics();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/admin/vocabularies"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Vocabulary
      </Link>

      <header className="flex items-start gap-4 rounded-xl border border-indigo-200/70 bg-linear-to-br from-indigo-50 via-violet-50 to-sky-50 p-5 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-sky-950/20">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
          <LayersIcon className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Bulk import
          </h1>
          <p className="text-sm text-muted-foreground">
            Bring in many words at once — extract candidates, confirm the list,
            then let AI draft them. You review every draft before it goes live.
          </p>
        </div>
      </header>

      <BulkWizard topics={topics} />
    </div>
  );
}
