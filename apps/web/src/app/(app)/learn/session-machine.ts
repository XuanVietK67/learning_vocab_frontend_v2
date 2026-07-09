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
  QuestionType,
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
  /**
   * The `type` of every step already answered, in answer order. Concatenated
   * with the remaining `queue` types it reconstructs the full session timeline
   * (answered + remaining), from which the stage track is derived. The current
   * item sits at timeline index `answeredCount` (== `answeredTypes.length`).
   */
  answeredTypes: QuestionType[];
  /** Correct / total per question type — feeds the stage-clear stat. */
  tally: Record<string, { correct: number; total: number }>;
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
    answeredTypes: [],
    tally: {},
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
        answeredTypes: [],
        tally: {},
        error: null,
      };
    }

    case "LOAD_FAILED":
      return { ...state, status: "error", error: action.error };

    case "NEXT": {
      const answered = state.queue[0];
      const rest = state.queue.slice(1);
      const queue = action.requeue.length ? [...rest, ...action.requeue] : rest;
      const answeredTypes = answered
        ? [...state.answeredTypes, answered.type]
        : state.answeredTypes;
      const tally = answered
        ? bumpTally(state.tally, answered.type, action.correct)
        : state.tally;
      return {
        ...state,
        queue,
        answeredCount: state.answeredCount + 1,
        correctCount: state.correctCount + (action.correct ? 1 : 0),
        answeredTypes,
        tally,
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

/** Returns `tally` with one answer folded into the given type's bucket. */
function bumpTally(
  tally: SessionState["tally"],
  type: QuestionType,
  correct: boolean,
): SessionState["tally"] {
  const prev = tally[type] ?? { correct: 0, total: 0 };
  return {
    ...tally,
    [type]: { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 },
  };
}

/** A round in the stage track. The session is type-major, so each contiguous
 * run of one `type` is one stage; difficulty ascends left → right. */
export interface StageSegment {
  type: QuestionType;
  state: "cleared" | "current" | "upcoming";
}

/**
 * The stage track: the distinct `type` runs across the whole session timeline
 * (answered + remaining), each marked cleared / current / upcoming. Requeued
 * ladders splice onto the back of the queue, so they widen the track to the
 * right as bonus stages. Derived — there is no `round` field on the contract.
 */
export function deriveStages(state: SessionState): StageSegment[] {
  const types: QuestionType[] = [
    ...state.answeredTypes,
    ...state.queue.map((item) => item.type),
  ];
  const currentIndex = state.answeredTypes.length;

  const runs: { type: QuestionType; start: number; end: number }[] = [];
  types.forEach((type, i) => {
    const last = runs[runs.length - 1];
    if (last && last.type === type) last.end = i + 1;
    else runs.push({ type, start: i, end: i + 1 });
  });

  return runs.map((run) => ({
    type: run.type,
    state:
      run.end <= currentIndex
        ? "cleared"
        : run.start <= currentIndex
          ? "current"
          : "upcoming",
  }));
}

/** A one-line "N / M correct" stat for a round's type (for the interstitial). */
export function roundStat(
  state: SessionState,
  type: QuestionType,
): { correct: number; total: number } {
  return state.tally[type] ?? { correct: 0, total: 0 };
}
