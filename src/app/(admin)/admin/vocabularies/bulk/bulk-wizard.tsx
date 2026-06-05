"use client";

/**
 * Bulk import orchestrator. Owns the cross-phase context (topics / mode /
 * language), drives the three phases (source → confirm → progress), and runs the
 * batch poll loop. The active batch is mirrored into the jobs tracker so the
 * admin can navigate away and still find it on the Jobs page.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmPhase } from "./confirm-phase";
import { ProgressPhase } from "./progress-phase";
import { SourcePhase } from "./source-phase";
import { pollBatchAction } from "@/lib/admin/quick";
import { upsertTracked } from "@/hooks/use-quick-jobs";
import type {
  BatchStatus,
  BulkSubmitResult,
  ExtractMode,
  ExtractResult,
  Topic,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const POLL_MS = 4000;
type Phase = "source" | "confirm" | "progress";
const STEPS: { key: Phase; label: string }[] = [
  { key: "source", label: "Source" },
  { key: "confirm", label: "Confirm" },
  { key: "progress", label: "Enrich" },
];

export function BulkWizard({ topics }: { topics: Topic[] }) {
  const [phase, setPhase] = useState<Phase>("source");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [mode, setMode] = useState<ExtractMode>("list");
  const [language, setLanguage] = useState("en");

  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null);
  const [batch, setBatch] = useState<BatchStatus | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [allSkipped, setAllSkipped] = useState(false);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const label =
    selectedTopics.length > 0
      ? selectedTopics
          .map((s) => topics.find((t) => t.slug === s)?.name ?? s)
          .join(", ")
      : "Bulk import";

  const mirror = useCallback(
    (b: BatchStatus) => {
      upsertTracked({
        kind: "bulk",
        id: b.batchId,
        label,
        topics: selectedTopics,
        total: b.total,
        completed: b.completed,
        failed: b.failed,
        pending: b.pending,
        createdAt: Date.now(),
      });
    },
    [label, selectedTopics],
  );

  const poll = useCallback(
    (batchId: string) => {
      timer.current = setInterval(async () => {
        const res = await pollBatchAction(batchId);
        if (!res.ok) {
          if (timer.current) clearInterval(timer.current);
          toast.error(res.error);
          return;
        }
        setBatch(res.data);
        mirror(res.data);
        if (res.data.pending <= 0 && timer.current) clearInterval(timer.current);
      }, POLL_MS);
    },
    [mirror],
  );

  function onEnriched(result: BulkSubmitResult, lemmas: string[]) {
    setSkipped(result.skipped);
    if (!result.batchId) {
      setAllSkipped(true);
      setBatch(null);
      setPhase("progress");
      return;
    }
    const base: BatchStatus = {
      batchId: result.batchId,
      total: result.accepted || lemmas.length,
      pending: result.accepted || lemmas.length,
      completed: 0,
      failed: 0,
      resultVocabularyIds: [],
    };
    setAllSkipped(false);
    setBatch(base);
    setPhase("progress");
    mirror(base);
    poll(result.batchId);
  }

  function reset() {
    if (timer.current) clearInterval(timer.current);
    setExtractResult(null);
    setBatch(null);
    setSkipped(0);
    setAllSkipped(false);
    setPhase("source");
  }

  const stepIdx = STEPS.findIndex((s) => s.key === phase);

  return (
    <div className="grid gap-6">
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                i === stepIdx
                  ? "bg-primary/10 text-primary"
                  : i < stepIdx
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
                  i === stepIdx
                    ? "bg-primary text-primary-foreground"
                    : i < stepIdx
                      ? "bg-emerald-500 text-white"
                      : "bg-muted",
                )}
              >
                {i < stepIdx ? <CheckIcon className="size-2.5" strokeWidth={3} /> : i + 1}
              </span>
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRightIcon className="size-3.5 text-muted-foreground/40" />
            )}
          </div>
        ))}
      </div>

      <div key={phase}>
        {phase === "source" && (
          <SourcePhase
            topics={topics}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            mode={mode}
            setMode={setMode}
            language={language}
            setLanguage={setLanguage}
            onExtracted={(r) => {
              setExtractResult(r);
              setPhase("confirm");
            }}
          />
        )}
        {phase === "confirm" && extractResult && (
          <ConfirmPhase
            result={extractResult}
            ctx={{ topics: selectedTopics, language, mode }}
            topicCatalog={topics}
            onEnriched={onEnriched}
            onBack={() => setPhase("source")}
          />
        )}
        {phase === "progress" && (
          <ProgressPhase
            batch={batch}
            skipped={skipped}
            allSkipped={allSkipped}
            onNewImport={reset}
          />
        )}
      </div>
    </div>
  );
}
