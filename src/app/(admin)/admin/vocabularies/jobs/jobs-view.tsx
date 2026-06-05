"use client";

/**
 * Jobs & imports — the persistent view of async enrichment work the admin
 * started. Items are read from the localStorage tracker (the backend has no
 * "list my jobs" endpoint), and any still-running item is polled here so its
 * progress stays fresh even after navigating away and back.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  HourglassIcon,
  LayersIcon,
  ListChecksIcon,
  Loader2Icon,
  SparklesIcon,
  XIcon,
} from "lucide-react";

import { ToneBadge } from "@/components/admin/tone-badge";
import { Button } from "@/components/ui/button";
import { pollBatchAction, pollJobAction } from "@/lib/admin/quick";
import {
  isActive,
  upsertTracked,
  useQuickJobs,
  type TrackedBatch,
  type TrackedItem,
  type TrackedJob,
} from "@/hooks/use-quick-jobs";
import { cn } from "@/lib/utils";

const POLL_MS = 4000;

export function JobsView() {
  const { items, activeCount, remove, clearFinished } = useQuickJobs();

  // Poll still-running items on an interval, reading the latest list from a ref.
  const itemsRef = useRef<TrackedItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function loop() {
      const active = itemsRef.current.filter(isActive);
      for (const it of active) {
        if (it.kind === "single") {
          const r = await pollJobAction(it.id);
          if (r.ok) {
            const j = r.data;
            upsertTracked({
              ...it,
              status:
                j.status === "completed"
                  ? j.resultVocabularyIds.length
                    ? "completed"
                    : "empty"
                  : j.status,
              resultCount: j.resultVocabularyIds.length,
            });
          }
        } else {
          const r = await pollBatchAction(it.id);
          if (r.ok) {
            const b = r.data;
            upsertTracked({
              ...it,
              total: b.total,
              completed: b.completed,
              failed: b.failed,
              pending: b.pending,
            });
          }
        }
      }
      if (!stop) timer = setTimeout(loop, POLL_MS);
    }
    timer = setTimeout(loop, POLL_MS);
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <HourglassIcon className="size-5" />
        </span>
        <p className="font-heading text-base font-medium">No recent jobs</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Words and imports you start will appear here so you can track them.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/admin/vocabularies/quick">
            <Button size="sm" variant="outline">
              <SparklesIcon />
              Quick add
            </Button>
          </Link>
          <Link href="/admin/vocabularies/bulk">
            <Button size="sm" variant="outline">
              <LayersIcon />
              Bulk import
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const finishedCount = items.length - activeCount;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {activeCount}
          </span>{" "}
          running ·{" "}
          <span className="tabular-nums">{finishedCount}</span> finished
        </p>
        {finishedCount > 0 && (
          <Button size="sm" variant="ghost" onClick={clearFinished}>
            Clear finished
          </Button>
        )}
      </div>

      {items.map((item) =>
        item.kind === "single" ? (
          <SingleRow key={item.id} job={item} onRemove={() => remove(item.id)} />
        ) : (
          <BatchRow key={item.id} batch={item} onRemove={() => remove(item.id)} />
        ),
      )}
    </div>
  );
}

function SingleRow({
  job,
  onRemove,
}: {
  job: TrackedJob;
  onRemove: () => void;
}) {
  const reviewHref = `/admin/vocabularies/review?q=${encodeURIComponent(job.label)}`;
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
        <SparklesIcon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{job.label}</span>
          <StatusBadge job={job} />
        </div>
        <p className="text-xs text-muted-foreground">
          Single word · {job.language.toUpperCase()}
        </p>
      </div>
      {job.status === "completed" && job.resultCount > 0 && (
        <Link href={reviewHref}>
          <Button size="sm" variant="outline">
            <ListChecksIcon />
            Review
          </Button>
        </Link>
      )}
      <RemoveButton onClick={onRemove} />
    </div>
  );
}

function StatusBadge({ job }: { job: TrackedJob }) {
  if (job.status === "pending")
    return (
      <ToneBadge tone="amber">
        <Loader2Icon className="size-3 animate-spin" />
        Building
      </ToneBadge>
    );
  if (job.status === "failed")
    return (
      <ToneBadge tone="rose">
        <AlertTriangleIcon className="size-3" />
        Failed
      </ToneBadge>
    );
  if (job.status === "empty")
    return <ToneBadge tone="sky">Already covered</ToneBadge>;
  return (
    <ToneBadge tone="emerald">
      <CheckCircle2Icon className="size-3" />
      {job.resultCount} draft{job.resultCount === 1 ? "" : "s"}
    </ToneBadge>
  );
}

function BatchRow({
  batch,
  onRemove,
}: {
  batch: TrackedBatch;
  onRemove: () => void;
}) {
  const done = batch.completed + batch.failed;
  const pct = batch.total ? Math.round((done / batch.total) * 100) : 0;
  const finished = done >= batch.total;
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          <LayersIcon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{batch.label}</span>
            {finished ? (
              <ToneBadge tone="emerald">
                <CheckCircle2Icon className="size-3" />
                Done
              </ToneBadge>
            ) : (
              <ToneBadge tone="amber">
                <Loader2Icon className="size-3 animate-spin" />
                Enriching
              </ToneBadge>
            )}
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {batch.completed} done · {batch.pending} pending
            {batch.failed > 0 ? ` · ${batch.failed} failed` : ""}
          </p>
        </div>
        {batch.completed > 0 && (
          <Link href="/admin/vocabularies/review">
            <Button size="sm" variant="outline">
              <ListChecksIcon />
              Review
            </Button>
          </Link>
        )}
        <RemoveButton onClick={onRemove} />
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            finished ? "bg-emerald-500" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label="Remove from list"
      className="shrink-0 text-muted-foreground"
    >
      <XIcon />
    </Button>
  );
}
