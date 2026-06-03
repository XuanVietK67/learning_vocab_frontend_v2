"use client";

import { useCallback, useEffect, useReducer, useRef, useState, useTransition } from "react";
import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnswerResponse, SessionMode } from "@/lib/me/learn/types";
import { startSessionAction, submitAnswerAction } from "./actions";
import { EmptyState } from "./empty-state";
import { QuestionPrompt } from "./questions/question-prompt";
import { FeedbackBanner } from "./questions/_shared/feedback-banner";
import {
  currentItem,
  initialSessionState,
  progressPercent,
  sessionReducer,
} from "./session-machine";
import { SessionShell } from "./session-shell";
import { SessionSummary } from "./session-summary";

interface SessionRunnerProps {
  mode: SessionMode;
  topicSlug?: string;
  deckId?: string;
}

/**
 * Client state machine for the guided learn loop: starts a session, renders one
 * signed question at a time, submits answers through the Server Actions, shows
 * feedback, splices any intra-session requeue, and lands on a summary. See
 * docs/learn_vocabulary_flow.md for the contract this drives.
 */
export function SessionRunner({ mode, topicSlug, deckId }: SessionRunnerProps) {
  const [state, dispatch] = useReducer(sessionReducer, undefined, initialSessionState);
  const [feedback, setFeedback] = useState<AnswerResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const questionStartRef = useRef<number>(0);

  const item = currentItem(state);

  const startSession = useCallback(() => {
    startTransition(async () => {
      setFeedback(null);
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

  function handleSubmit(userAnswer: string) {
    if (!item || feedback !== null || isPending) return;
    const latencyMs = Math.max(0, Math.round(performance.now() - questionStartRef.current));

    startTransition(async () => {
      const res = await submitAnswerAction({
        vocabularyId: item.vocabularyId,
        type: item.type,
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
      } else if (res.expired) {
        dispatch({ type: "EXPIRED" });
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleContinue() {
    if (!feedback) return;
    dispatch({
      type: "NEXT",
      correct: feedback.correct,
      requeue: feedback.requeue?.items ?? [],
    });
    setFeedback(null);
  }

  if (state.status === "loading") {
    return (
      <SessionShell percent={0}>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </SessionShell>
    );
  }

  if (state.status === "error") {
    return <RetryPanel message={state.error ?? "Something went wrong."} onRetry={startSession} />;
  }

  if (state.status === "expired") {
    return (
      <RetryPanel
        message="This question expired (sessions last about 30 minutes). Start a fresh one to keep going."
        onRetry={startSession}
        retryLabel="Start fresh session"
      />
    );
  }

  if (state.status === "empty") {
    return <EmptyState reason={state.emptyReason} nextDueAt={state.nextDueAt} />;
  }

  if (state.status === "done") {
    return (
      <SessionSummary
        answered={state.answeredCount}
        correct={state.correctCount}
        onStudyAgain={startSession}
      />
    );
  }

  if (!item) return null;

  const stepLabel = item.stepCount > 1 ? `Step ${item.stepIndex + 1} of ${item.stepCount}` : null;

  return (
    <SessionShell percent={progressPercent(state)} stepLabel={stepLabel}>
      <div className="flex flex-col gap-5">
        <QuestionPrompt
          key={item.sessionItemId}
          item={item}
          disabled={isPending || feedback !== null}
          result={feedback}
          onSubmit={handleSubmit}
        />

        {feedback !== null && (
          <div className="flex flex-col gap-3">
            <FeedbackBanner result={feedback} hideAnswer={item.type === "flashcard"} />
            <Button type="button" autoFocus onClick={handleContinue} className="h-11 w-full text-base">
              Continue
            </Button>
          </div>
        )}
      </div>
    </SessionShell>
  );
}

function RetryPanel({
  message,
  onRetry,
  retryLabel = "Try again",
}: {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-16 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" onClick={onRetry} className="h-10 px-5">
        <RotateCcwIcon />
        {retryLabel}
      </Button>
    </div>
  );
}
