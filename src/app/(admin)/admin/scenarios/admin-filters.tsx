"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2Icon } from "lucide-react";

import { CEFR_LEVELS } from "@/lib/me/speaking/format";
import type { PickTopic } from "@/lib/me/practice/queue";

/** Topic / level / status filters for the admin list — URL state, newest first. */
export function AdminScenarioFilters({
  topics,
  topic,
  cefrLevel,
  status,
}: {
  topics: PickTopic[];
  topic: string;
  cefrLevel: string;
  status: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(search.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <select
        aria-label="Filter by topic"
        className="lr-select"
        value={topic}
        onChange={(e) => setParam("topic", e.target.value)}
      >
        <option value="">All topics</option>
        {topics.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by level"
        className="lr-select"
        value={cefrLevel}
        onChange={(e) => setParam("cefrLevel", e.target.value)}
      >
        <option value="">All levels</option>
        {CEFR_LEVELS.map((lvl) => (
          <option key={lvl} value={lvl}>
            {lvl}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by status"
        className="lr-select"
        value={status}
        onChange={(e) => setParam("status", e.target.value)}
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Live</option>
        <option value="retired">Retired</option>
      </select>
      {pending && (
        <Loader2Icon className="size-4 animate-spin text-(--ink-3) motion-reduce:animate-none" />
      )}
    </div>
  );
}
