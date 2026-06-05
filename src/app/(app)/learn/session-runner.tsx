"use client";

import { useCallback, useEffect, useReducer, useRef, useState, useTransition } from "react";
import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

const TYPE_LABEL: Record<QuestionType, string> = {
  flashcard: "Flashcard",
  cloze_mcq: "Multiple choice",
  cloze_typing: "Type the word",
  meaning_in_context: "Meaning in context",
  sense_disambiguation: "Word sense",
  listening_cloze: "Listening",
  word_from_translation: "Pick the word",
  translation_from_word: "Pick the meaning",
  listening_choice: "Listening",
  dictation: "Dictation",
  image_choice: "Pick the picture",
  pronunciation: "Say it",
};

/**
 * Client state machine for the guided learn loop: starts a session, renders one
 * signed question at a time inside the study-card shell, submits answers through
 * the Server Actions, shows in-card feedback (+ streak/celebration FX), splices
 * any intra-session requeue, and lands on a summary. See
 * docs/learn_vocabulary_flow.md for the contract this drives.
 */
export function SessionRunner({ mode, topicSlug, deckId }: SessionRunnerProps) {
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
        typeLabel={TYPE_LABEL[item.type]}
        streak={streak}
        showStreak={streak > 1}
        settings={settings}
        setSetting={setSetting}
        onProgress={() => setShowSummary(true)}
        fx={fx}
        fxKey={fxKey}
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

/** Skeleton study card shown while the first question loads. */
function LoadingCard() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 py-6">
      <div className="learn-card flex min-h-115 w-full flex-col gap-4 rounded-[22px] px-6 py-7 sm:px-9 sm:py-8">
        <Skeleton className="mx-auto h-6 w-32 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-30 w-42 rounded-[18px]" />
        <Skeleton className="mx-auto h-10 w-48" />
        <div className="mt-auto">
          <Skeleton className="h-12 w-full rounded-[14px]" />
        </div>
      </div>
    </div>
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
