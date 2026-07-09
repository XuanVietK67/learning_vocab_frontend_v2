"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  FlameIcon,
  Loader2Icon,
  MicIcon,
  PenLineIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";

import type { PracticeAttempt, PracticeCriteria, PracticeWord } from "@/lib/me/practice/types";
import type { PracticeMode } from "./mode-tabs";
import { submitPracticeAttemptAction, pollPracticeAttemptAction } from "./practice-actions";
import { bandCopy, bandOf, BAND_STYLE } from "./_shared/band";
import { CriteriaRow } from "./_shared/criteria-row";
import { ScoreGauge } from "./_shared/score-gauge";

const MAX_CHARS = 280;
/** Poll backoff (ms): 1.5 → 3 → 5, then hold at 5 (docs/api/practice_submit_sentence.md). */
const POLL_DELAYS = [1500, 3000, 5000];
/** Stop auto-polling after this long; the attempt still resolves server-side. */
const POLL_CEILING_MS = 60_000;

const CRITERIA: { key: keyof PracticeCriteria; label: string }[] = [
  { key: "grammar", label: "Grammar" },
  { key: "wordUsage", label: "Word usage" },
  { key: "naturalness", label: "Naturalness" },
  { key: "relevance", label: "Relevance" },
];

type WriteState = "idle" | "submitting" | "scoring" | "scored" | "failed" | "quota";

/**
 * Mode A — write a sentence using the target word, scored **asynchronously** by
 * an LLM judge. Submit returns a queued `attemptId`; we poll with backoff until
 * the rubric lands, then render it as the hero. A `429` routes to a calm daily-
 * quota state; a stalled poll (≥60 s) hands the user a manual "Check again".
 */
