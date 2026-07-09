/**
 * Wire shapes for the learner-facing Speaking Room (browse + live session).
 * Mirrors docs/api/speaking_browse_scenarios.md and speaking_practice_session.md.
 * Admin authoring shapes live in {@link import("@/lib/admin/scenarios/types")}.
 */
import type { CefrLevel } from "@/lib/auth/types";

/** A published scenario card — everything a learner needs to pick and start. */
export interface SpeakingScenario {
  id: string;
  title: string;
  topic: string;
  /** `null` = any level. */
  cefrLevel: CefrLevel | null;
  setting: string;
  aiRole: string;
  userRole: string;
  goal: string;
  openingLine: string;
  seedPhrases: string[];
  estTurns: number | null;
  /** MP4 cutscene URL when present (later milestone); `null` today. */
  introVideoUrl: string | null;
}

export interface ScenarioPage {
  data: SpeakingScenario[];
  page: number;
  limit: number;
  total: number;
}

/** The session handle from `POST /v1/speaking/sessions` — keep `id` for every later call. */
export interface SpeakingSession {
  id: string;
  scenarioId: string;
  status: string;
  cefrLevel: CefrLevel | null;
  /** Resolved lemmas actually in play — the session's target words. */
  selectedWords: string[];
  /** Requested ids that were dropped (private/draft/bad). */
  inaccessibleVocabularyIds: string[];
  openingLine: string;
  createdAt: string;
}

/** One on-screen coaching note — the quiet amber teaching channel (never spoken, never red). */
export interface SpeakingCorrection {
  userSaid: string;
  better: string;
  why: string;
}

/** The AI's reply to one learner turn. */
export interface SpeakingTurn {
  turnIndex: number;
  reply: string;
  corrections: SpeakingCorrection[];
  usedTargetWords: string[];
}

export type ReportStatus = "ready" | "failed" | "pending";

export interface SpeakingReport {
  summary: string;
  topMistakes: SpeakingCorrection[];
  targetWordsUsed: string[];
  targetWordsMissed: string[];
  estimatedLevel: CefrLevel | null;
  whatToPracticeNext: string[];
}

/** `end` / `report` envelope. `report` is `null` when `reportStatus !== "ready"`. */
export interface SpeakingReportEnvelope {
  sessionId: string;
  reportStatus: ReportStatus;
  reportModel: string | null;
  report: SpeakingReport | null;
}
