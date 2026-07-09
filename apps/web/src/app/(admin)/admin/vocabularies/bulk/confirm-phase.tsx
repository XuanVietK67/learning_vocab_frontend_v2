"use client";

/**
 * Bulk phase 2 — confirm candidates. The extractor returns a deduped, in-catalog
 * stripped candidate list plus stats; the admin unticks junk, can add a missed
 * word, then enriches the confirmed set. This curation gate is the point of the
 * two-step flow: it avoids spending the rate-limited pipeline on noise.
 */
import { useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ListChecksIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  TagsIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { ToneBadge } from "@/components/admin/tone-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitBulkAction } from "@/lib/admin/quick";
import type {
  BulkSubmitResult,
  ExtractResult,
  Topic,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const CONFIRM_OVER = 200;

interface Ctx {
  topics: string[];
  language: string;
  mode: string;
}

interface Row {
  word: string;
  checked: boolean;
}

export function ConfirmPhase({
  result,
  ctx,
  topicCatalog,
  onEnriched,
  onBack,
}: {
  result: ExtractResult;
  ctx: Ctx;
  topicCatalog: Topic[];
  onEnriched: (r: BulkSubmitResult, lemmas: string[]) => void;
  onBack: () => void;
}) {
  const initial = useMemo<Row[]>(
    () => result.lemmas.map((word) => ({ word, checked: true })),
    [result.lemmas],
  );
  const [rows, setRows] = useState<Row[]>(initial);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState("");
  const [enriching, setEnriching] = useState(false);

  const filtered = rows.filter((r) =>
    r.word.toLowerCase().includes(q.toLowerCase()),
  );
  const selectedCount = rows.filter((r) => r.checked).length;
  const allChecked = filtered.length > 0 && filtered.every((r) => r.checked);

  const toggle = (word: string) =>
    setRows((rs) =>
      rs.map((r) => (r.word === word ? { ...r, checked: !r.checked } : r)),
    );
  const remove = (word: string) =>
    setRows((rs) => rs.filter((r) => r.word !== word));
  const setAllFiltered = (val: boolean) =>
    setRows((rs) =>
      rs.map((r) =>
        filtered.some((f) => f.word === r.word) ? { ...r, checked: val } : r,
      ),
    );
  const addWord = () => {
    const w = adding.trim().toLowerCase();
    if (w && !rows.some((r) => r.word === w)) {
      setRows((rs) => [{ word: w, checked: true }, ...rs]);
    }
    setAdding("");
  };

  async function enrich() {
    const lemmas = rows.filter((r) => r.checked).map((r) => r.word);
    if (lemmas.length === 0) return;
    if (lemmas.length > CONFIRM_OVER) {
      const ok = window.confirm(
        `Enrich ${lemmas.length} words? Large batches take several minutes.`,
      );
      if (!ok) return;
    }
    setEnriching(true);
    const res = await submitBulkAction(lemmas, ctx.language, ctx.topics);
    setEnriching(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onEnriched(res.data, lemmas);
  }

  const stats = result.stats;
  const statItems: { value: number; label: string; amber?: boolean }[] = [
    { value: stats.extracted, label: "found" },
    { value: stats.deduped, label: "duplicates merged" },
    { value: stats.removedStopwords, label: "stopwords removed" },
    { value: stats.alreadyInCatalog, label: "already in catalog", amber: true },
  ];

  return (
    <div className="grid gap-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Back to source
      </button>

      {ctx.topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Importing into</span>
          {ctx.topics.map((slug) => (
            <ToneBadge key={slug} tone="violet">
              <TagsIcon className="size-3" />
              {topicCatalog.find((t) => t.slug === slug)?.name ?? slug}
            </ToneBadge>
          ))}
          <span>
            · {ctx.mode === "prose" ? "Prose" : "List"} mode ·{" "}
            {ctx.language.toUpperCase()}
          </span>
        </div>
      )}

      {/* Stats band */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border bg-muted/30 px-4 py-3">
        {statItems.map((s) => (
          <div key={s.label} className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "font-heading text-lg font-semibold tabular-nums",
                s.amber ? "text-amber-600 dark:text-amber-400" : "text-foreground",
              )}
            >
              {s.value}
            </span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {stats.capped && (
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-300/60 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangleIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          List truncated to the first 1,000 words. Split your source to import the
          rest.
        </div>
      )}

      {/* Candidate checklist */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
          <div className="flex items-center gap-2 font-heading text-sm font-semibold">
            <ListChecksIcon className="size-4 text-primary" />
            Confirm candidates
          </div>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
            {selectedCount} selected
          </span>
          <div className="relative ml-auto w-48">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter…"
              className="h-7 pl-8 text-[13px]"
            />
          </div>
          <Button size="sm" variant="ghost" onClick={() => setAllFiltered(true)}>
            Select all
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setAllFiltered(false)}
          >
            Clear
          </Button>
        </div>

        {/* Add a word */}
        <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-2.5">
          <PlusIcon className="size-4 text-muted-foreground" />
          <input
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addWord();
              }
            }}
            placeholder="Add a word the extractor missed…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          {adding.trim() && (
            <Button size="sm" variant="outline" onClick={addWord}>
              Add
            </Button>
          )}
        </div>

        <div className="p-3">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No candidates match “{q}”.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 px-2 pb-1.5">
                <Checkbox
                  checked={allChecked}
                  indeterminate={selectedCount > 0 && !allChecked}
                  onChange={() => setAllFiltered(!allChecked)}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  Word
                </span>
              </div>
              <div className="grid gap-0.5">
                {filtered.map((r) => (
                  <div
                    key={r.word}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50",
                      !r.checked && "opacity-55",
                    )}
                  >
                    <Checkbox checked={r.checked} onChange={() => toggle(r.word)} />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        !r.checked && "line-through",
                      )}
                    >
                      {r.word}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(r.word)}
                      aria-label={`Remove ${r.word}`}
                      className="ml-auto text-muted-foreground/0 group-hover:text-muted-foreground hover:text-destructive"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 border-t bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Enrichment is rate-limited — drafts arrive gradually.
          </p>
          <Button
            size="lg"
            disabled={!selectedCount || enriching}
            onClick={enrich}
          >
            {enriching ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SparklesIcon />
            )}
            Enrich {selectedCount} word{selectedCount === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Small square checkbox matching the admin visual language. */
function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={onChange}
      className={cn(
        "flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        checked || indeterminate
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:border-muted-foreground/50",
      )}
    >
      {checked ? (
        <CheckIcon className="size-3" strokeWidth={3} />
      ) : indeterminate ? (
        <span className="h-0.5 w-2.5 rounded-full bg-primary-foreground" />
      ) : null}
    </button>
  );
}
