"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  PencilIcon,
  Settings2Icon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Field, SelectField } from "@/components/app/field";
import { pollVocabularyJob, quickAddWord } from "@/lib/me/quick-add-action";
import { LANGUAGES } from "@/lib/languages";

type Status = "pending" | "completed" | "empty" | "failed";
interface Entry {
  id: string;
  lemma: string;
  status: Status;
  count?: number;
  error?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Quick add (§6.4) — the hero path. Type a word; a background worker enriches
 * it. Each submission becomes a streaming result card that walks
 * pending → completed / "already have it" / failed-with-fallback. Non-blocking:
 * you can queue several words while earlier ones build.
 */
export function QuickAddScreen({
  appLanguage,
  nativeLanguage,
  onOpenManual,
}: {
  appLanguage: string;
  nativeLanguage: string;
  onOpenManual: (lemma: string, fromFailed: boolean) => void;
}) {
  const router = useRouter();
  const [lemma, setLemma] = useState("");
  const [language, setLanguage] = useState(appLanguage);
  const [translateTo, setTranslateTo] = useState(nativeLanguage);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);

  function patch(id: string, p: Partial<Entry>) {
    setEntries((cur) => cur.map((e) => (e.id === id ? { ...e, ...p } : e)));
  }

  async function submit(forced?: string) {
    const lm = (forced ?? lemma).trim();
    if (!lm || busy) return;
    setBusy(true);

    const id = crypto.randomUUID();
    setEntries((cur) => [{ id, lemma: lm, status: "pending" }, ...cur]);
    if (forced == null) setLemma("");

    const res = await quickAddWord(lm, { language, translationLanguage: translateTo });
    setBusy(false);
    if (!res.ok || !res.jobId) {
      patch(id, { status: "failed", error: res.error });
      return;
    }

    let settled = false;
    for (let attempt = 0; attempt < 10 && !settled; attempt++) {
      await sleep(1500 + attempt * 400);
      const job = await pollVocabularyJob(res.jobId);
      if (job.status === "completed") {
        settled = true;
        const n = job.resultVocabularyIds.length;
        patch(id, { status: n > 0 ? "completed" : "empty", count: n });
        if (n > 0) router.refresh();
      } else if (job.status === "failed") {
        settled = true;
        patch(id, { status: "failed", error: job.error });
      }
    }
    if (!settled) {
      // Worker is slow but the job is queued — treat as added and let My Words reconcile.
      patch(id, { status: "completed", count: 1 });
      router.refresh();
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/words"
        className="mb-3.5 inline-flex items-center gap-1 text-[13px] text-(--ink-3) hover:text-(--ink)"
      >
        <ChevronLeftIcon className="size-4" /> My Words
      </Link>

      <div className="flex items-center gap-2.5">
        <span className="inline-flex rounded-[12px] bg-(--primary) p-2 text-(--primary-foreground)">
          <SparklesIcon className="size-[18px]" />
        </span>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-(--ink)">
          Add a word
        </h1>
      </div>
      <p className="mt-1.5 mb-5 text-sm text-(--ink-2)">
        Type a word — we build it (definitions, examples, audio), you study it.
      </p>

      <div className="lr-card p-4.5">
        <div className="flex items-stretch gap-2.5">
          <input
            autoFocus
            value={lemma}
            onChange={(e) => setLemma(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
            placeholder="e.g. resilient"
            maxLength={128}
            className="font-heading h-13 min-w-0 flex-1 rounded-[14px] border-2 border-(--line-2) bg-(--surface) px-4 text-lg font-semibold text-(--ink) outline-none placeholder:text-(--ink-3) focus:border-(--primary) focus:ring-4 focus:ring-(--primary-soft)"
          />
          <button
            type="button"
            disabled={!lemma.trim() || busy}
            onClick={() => void submit()}
            className="lr-btn lr-btn--primary h-13 shrink-0 px-5"
          >
            {busy ? (
              <Loader2Icon className="size-[18px] animate-spin" />
            ) : (
              <>
                <ArrowRightIcon className="size-[18px]" /> Add
              </>
            )}
          </button>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-(--ink-3) hover:text-(--ink)"
          >
            {showAdvanced ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )}
            Language &amp; translation
          </button>
          <button
            type="button"
            onClick={() => onOpenManual("", false)}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-(--ink) hover:underline"
          >
            <Settings2Icon className="size-3.5" /> Advanced — fill it myself
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-3.5 grid grid-cols-1 gap-3 border-t border-(--line) pt-3.5 sm:grid-cols-2">
            <Field label="Word language">
              <SelectField value={language} onChange={setLanguage} options={LANGUAGES} />
            </Field>
            <Field label="Translate to">
              <SelectField value={translateTo} onChange={setTranslateTo} options={LANGUAGES} />
            </Field>
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {entries.map((e) => (
            <ResultCard
              key={e.id}
              entry={e}
              onRetry={() => void submit(e.lemma)}
              onOpenManual={() => onOpenManual(e.lemma, true)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  entry,
  onRetry,
  onOpenManual,
}: {
  entry: Entry;
  onRetry: () => void;
  onOpenManual: () => void;
}) {
  if (entry.status === "pending") {
    return (
      <div className="lr-card flex items-center gap-3 p-4">
        <Loader2Icon className="size-[18px] animate-spin text-(--ink-3)" />
        <div className="flex-1">
          <p className="text-sm font-medium text-(--ink)">
            Building <strong>{entry.lemma}</strong>…
          </p>
          <p className="mt-0.5 text-[12.5px] text-(--ink-3)">
            This runs in the background — keep adding or leave this page.
          </p>
        </div>
        <span className="rounded-full bg-(--amber-soft) px-2.5 py-1 text-[11.5px] font-semibold text-(--amber-2)">
          Adding
        </span>
      </div>
    );
  }

  if (entry.status === "completed") {
    return (
      <div className="lr-card flex items-center gap-3 border-(--ok)/30 bg-(--ok-soft)/40 p-4">
        <CheckCircle2Icon className="size-5 text-(--ok)" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-(--ok-ink)">
            {entry.count && entry.count > 1
              ? `Added ${entry.count} entries for "${entry.lemma}"`
              : `Added "${entry.lemma}" to My Words`}
          </p>
          <p className="mt-0.5 text-[12.5px] text-(--ink-3)">
            Audio is generating — it’ll appear shortly.
          </p>
        </div>
        <Link href="/words" className="lr-btn lr-btn--soft lr-btn--sm shrink-0">
          View
        </Link>
      </div>
    );
  }

  if (entry.status === "empty") {
    return (
      <div className="lr-card flex items-center gap-3 p-4">
        <span className="inline-flex rounded-full bg-(--ok-soft) p-1.5 text-(--ok)">
          <CheckIcon className="size-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-(--ink)">
            You already have <strong>{entry.lemma}</strong>
          </p>
          <p className="mt-0.5 text-[12.5px] text-(--ink-3)">
            It’s in My Words already — nothing to do.
          </p>
        </div>
      </div>
    );
  }

  // failed
  return (
    <div className="lr-card flex items-start gap-3 p-4">
      <span className="mt-0.5 inline-flex rounded-full bg-(--muted) p-1.5 text-(--ink-3)">
        <TriangleAlertIcon className="size-4" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-(--ink)">
          Couldn’t build <strong>{entry.lemma}</strong>
        </p>
        <p className="mt-0.5 mb-3 text-[12.5px] text-(--ink-3)">
          {entry.error ?? "Our builder couldn’t resolve this one. Try again, or add it yourself."}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onRetry} className="lr-btn lr-btn--soft lr-btn--sm">
            Retry
          </button>
          <button type="button" onClick={onOpenManual} className="lr-btn lr-btn--primary lr-btn--sm">
            <PencilIcon className="size-3.5" /> Add it manually
          </button>
        </div>
      </div>
    </div>
  );
}
