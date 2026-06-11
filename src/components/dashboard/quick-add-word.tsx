"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, PlusIcon } from "lucide-react";

import {
  pollVocabularyJob,
  quickAddWord,
} from "@/lib/me/quick-add-action";
import { cn } from "@/lib/utils";

type Phase = "idle" | "adding" | "added" | "error";

/**
 * My Words quick-add (§6.2, §10): a fast lemma entry. Submitting starts the
 * async quick-create job, shows an optimistic "adding…" state, polls the job a
 * few times, then refreshes so the words count reflects the new word. Deep
 * editing lives on `/words`.
 */
export function QuickAddWord({ hasWords }: { hasWords: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lemma, setLemma] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const lastAdded = useRef("");

  function reset() {
    setPhase("idle");
    setMessage(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = lemma.trim();
    if (!value || pending) return;

    startTransition(async () => {
      setPhase("adding");
      setMessage(null);
      const res = await quickAddWord(value);
      if (!res.ok || !res.jobId) {
        setPhase("error");
        setMessage(res.error ?? "Couldn't add that word.");
        return;
      }

      lastAdded.current = value;
      setLemma("");

      // Poll the enrichment job a few times (1.5s, backing off), then refresh
      // the count regardless so the UI doesn't hang on a slow worker.
      let done = false;
      for (let attempt = 0; attempt < 6 && !done; attempt++) {
        await new Promise((r) => setTimeout(r, 1500 + attempt * 500));
        const job = await pollVocabularyJob(res.jobId);
        if (job.status === "completed") done = true;
        if (job.status === "failed") {
          setPhase("error");
          setMessage(job.error ?? "We couldn't enrich that word.");
          return;
        }
      }

      setPhase("added");
      setMessage(`Added "${lastAdded.current}"`);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lr-btn lr-btn--soft lr-btn--sm self-start"
      >
        <PlusIcon size={15} /> {hasWords ? "Quick add" : "Add your first word"}
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={lemma}
          onChange={(e) => {
            setLemma(e.target.value);
            if (phase !== "idle") reset();
          }}
          placeholder="Type a word…"
          maxLength={128}
          disabled={pending}
          className="min-w-0 flex-1 rounded-[12px] border border-(--line-2) bg-(--surface) px-3 py-2 text-sm text-(--ink) outline-none focus:border-(--primary)"
        />
        <button
          type="submit"
          disabled={pending || !lemma.trim()}
          className="lr-btn lr-btn--primary lr-btn--sm shrink-0"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {phase === "added" && (
        <span className="lr-chip lr-chip--mint self-start">
          <CheckIcon size={13} /> {message}
        </span>
      )}
      {phase === "error" && (
        <span className={cn("text-[12.5px] font-medium text-(--bad-ink)")}>
          {message}
        </span>
      )}
    </form>
  );
}
