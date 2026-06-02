import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { TopicsTable } from "@/components/admin/topics-table";
import { buttonVariants } from "@/components/ui/button";
import { getTopics } from "@/lib/admin/topics";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Topics",
};

export default async function AdminTopicsPage() {
  const topics = await getTopics();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 lg:py-10">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Topics
          </h1>
          <p className="text-sm text-muted-foreground">
            Tags used to group vocabularies. The slug is the identifier and
            can&apos;t be renamed — delete and recreate to change it.
          </p>
        </div>
        <Link
          href="/admin/topics/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <PlusIcon className="size-4" />
          New topic
        </Link>
      </header>

      <TopicsTable topics={topics} />
    </div>
  );
}