export function WriteMode({
  word,
  onSwitchMode,
  onScored,
}: {
  word: PracticeWord;
  onSwitchMode: (mode: PracticeMode) => void;
  onScored: (score: number) => void;
}) {
  const [state, setState] = useState<WriteState>("idle");
  const [text, setText] = useState("");
  const [result, setResult] = useState<PracticeAttempt | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [stalled, setStalled] = useState(false);

  const attemptId = useRef<string | null>(null);
  const timer = useRef<number | null>(null);
  const startedAt = useRef(0);
  const pollIndex = useRef(0);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  // No word-change reset effect: practice-screen keys this subtree by
  // vocabularyId, so switching words remounts the panel with fresh state. We
  // still release any pending poll timer on unmount.
  useEffect(() => clearTimer, [clearTimer]);

  const over = text.length > MAX_CHARS;
  const canSubmit = text.trim().length > 0 && !over;

  // One self-scheduling poll. It reschedules itself via `pollRef` (kept current
  // by the effect below) so we avoid a mutually-recursive useCallback pair.
  const pollRef = useRef<() => void>(() => {});

  const poll = useCallback(async () => {
    const id = attemptId.current;
    if (!id) return;

    const res = await pollPracticeAttemptAction(id);
    if (!res.ok) {
      setErrorMsg(res.message);
      setState("failed");
      return;
    }
    const attempt = res.attempt;
    if (attempt.status === "scored") {
      setResult(attempt);
      setState("scored");
      if (attempt.score != null) onScored(attempt.score);
      return;
    }
    if (attempt.status === "failed") {
      setErrorMsg(attempt.error ?? "Scoring didn’t finish. Give it another go.");
      setState("failed");
      return;
    }
    // still pending — schedule the next tick unless we've hit the auto-poll ceiling
    pollIndex.current += 1;
    if (Date.now() - startedAt.current > POLL_CEILING_MS) {
      setStalled(true);
      return;
    }
    const delay = POLL_DELAYS[Math.min(pollIndex.current, POLL_DELAYS.length - 1)];
    timer.current = window.setTimeout(() => pollRef.current(), delay);
  }, [onScored]);

  useEffect(() => {
    pollRef.current = () => void poll();
  }, [poll]);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setState("submitting");
    setErrorMsg("");
    const res = await submitPracticeAttemptAction({
      vocabularyId: word.vocabularyId,
      text: text.trim(),
      modality: "writing",
    });
    if (!res.ok) {
      if (res.kind === "quota") {
        setErrorMsg(res.message);
        setState("quota");
      } else {
        setErrorMsg(res.message);
        setState("failed");
      }
      return;
    }
    attemptId.current = res.attemptId;
    startedAt.current = Date.now();
    pollIndex.current = 0;
    setStalled(false);
    setResult(null);
    setState("scoring");
    timer.current = window.setTimeout(() => pollRef.current(), POLL_DELAYS[0]);
  }, [canSubmit, text, word.vocabularyId]);

  const checkAgain = useCallback(() => {
    setStalled(false);
    startedAt.current = Date.now();
    pollIndex.current = 0;
    void poll();
  }, [poll]);

  const cancel = useCallback(() => {
    clearTimer();
    setState("idle");
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setText("");
    setResult(null);
    setState("idle");
  }, [clearTimer]);

  /* ---------------- scoring (skeleton + poll) ---------------- */
  if (state === "submitting" || state === "scoring") {
    return (
      <div className="lr-card p-7">
        <div className="mb-6 flex items-center gap-4">
          <span className="lr-sk size-31 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <span className="lr-sk h-5.5 w-32.5 rounded-lg" />
            <span className="lr-sk h-4 w-22.5 rounded-lg" />
          </div>
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2.25">
            <span className="lr-sk h-3.5 w-24 rounded-md" />
            <span className="lr-sk h-3.5 w-28 rounded-md" />
          </div>
        ))}
        <div className="mt-5 flex items-center gap-2.5 text-sm font-semibold text-(--ink-2)">
          {stalled ? (
            <>
              <TriangleAlertIcon className="size-4 text-(--amber-2)" />
              Still scoring — the judge is busy.
              <button type="button" onClick={checkAgain} className="lr-btn lr-btn--soft lr-btn--sm ml-auto">
                Check again
              </button>
            </>
          ) : (
            <>
              <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />
              Scoring your sentence…
              <button type="button" onClick={cancel} className="lr-btn lr-btn--ghost lr-btn--sm ml-auto">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- result (rubric) ---------------- */
  if (state === "scored" && result) {
    return <RubricResult attempt={result} word={word} onTryAnother={reset} onSwitchMode={onSwitchMode} />;
  }

  /* ---------------- daily quota ---------------- */
  if (state === "quota") {
    return (
      <div className="lr-card p-9 text-center">
        <div className="mx-auto mb-3.5 grid size-14 place-items-center rounded-2xl bg-(--amber-soft) text-(--amber-2)">
          <FlameIcon className="size-7" />
        </div>
        <h3 className="text-[20px] font-extrabold">That’s all for today</h3>
        <p className="mx-auto mt-1.5 mb-4.5 max-w-95 text-(--ink-2)">
          {errorMsg} Your quota resets at midnight UTC — come back tomorrow, or switch to Speak.
        </p>
        <button type="button" onClick={() => onSwitchMode("speak")} className="lr-btn lr-btn--ghost lr-btn--md">
          <MicIcon className="size-4" /> Practice speaking instead
        </button>
      </div>
    );
  }

  /* ---------------- idle / failed ---------------- */
  return (
    <div className="lr-card p-7">
      <div className="mb-3.5 flex items-center gap-2.5">
        <PenLineIcon className="size-4.5 text-(--primary-ink)" />
        <span className="text-base font-bold">
          Write a sentence using{" "}
          <span className="serif italic">“{word.lemma}”</span>
        </span>
      </div>

      <textarea
        className="lr-input"
        rows={3}
        placeholder={`e.g. Her fame proved ${word.lemma}, fading within a single week.`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label={`Write a sentence using ${word.lemma}`}
      />

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-(--ink-3)">
          Pronunciation isn’t judged here — that’s Speak mode.
        </span>
        <span
          className="tnum text-[13.5px] font-bold"
          style={{ color: over ? "var(--bad)" : "var(--ink-3)" }}
        >
          {text.length} / {MAX_CHARS}
        </span>
      </div>

      {state === "failed" && (
        <div className="lr-chip lr-chip--bad mt-3.5">
          <TriangleAlertIcon className="size-3.5" /> {errorMsg || "Scoring failed — give it another go."}
        </div>
      )}

      <div className="mt-4.5">
        <button type="button" className="lr-btn lr-btn--primary lr-btn--lg" disabled={!canSubmit} onClick={submit}>
          <SparklesIcon className="size-5" /> Submit for scoring
        </button>
      </div>
    </div>
  );
}

/* ====================  rubric result card  ==================== */
function RubricResult({
  attempt,
  word,
  onTryAnother,
  onSwitchMode,
}: {
  attempt: PracticeAttempt;
  word: PracticeWord;
  onTryAnother: () => void;
  onSwitchMode: (mode: PracticeMode) => void;
}) {
  const score = attempt.score ?? 0;
  const band = bandOf(score);
  const rubric = attempt.rubric;

  return (
    <div className="lr-card lr-pop p-7">
      <div className="mb-1 flex items-center justify-between">
        <span className="lr-eyebrow">Result</span>
        <span className="lr-chip">
          <SparklesIcon className="size-3.5" /> Scored
        </span>
      </div>

      <div className="my-3.5 flex items-center gap-4">
        <div className="flex flex-col items-center gap-1.5">
          <ScoreGauge score={score} size={124} />
          <span className={`lr-chip ${BAND_STYLE[band].chip}`}>{bandCopy(score)}</span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {attempt.cefr && (
              <span
                className="lr-chip"
                title="Level demonstrated by THIS sentence — not your proficiency level"
              >
                Demonstrates <b className="text-(--ink)">{attempt.cefr}</b>
              </span>
            )}
            {rubric &&
              (rubric.usesTargetWord ? (
                <span className="lr-chip lr-chip--mint">
                  <CheckIcon className="size-3.5" /> uses “{word.lemma}”
                </span>
              ) : (
                <span className="lr-chip lr-chip--amber">
                  <TriangleAlertIcon className="size-3.5" /> missing “{word.lemma}”
                </span>
              ))}
          </div>
          {rubric && (
            <div className="mt-1.5">
              {CRITERIA.map(({ key, label }) => (
                <CriteriaRow key={key} label={label} value={rubric.criteria[key]} />
              ))}
            </div>
          )}
        </div>
      </div>

      {attempt.feedback && (
        <div className="rounded-(--r-tile) border border-(--line) bg-(--card-2) px-4.5 py-3.5">
          <p className="lr-sentence m-0 text-[18px]">“{attempt.feedback}”</p>
        </div>
      )}

      {rubric?.correctedSentence && (
        <div className="px-1 pt-2.5">
          <span className="lr-eyebrow text-(--primary-ink)">Suggested</span>
          <p className="lr-sentence mt-1.5 text-[18px]">{rubric.correctedSentence}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="lr-btn lr-btn--soft lr-btn--md" onClick={onTryAnother}>
          <PenLineIcon className="size-4" /> Try another sentence
        </button>
        <button type="button" className="lr-btn lr-btn--ghost lr-btn--md" onClick={() => onSwitchMode("speak")}>
          <MicIcon className="size-4" /> Switch to Speak
        </button>
      </div>
    </div>
  );
}
