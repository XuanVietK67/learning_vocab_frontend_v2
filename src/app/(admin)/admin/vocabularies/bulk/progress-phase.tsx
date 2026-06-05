"use client";

/**
 * Bulk phase 3 — batch progress. Unlike the single flow we have real counts
 * here, so the bar is determinate. Drafts trickle in (rate-limited), the admin
 * can leave and come back, and "skipped" words were still tagged with the topic.
 */
import Link from "next/link";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  HourglassIcon,
  Layers2Icon,
  ListChecksIcon,
  PartyPopperIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BatchStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export function ProgressPhase({
  batch,
  skipped,
  allSkipped,
  onNewImport,
}: {
  batch: BatchStatus | null;
  skipped: number;
  allSkipped: boolean;
  onNewImport: () => void;
}) {
  // Everything was skipped (already existed / already queued) → success, not error.
  if (allSkipped) {
    return (
      <div className="grid gap-5">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
              <CheckCircle2Icon className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                Nothing new to import
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {skipped > 0
                  ? `All ${skipped} word${skipped === 1 ? "" : "s"} already existed or were already queued.`
                  : "Every word was already in the catalog."}{" "}
                {skipped > 0 &&
                  "They were tagged with your topic, so your topic count still grew — they just weren’t recreated."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onNewImport}>
            <PlusIcon />
            Import more
          </Button>
          <Link href="/admin/vocabularies/review">
            <Button variant="ghost">
              <ListChecksIcon />
              Review drafts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Starting your import…
      </div>
    );
  }

  const done = batch.completed + batch.failed;
  const pct = batch.total ? Math.round((done / batch.total) * 100) : 0;
  const finished = done >= batch.total;

  const counters: {
    label: string;
    value: number;
    color: string;
    Icon: typeof Layers2Icon;
  }[] = [
    { label: "Total", value: batch.total, color: "text-foreground", Icon: Layers2Icon },
    {
      label: "Completed",
      value: batch.completed,
      color: "text-emerald-600 dark:text-emerald-400",
      Icon: CheckCircle2Icon,
    },
    {
      label: "Pending",
      value: batch.pending,
      color: "text-amber-600 dark:text-amber-400",
      Icon: ClockIcon,
    },
    {
      label: "Failed",
      value: batch.failed,
      color: "text-rose-600 dark:text-rose-400",
      Icon: AlertCircleIcon,
    },
  ];

  return (
    <div className="grid gap-5">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              finished
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
            )}
          >
            {finished ? (
              <PartyPopperIcon className="size-5" />
            ) : (
              <SparklesIcon className="size-5 animate-pulse" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              {finished ? "Import complete" : "Enriching your words…"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {finished
                ? `${batch.completed} draft${batch.completed === 1 ? "" : "s"} created and waiting for review.`
                : "Words are enriched one by one and rate-limited — a big batch can take several minutes. You can leave this page; it keeps running."}
            </p>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium tabular-nums">
                  {done} / {batch.total} done
                </span>
                <span className="text-muted-foreground tabular-nums">{pct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500 ease-out",
                    finished ? "bg-emerald-500" : "bg-primary",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {counters.map((c) => (
                <div key={c.label} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <c.Icon className="size-3.5" />
                    {c.label}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 font-heading text-2xl font-semibold tabular-nums",
                      c.color,
                    )}
                  >
                    {c.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {skipped > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-200/70 bg-sky-50/60 px-4 py-3 text-xs text-sky-900 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-200">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <span>
            <span className="font-medium">{skipped} skipped</span> — already
            existed or were already queued. They were tagged with your topic but
            not recreated, so your topic count still grew.
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/vocabularies/review">
          <Button disabled={!batch.completed}>
            <ListChecksIcon />
            Review {batch.completed} draft{batch.completed === 1 ? "" : "s"}
          </Button>
        </Link>
        <Link href="/admin/vocabularies/jobs">
          <Button variant="outline">
            <HourglassIcon />
            Track in Jobs
          </Button>
        </Link>
        {finished && (
          <Button variant="ghost" onClick={onNewImport}>
            <PlusIcon />
            Import more
          </Button>
        )}
      </div>
    </div>
  );
}
