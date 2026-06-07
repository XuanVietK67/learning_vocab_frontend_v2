"use client";

/**
 * Single quick-create: the admin types one word; a background job enriches it
 * into one or more drafts. The flow is asynchronous — submit returns a job, not
 * a word — so each submission becomes a live "card" that polls until it lands in
 * one of four terminal states (multi-draft success / empty success / failed),
 * and is mirrored into the jobs tracker so it survives navigation.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  Loader2Icon,
  ListChecksIcon,
  PartyPopperIcon,
  RotateCwIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pollJobAction, quickCreateAction } from "@/lib/admin/quick";
import { upsertTracked } from "@/hooks/use-quick-jobs";
import { LANGUAGES, languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const POLL_MS = 2000;

type CardStatus = "pending" | "multi" | "empty" | "failed";

interface JobCard {
  id: string;
  lemma: string;
  language: string;
  /** Target language sent to the backend; equals `language` when translation is skipped. */
  translationLanguage: string;
  status: CardStatus;
  resultIds: string[];
  error: string | null;
}

// Sentinel for the "Translate senses to" select meaning "leave senses untranslated".
const NO_TRANSLATION = "";

export function QuickCreate() {
  const [lemma, setLemma] = useState("");
  const [language, setLanguage] = useState("en");
  const [translateTo, setTranslateTo] = useState("vi");
  const [submitting, setSubmitting] = useState(false);
  const [cards, setCards] = useState<JobCard[]>([]);

  // Resolve the select into what the backend wants: target === language ⇒ skip.
  const resolvedTranslation =
    translateTo && translateTo !== language ? translateTo : language;

  // Active poll intervals, keyed by jobId — cleared on resolve/unmount.
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  useEffect(() => {
    const t = timers.current;
    return () => {
      Object.values(t).forEach(clearInterval);
    };
  }, []);

  const mirror = useCallback((c: JobCard) => {
    upsertTracked({
      kind: "single",
      id: c.id,
      label: c.lemma,
      language: c.language,
      translationLanguage: c.translationLanguage,
      status: c.status === "multi" ? "completed" : c.status,
      resultCount: c.resultIds.length,
      createdAt: Date.now(),
    });
  }, []);

  const poll = useCallback(
    (jobId: string, translationLanguage: string) => {
      timers.current[jobId] = setInterval(async () => {
        const res = await pollJobAction(jobId);
        if (!res.ok) {
          clearInterval(timers.current[jobId]);
          delete timers.current[jobId];
          toast.error(res.error);
          setCards((cs) =>
            cs.map((c) =>
              c.id === jobId ? { ...c, status: "failed", error: res.error } : c,
            ),
          );
          return;
        }
        const job = res.data;
        if (job.status === "pending") return;
        clearInterval(timers.current[jobId]);
        delete timers.current[jobId];
        const next: CardStatus =
          job.status === "failed"
            ? "failed"
            : job.resultVocabularyIds.length > 0
              ? "multi"
              : "empty";
        setCards((cs) =>
          cs.map((c) =>
            c.id === jobId
              ? {
                  ...c,
                  status: next,
                  resultIds: job.resultVocabularyIds,
                  error: job.error,
                }
              : c,
          ),
        );
        mirror({
          id: jobId,
          lemma: job.lemma,
          language: job.language,
          translationLanguage,
          status: next,
          resultIds: job.resultVocabularyIds,
          error: job.error,
        });
      }, POLL_MS);
    },
    [mirror],
  );

  const start = useCallback(
    async (
      word: string,
      lang: string,
      translationLang: string,
      existingId?: string,
    ) => {
      const res = await quickCreateAction(word, lang, translationLang);
      if (!res.ok) {
        toast.error(res.error);
        if (existingId) {
          setCards((cs) =>
            cs.map((c) =>
              c.id === existingId
                ? { ...c, status: "failed", error: res.error }
                : c,
            ),
          );
        }
        return;
      }
      const job = res.data;
      const card: JobCard = {
        id: job.id,
        lemma: job.lemma,
        language: job.language,
        translationLanguage: translationLang,
        status: "pending",
        resultIds: [],
        error: null,
      };
      // Replace the retried card in place, otherwise prepend a fresh one.
      setCards((cs) =>
        existingId
          ? cs.map((c) => (c.id === existingId ? card : c))
          : [card, ...cs.filter((c) => c.id !== job.id)],
      );
      mirror(card);
      poll(job.id, translationLang);
    },
    [mirror, poll],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const word = lemma.trim();
    if (!word) return;
    // Idempotent: don't spawn a second card for a word already being built.
    if (
      cards.some(
        (c) =>
          c.status === "pending" &&
          c.lemma.toLowerCase() === word.toLowerCase() &&
          c.language === language,
      )
    ) {
      toast.info(`Already building “${word}”.`);
      return;
    }
    setSubmitting(true);
    await start(word, language, resolvedTranslation);
    setSubmitting(false);
    setLemma("");
  }

  function retry(card: JobCard) {
    setCards((cs) =>
      cs.map((c) =>
        c.id === card.id ? { ...c, status: "pending", error: null } : c,
      ),
    );
    void start(card.lemma, card.language, card.translationLanguage, card.id);
  }

  function dismiss(id: string) {
    const t = timers.current[id];
    if (t) clearInterval(t);
    delete timers.current[id];
    setCards((cs) => cs.filter((c) => c.id !== id));
  }

  return (
    <div className="grid gap-5">
      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        {/* Row 1 — the word + generate */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid gap-2">
            <Label htmlFor="lemma">Word</Label>
            <Input
              id="lemma"
              value={lemma}
              onChange={(e) => setLemma(e.target.value)}
              placeholder="ephemeral"
              autoFocus
              maxLength={128}
              className="h-9 text-base"
            />
          </div>
          <Button type="submit" size="lg" disabled={submitting || !lemma.trim()}>
            {submitting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SparklesIcon />
            )}
            Generate
          </Button>
        </div>

        {/* Row 2 — language pair: word language → translate senses to */}
        <div className="mt-4 grid items-end gap-3 sm:grid-cols-[auto_auto_auto] sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Word language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => {
                const next = e.target.value;
                setLanguage(next);
                // A same-language translation is a no-op — fold it into "don't translate".
                if (translateTo === next) setTranslateTo(NO_TRANSLATION);
              }}
              className={cn(selectClass, "h-9 sm:w-44")}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div
            aria-hidden
            className="hidden pb-2.5 text-muted-foreground sm:flex sm:items-center sm:justify-center"
          >
            <ArrowRightIcon className="size-4" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="translateTo">Translate senses to</Label>
            <select
              id="translateTo"
              value={translateTo}
              onChange={(e) => setTranslateTo(e.target.value)}
              className={cn(selectClass, "h-9 sm:w-48")}
            >
              <option value={NO_TRANSLATION}>Don’t translate</option>
              {LANGUAGES.filter((l) => l.value !== language).map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Non-English words skip the dictionary and get no IPA.{" "}
          {resolvedTranslation === language
            ? "Senses stay in the word’s own language."
            : `Each sense gets a ${languageLabel(resolvedTranslation)} translation.`}{" "}
          Drafts are reviewed before they go live.
        </p>
      </form>

      {/* Working / result cards */}
      {cards.length > 0 && (
        <div className="grid gap-3">
          {cards.map((card) => (
            <JobResultCard
              key={card.id}
              card={card}
              onRetry={() => retry(card)}
              onDismiss={() => dismiss(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JobResultCard({
  card,
  onRetry,
  onDismiss,
}: {
  card: JobCard;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const reviewHref = `/admin/vocabularies/review?q=${encodeURIComponent(card.lemma)}`;
  const existingHref = `/admin/vocabularies?q=${encodeURIComponent(card.lemma)}`;

  if (card.status === "pending") {
    return (
      <Shell tone="indigo">
        <Loader2Icon className="size-5 shrink-0 animate-spin text-indigo-600 dark:text-indigo-300" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">Building “{card.lemma}”…</p>
            <LangPairBadge card={card} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The AI is drafting this word in the background — you can leave this
            page and it keeps running.
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-500/15">
            <div className="h-full w-2/5 animate-pulse rounded-full bg-indigo-500" />
          </div>
        </div>
        <DismissButton onClick={onDismiss} />
      </Shell>
    );
  }

  if (card.status === "multi") {
    const n = card.resultIds.length;
    return (
      <Shell tone="emerald">
        <PartyPopperIcon className="size-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">
              Created {n} draft{n === 1 ? "" : "s"} for “{card.lemma}”
            </p>
            <LangPairBadge card={card} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            One word can yield several drafts — one per part of speech. Review
            before they go live.
          </p>
          <div className="mt-3">
            <Link href={reviewHref}>
              <Button size="sm">
                <ListChecksIcon />
                Review {n} draft{n === 1 ? "" : "s"}
              </Button>
            </Link>
          </div>
        </div>
        <DismissButton onClick={onDismiss} />
      </Shell>
    );
  }

  if (card.status === "empty") {
    return (
      <Shell tone="sky">
        <CheckCircle2Icon className="size-5 shrink-0 text-sky-600 dark:text-sky-300" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Nothing new to add</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            “{card.lemma}” is already covered — every part of speech exists in the
            catalog.
          </p>
          <div className="mt-3 flex gap-2">
            <Link href={existingHref}>
              <Button size="sm" variant="outline">
                View existing
              </Button>
            </Link>
          </div>
        </div>
        <DismissButton onClick={onDismiss} />
      </Shell>
    );
  }

  // failed
  return (
    <Shell tone="rose">
      <AlertTriangleIcon className="size-5 shrink-0 text-rose-600 dark:text-rose-300" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Couldn’t build “{card.lemma}”</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {card.error ?? "The enrichment pipeline didn’t find this word."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RotateCwIcon />
            Retry
          </Button>
          <Link href="/admin/vocabularies/new">
            <Button size="sm" variant="ghost">
              Use the full form
            </Button>
          </Link>
        </div>
      </div>
      <DismissButton onClick={onDismiss} />
    </Shell>
  );
}

const SHELL_TONE: Record<string, string> = {
  indigo: "border-indigo-200/70 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/20",
  emerald: "border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20",
  sky: "border-sky-200/70 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20",
  rose: "border-rose-200/70 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20",
};

function Shell({
  tone,
  children,
}: {
  tone: keyof typeof SHELL_TONE;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 shadow-sm",
        SHELL_TONE[tone],
      )}
    >
      {children}
    </div>
  );
}

/** Small chip recalling the request: source language, plus the translation target if any. */
function LangPairBadge({ card }: { card: JobCard }) {
  const translated = card.translationLanguage !== card.language;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-inset ring-border">
      {card.language.toUpperCase()}
      {translated && (
        <>
          <ArrowRightIcon className="size-3" />
          {card.translationLanguage.toUpperCase()}
        </>
      )}
    </span>
  );
}

function DismissButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label="Dismiss"
      className="shrink-0 text-muted-foreground"
    >
      <XIcon />
    </Button>
  );
}
