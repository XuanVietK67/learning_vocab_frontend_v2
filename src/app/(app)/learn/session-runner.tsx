"use client";

import { useCallback, useEffect, useReducer, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClockIcon, RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { AnswerResponse, QuestionType, SessionMode } from "@/lib/me/learn/types";
import { startSessionAction, submitAnswerAction } from "./actions";
import {
  DEFAULT_LEARN_SETTINGS,
  type LearnSettings,
  LearnSettingsProvider,
} from "./_chrome/settings-context";
import { EmptyState } from "./empty-state";
import { QuestionPrompt } from "./questions/question-prompt";
import { CardFooter } from "./questions/_shared/card-footer";
import { currentItem, initialSessionState, sessionReducer } from "./session-machine";
import { SessionShell } from "./session-shell";
import { SessionSummary } from "./session-summary";

interface SessionRunnerProps {
  mode: SessionMode;
  topicSlug?: string;
  deckId?: string;
}

/**
 * Client state machine for the guided learn loop: starts a session, renders one
 * signed question at a time inside the study-card shell, submits answers through
 * the Server Actions, shows in-card feedback (+ streak/celebration FX), splices
 * any intra-session requeue, and lands on a summary. See
 * docs/learn_vocabulary_flow.md for the contract this drives.
 */
export function SessionRunner({ mode, topicSlug, deckId }: SessionRunnerProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(sessionReducer, undefined, initialSessionState);
  const [feedback, setFeedback] = useState<AnswerResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const questionStartRef = useRef<number>(0);

  // Card-level UI state layered on top of the queue machine.
  const [answer, setAnswer] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [fx, setFx] = useState<"ok" | "bad" | null>(null);
  const [fxKey, setFxKey] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [settings, setSettings] = useState<LearnSettings>(DEFAULT_LEARN_SETTINGS);
  const setSetting = useCallback((key: keyof LearnSettings, value: boolean) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const item = currentItem(state);

  const startSession = useCallback(() => {
    startTransition(async () => {
      setFeedback(null);
      setAnswer(null);
      setStreak(0);
      setBestStreak(0);
      setFx(null);
      setShowSummary(false);
      dispatch({ type: "LOADING" });
      const res = await startSessionAction({ mode, topicSlug, deckId });
      if (res.ok) {
        dispatch({ type: "LOADED", session: res.session });
      } else {
        dispatch({ type: "LOAD_FAILED", error: res.error });
      }
    });
  }, [mode, topicSlug, deckId]);

  // Start (and restart when the mode/target changes).
  useEffect(() => {
    startSession();
  }, [startSession]);

  // Reset the latency clock whenever a fresh question takes the screen.
  useEffect(() => {
    if (item && feedback === null) {
      questionStartRef.current = performance.now();
    }
  }, [item?.sessionItemId, feedback]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scores a graded answer: rolls the streak and fires the celebration FX
  // (gradable types only — flashcards are calm self-rated browse).
  const scoreFeedback = useCallback((result: AnswerResponse, type: QuestionType) => {
    if (result.correct) {
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
    if (type !== "flashcard") {
      setFx(result.correct ? "ok" : "bad");
      setFxKey((k) => k + 1);
      if (result.correct) setConfettiKey((k) => k + 1);
      window.setTimeout(() => setFx(null), 850);
    }
  }, []);

  const handleSubmit = useCallback(
    (userAnswer: string) => {
      if (!item || feedback !== null || isPending) return;
      const latencyMs = Math.max(0, Math.round(performance.now() - questionStartRef.current));
      const type = item.type;

      startTransition(async () => {
        const res = await submitAnswerAction({
          vocabularyId: item.vocabularyId,
          type,
          exampleId: item.exampleId,
          stepIndex: item.stepIndex,
          stepCount: item.stepCount,
          userAnswer,
          latencyMs,
          nonce: item.nonce,
          issuedAtMs: item.issuedAtMs,
          signature: item.signature,
          sessionId: state.sessionId ?? undefined,
        });

        if (res.ok) {
          setFeedback(res.result);
          scoreFeedback(res.result, type);
        } else if (res.expired) {
          dispatch({ type: "EXPIRED" });
        } else {
          toast.error(res.error);
        }
      });
    },
    [item, feedback, isPending, state.sessionId, scoreFeedback],
  );

  const handleContinue = useCallback(() => {
    if (!feedback) return;
    dispatch({
      type: "NEXT",
      correct: feedback.correct,
      requeue: feedback.requeue?.items ?? [],
    });
    setFeedback(null);
    setAnswer(null);
  }, [feedback]);

  // Keyboard: Enter checks a ready quiz answer (flashcards own their own reveal).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showSummary || !item || feedback !== null || item.type === "flashcard") return;
      if (e.key === "Enter" && answer !== null && !isPending) {
        e.preventDefault();
        handleSubmit(answer);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, feedback, answer, isPending, showSummary, handleSubmit]);

  if (state.status === "loading") {
    return <LoadingCard />;
  }

  if (state.status === "error") {
    return <RetryPanel variant="error" onRetry={startSession} />;
  }

  if (state.status === "expired") {
    return <RetryPanel variant="expired" onRetry={startSession} />;
  }

  if (state.status === "empty") {
    return <EmptyState reason={state.emptyReason} nextDueAt={state.nextDueAt} />;
  }

  if (state.status === "done") {
    return (
      <Overlay>
        <SessionSummary
          answered={state.answeredCount}
          correct={state.correctCount}
          bestStreak={bestStreak}
          onStudyAgain={startSession}
        />
      </Overlay>
    );
  }

  if (!item) return null;

  const variant = item.type === "flashcard" ? "flashcard" : "quiz";
  const isLast =
    state.queue.length === 1 && !(feedback?.requeue?.items?.length);

  return (
    <LearnSettingsProvider value={settings}>
      <SessionShell
        current={state.answeredCount + 1}
        total={state.answeredCount + state.queue.length}
        cardKey={item.sessionItemId}
        type={item.type}
        stepIndex={item.stepIndex}
        stepCount={item.stepCount}
        streak={streak}
        showStreak={streak > 1}
        settings={settings}
        setSetting={setSetting}
        onExit={() => router.push("/learn")}
        onPeek={() => setShowSummary(true)}
        fx={fx}
        fxKey={fxKey}
        confettiKey={confettiKey}
        footer={
          <CardFooter
            result={feedback}
            variant={variant}
            canCheck={answer !== null}
            isLast={isLast}
            onCheck={() => answer !== null && handleSubmit(answer)}
            onContinue={handleContinue}
          />
        }
      >
        <QuestionPrompt
          key={item.sessionItemId}
          item={item}
          disabled={isPending || feedback !== null}
          result={feedback}
          onAnswerChange={setAnswer}
          onSubmit={handleSubmit}
        />
      </SessionShell>

      {showSummary && (
        <Overlay>
          <SessionSummary
            answered={state.answeredCount}
            correct={state.correctCount}
            bestStreak={bestStreak}
            onStudyAgain={startSession}
            onClose={() => setShowSummary(false)}
          />
        </Overlay>
      )}
    </LearnSettingsProvider>
  );
}

/** Dimmed, blurred backdrop for the summary modal. */
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="learn-pop fixed inset-0 z-50 grid place-items-center bg-[rgba(30,36,51,0.45)] p-5 backdrop-blur-sm">
      {children}
    </div>
  );
}

/** Skeleton study card shown while the first question loads (matches the shell). */
function LoadingCard() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-140 flex-col px-4 py-5 sm:py-6">
      <div className="mb-4">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="lr-sk h-8 w-36 rounded-full" />
          <div className="lr-sk h-8 w-16 rounded-full" />
        </div>
        <div className="lr-sk h-3 w-full rounded-full" />
      </div>
      <div className="learn-card flex flex-1 flex-col gap-4 p-6 sm:p-7">
        <div className="lr-sk mx-auto size-22 rounded-full" />
        <div className="lr-sk mx-auto h-6 w-2/3 rounded-xl" />
        <div className="lr-sk mx-auto mb-2 h-4 w-2/5 rounded-lg" />
        <div className="lr-sk h-14 rounded-2xl" />
        <div className="lr-sk h-14 rounded-2xl" />
        <div className="lr-sk h-14 rounded-2xl" />
        <div className="lr-sk mt-auto h-15 rounded-full" />
      </div>
    </div>
  );
}

/** Calm retry panel for a stale (expired) question or a failed load. */
function RetryPanel({ variant, onRetry }: { variant: "expired" | "error"; onRetry: () => void }) {
  const expired = variant === "expired";
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="learn-card p-9 text-center">
        <div
          className={cn(
            "lr-pop mx-auto mb-5 grid size-21 place-items-center rounded-3xl",
            expired ? "bg-(--amber-soft) text-(--amber-2)" : "bg-(--bad-soft) text-(--bad-ink)",
          )}
        >
          {expired ? <ClockIcon className="size-10" /> : <TriangleAlertIcon className="size-10" />}
        </div>
        <h1 className="text-[26px] font-extrabold tracking-tight">
          {expired ? "This question expired" : "Something went wrong"}
        </h1>
        <p className="mt-3 text-(--ink-2)">
          {expired
            ? "It’s been a while — start a fresh session so your progress stays accurate."
            : "We couldn’t load your session. Check your connection and try again."}
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="lr-btn lr-btn--primary lr-btn--lg lr-btn--block"
          >
            <RotateCcwIcon className="size-5" />
            {expired ? "Start fresh session" : "Try again"}
          </button>
          <Link href="/dashboard" className="lr-btn lr-btn--ghost lr-btn--md lr-btn--block">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
