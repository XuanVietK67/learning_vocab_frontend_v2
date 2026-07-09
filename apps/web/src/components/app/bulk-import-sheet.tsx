"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardListIcon,
  FileTextIcon,
  ListIcon,
  PartyPopperIcon,
  VolumeOffIcon,
} from "lucide-react";

import { Field, SelectField } from "@/components/app/field";
import { Sheet } from "@/components/app/sheet";
import {
  type BulkImportStart,
  pollBulkBatch,
  revalidateDeck,
  startBulkImport,
} from "@/lib/me/deck-actions";
import { LANGUAGES } from "@/lib/languages";

const SAMPLE =
  "resilient\ntenacious\neloquent\nscrutinize\nparadigm\nnuance\ncoherent\narticulate";

/** Parse a pasted blob into unique, trimmed lemmas (newline/comma split, cap 500). */
function parseLemmas(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of raw.split(/[\n,]/)) {
    const v = piece.trim().replace(/\s+/g, " ");
    if (!v || v.length > 128) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
    if (out.length >= 500) break;
  }
  return out;
}

type Phase = "paste" | "importing" | "done" | "nothing";

/**
 * Bulk import (Way 2) — paste a batch of words into a list; each enriches
 * asynchronously and lands in the deck. Polls the batch until done, refreshing
 * the underlying list as words arrive. The `accepted: 0` (`batchId: null`) case
 * shows a "nothing to import" note instead of a progress view.
 */
