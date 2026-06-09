/**
 * Pure reducer for the learn-session queue. Owns the ordered list of questions
 * still to show, the running tallies, and which terminal state we land in. Kept
 * free of React and network so it can be reasoned about (and unit-tested) on its
 * own — the client runner pairs it with the Server Actions and per-question
 * feedback UI.
 *
 * The current question is always `queue[0]`. Requeued items (a word's
 * next-stage ladder, due again within the session) are appended to the back;
 * v1 reappears them later in the same session rather than firing a wall-clock
 * timer (see docs/api/learn_vocabulary_flow.md).
 */
import type {
  EmptyReason,
  SessionItem,
  SessionMode,
  SessionResponse,
} from "@/lib/me/learn/types";

export type SessionStatus =
  | "loading"
  | "active"
  | "empty"
  | "done"
  | "expired"
  | "error";

export interface SessionState {
  status: SessionStatus;
  sessionId: string | null;
  mode: SessionMode | null;
  /** Remaining questions; `queue[0]` is the one on screen. */
  queue: SessionItem[];
  /** Steps answered so far (the progress numerator). */
  answeredCount: number;
  /** Correct answers, for the end-of-session summary. */
  correctCount: number;
  enrolledNewlyCount: number;
  emptyReason: EmptyReason | null;
  nextDueAt: string | null;
  error: string | null;
}

export type SessionAction =
  | { type: "LOADING" }
  | { type: "LOADED"; session: SessionResponse }
  | { type: "LOAD_FAILED"; error: string }
  /** Advance past the current question after its feedback was shown. */
  | { type: "NEXT"; correct: boolean; requeue: SessionItem[] }
  | { type: "EXPIRED" };

export function initialSessionState(): SessionState {
  return {
    status: "loading",
    sessionId: null,
    mode: null,
    queue: [],
    answeredCount: 0,
    correctCount: 0,
    enrolledNewlyCount: 0,
    emptyReason: null,
    nextDueAt: null,
    error: null,
  };
}

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case "LOADING":
      return { ...initialSessionState(), status: "loading" };

    case "LOADED": {
      const { session } = action;
      if (session.items.length === 0) {
        return {
          ...state,
          status: "empty",
          sessionId: session.sessionId,
          mode: session.mode,
          enrolledNewlyCount: session.enrolledNewlyCount,
          emptyReason: session.emptyReason,
          nextDueAt: session.nextDueAt,
          queue: [],
          error: null,
        };
      }
      return {
        ...state,
        status: "active",
        sessionId: session.sessionId,
        mode: session.mode,
        enrolledNewlyCount: session.enrolledNewlyCount,
        emptyReason: null,
        nextDueAt: session.nextDueAt,
        queue: session.items,
        answeredCount: 0,
        correctCount: 0,
        error: null,
      };
    }

    case "LOAD_FAILED":
      return { ...state, status: "error", error: action.error };

    case "NEXT": {
      const rest = state.queue.slice(1);
      const queue = action.requeue.length ? [...rest, ...action.requeue] : rest;
      return {
        ...state,
        queue,
        answeredCount: state.answeredCount + 1,
        correctCount: state.correctCount + (action.correct ? 1 : 0),
        status: queue.length === 0 ? "done" : "active",
      };
    }

    case "EXPIRED":
      return { ...state, status: "expired" };

    default:
      return state;
  }
}

/** The question currently on screen, or null when none remain. */
export function currentItem(state: SessionState): SessionItem | null {
  return state.queue[0] ?? null;
}

/** Progress fraction for the header bar: answered / (answered + remaining). */
export function progressPercent(state: SessionState): number {
  const total = state.answeredCount + state.queue.length;
  if (total === 0) return 0;
  return Math.round((state.answeredCount / total) * 100);
}
