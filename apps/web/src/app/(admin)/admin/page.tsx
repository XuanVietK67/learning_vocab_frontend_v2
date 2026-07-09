import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getTopics } from "@/lib/admin/topics";
import { listAdminVocabularies } from "@/lib/admin/vocabularies";

export const metadata: Metadata = {
  title: "Admin",
};

interface Stat {
  label: string;
  value: number;
}

export default async function AdminOverviewPage() {
  // Cheap counts: ask for a single row and read the `total` envelope field.
  const [all, system, user, topics] = await Promise.all([
    listAdminVocabularies({ limit: 1 }),
    listAdminVocabularies({ limit: 1, source: "system" }),
    listAdminVocabularies({ limit: 1, source: "user" }),
    getTopics(),
  ]);

  const stats: Stat[] = [
    { label: "Vocabularies", value: all.total },
    { label: "System words", value: system.total },
    { label: "User submissions", value: user.total },
    { label: "Topics", value: topics.length },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Admin overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage the shared vocabulary catalog and topic taxonomy.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tabular-nums">
                {stat.value.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium tracking-tight">
          Manage
        </h2>
        <Link href="/admin/vocabularies" className="group max-w-md">
          <Card className="transition-shadow group-hover:ring-foreground/20">
            <CardContent className="flex items-center justify-between gap-3">
              <span className="flex flex-col">
                <span className="font-medium">Vocabulary catalog</span>
                <span className="text-sm text-muted-foreground">
                  Browse, filter, and edit every word.
                </span>
              </span>
              <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
