import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, HourglassIcon } from "lucide-react";

import { JobsView } from "./jobs-view";

export const metadata: Metadata = {
  title: "Jobs & imports",
};

export default function JobsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/admin/vocabularies"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Vocabulary
      </Link>

      <header className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          <HourglassIcon className="size-4.5" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Jobs &amp; imports
          </h1>
          <p className="text-sm text-muted-foreground">
            Track AI enrichment you’ve started. Running items refresh
            automatically — drafts land in Review when they finish.
          </p>
        </div>
      </header>

      <JobsView />
    </div>
  );
}