export function BulkImportSheet({
  deckId,
  deckName,
  appLanguage,
  nativeLanguage,
  open,
  onClose,
  onChanged,
}: {
  deckId: string;
  deckName: string;
  appLanguage: string;
  nativeLanguage: string;
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("paste");
  const [raw, setRaw] = useState("");
  const [language, setLanguage] = useState(appLanguage);
  const [translateTo, setTranslateTo] = useState(nativeLanguage);
  const [start, setStart] = useState<BulkImportStart | null>(null);
  const [progress, setProgress] = useState({ total: 0, completed: 0, pending: 0, failed: 0 });
  const [submitting, setSubmitting] = useState(false);
  const cancelled = useRef(false);

  // Mounted fresh each time it opens (the parents mount it conditionally), so
  // state starts clean — the effect only manages the poll-cancellation ref.
  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  const parsed = parseLemmas(raw);

  async function runImport() {
    if (parsed.length === 0 || submitting) return;
    setSubmitting(true);
    const res = await startBulkImport(deckId, {
      lemmas: parsed,
      language,
      translationLanguage: translateTo,
    });
    setSubmitting(false);
    if (!res.ok) return;

    setStart(res.result);
    if (!res.result.batchId || res.result.accepted === 0) {
      setPhase("nothing");
      return;
    }

    setPhase("importing");
    setProgress({ total: res.result.accepted, completed: 0, pending: res.result.accepted, failed: 0 });

    const batchId = res.result.batchId;
    let lastCompleted = 0;
    for (let attempt = 0; attempt < 90 && !cancelled.current; attempt++) {
      await new Promise((r) => setTimeout(r, Math.min(1200 + attempt * 200, 2500)));
      const batch = await pollBulkBatch(batchId);
      if (!batch) continue;
      setProgress({
        total: batch.total,
        completed: batch.completed,
        pending: batch.pending,
        failed: batch.failed,
      });
      if (batch.completed > lastCompleted) {
        lastCompleted = batch.completed;
        await revalidateDeck(deckId);
        onChanged();
      }
      if (batch.pending === 0) break;
    }
    await revalidateDeck(deckId);
    onChanged();
    if (!cancelled.current) setPhase("done");
  }

  const targetChip = (
    <span className="inline-flex items-center gap-2 rounded-full bg-(--primary-soft) py-1.5 pr-3 pl-2 text-[13px] font-semibold text-(--primary-ink)">
      <span className="flex size-5 items-center justify-center rounded-md bg-(--primary)/15 text-(--primary-ink)">
        <ListIcon className="size-3" />
      </span>
      {deckName}
    </span>
  );

  let footer: React.ReactNode = null;
  if (phase === "paste") {
    footer = (
      <div className="flex items-center justify-between gap-3">
        <span className="tnum text-[12.5px] text-(--ink-3)">
          {parsed.length} {parsed.length === 1 ? "word" : "words"} detected
        </span>
        <div className="flex gap-2.5">
          <button type="button" onClick={onClose} className="lr-btn lr-btn--ghost lr-btn--md">
            Cancel
          </button>
          <button
            type="button"
            disabled={parsed.length === 0 || submitting}
            onClick={runImport}
            className="lr-btn lr-btn--primary lr-btn--md"
          >
            <ClipboardListIcon className="size-4" /> Import {parsed.length || ""}{" "}
            {parsed.length === 1 ? "word" : "words"}
          </button>
        </div>
      </div>
    );
  } else if (phase === "importing") {
    footer = (
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] text-(--ink-3)">Runs in the background — you can close this.</span>
        <button type="button" onClick={onClose} className="lr-btn lr-btn--ghost lr-btn--md">
          Close
        </button>
      </div>
    );
  } else {
    footer = (
      <div className="flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={() => {
            setRaw("");
            setPhase("paste");
          }}
          className="lr-btn lr-btn--ghost lr-btn--md"
        >
          Import more
        </button>
        <button type="button" onClick={onClose} className="lr-btn lr-btn--primary lr-btn--md">
          Done <ArrowRightIcon className="size-4" />
        </button>
      </div>
    );
  }

  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Bulk import words"
      subtitle={
        phase === "done" || phase === "nothing"
          ? "Import complete"
          : "Paste a batch — each word is built and added to the list."
      }
      footer={footer}
    >
      {phase === "paste" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-(--ink-3)">Adding to</span>
            {targetChip}
          </div>
          <Field
            label="Words"
            hint="One per line, or comma-separated. Duplicates are removed automatically."
          >
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={"resilient\ntenacious\neloquent\n…"}
              className="min-h-52 w-full rounded-[14px] border border-(--line-2) bg-(--surface) px-3.5 py-3 font-mono text-[13.5px] leading-relaxed text-(--ink) shadow-(--sh-sm) outline-none placeholder:text-(--ink-3) focus:border-(--primary) focus:ring-4 focus:ring-(--primary-soft)"
            />
          </Field>
          <button
            type="button"
            onClick={() => setRaw(SAMPLE)}
            className="inline-flex w-fit items-center gap-1.5 text-[12.5px] text-(--ink-3) hover:text-(--ink)"
          >
            <FileTextIcon className="size-3.5" /> Paste a sample batch
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Word language">
              <SelectField value={language} onChange={setLanguage} options={LANGUAGES} />
            </Field>
            <Field label="Translate to">
              <SelectField value={translateTo} onChange={setTranslateTo} options={LANGUAGES} />
            </Field>
          </div>
        </div>
      )}

      {phase === "importing" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-(--ink-3)">Building into</span>
            {targetChip}
          </div>
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-(--ink)">Building words…</span>
              <span className="tnum font-mono text-[13px] text-(--ink-3)">
                {progress.completed} / {progress.total}
              </span>
            </div>
            <div className="lr-progress">
              <i style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex gap-4 text-[12.5px]">
            <span className="font-semibold text-(--ok-ink)">✓ {progress.completed} added</span>
            <span className="font-semibold text-(--amber-2)">⏳ {progress.pending} building</span>
            <span className="font-semibold text-(--ink-3)">✕ {progress.failed} failed</span>
          </div>
          <p className="flex items-start gap-2 text-[12.5px] text-(--ink-3)">
            <VolumeOffIcon className="mt-0.5 size-3.5 shrink-0" /> Audio for each word generates
            separately and appears a little later.
          </p>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-[18px] border border-(--ok)/30 bg-(--ok-soft)/50 p-4">
            <span className="inline-flex rounded-full bg-(--ok)/15 p-2.5 text-(--ok-ink)">
              <PartyPopperIcon className="size-5" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-(--ok-ink)">
                Added {progress.completed} {progress.completed === 1 ? "word" : "words"}
              </p>
              <p className="mt-0.5 text-[13px] text-(--ink-2)">
                They’re in <strong>{deckName}</strong> and ready to study.
              </p>
            </div>
          </div>
          {start && start.skipped > 0 && (
            <p className="text-[13px] text-(--ink-3)">
              {start.skipped} {start.skipped === 1 ? "word was" : "words were"} skipped — already in
              your words.
            </p>
          )}
          {progress.failed > 0 && (
            <p className="text-[13px] text-(--ink-3)">
              {progress.failed} couldn’t be built — re-paste those to try again.
            </p>
          )}
          <p className="flex items-start gap-2 text-[12.5px] text-(--ink-3)">
            <VolumeOffIcon className="mt-0.5 size-3.5 shrink-0" /> Some audio may still be processing
            — it’ll light up shortly.
          </p>
        </div>
      )}

      {phase === "nothing" && (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-(--amber)/40 bg-(--amber-soft) px-4 py-3.5">
          <CheckIcon className="mt-0.5 size-4 shrink-0 text-(--amber-2)" />
          <p className="text-[13px] text-(--ink-2)">
            <strong className="text-(--ink)">Nothing to import.</strong> Every word here is already
            in your words — there’s nothing new to build.
          </p>
        </div>
      )}
    </Sheet>
  );
}
