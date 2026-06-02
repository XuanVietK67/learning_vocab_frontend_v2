/**
 * Shapes for the authenticated `/v1/me` read surface used by the dashboard.
 * Mirrors docs/frontend_handoff.md — keep in sync with the backend contract.
 */
import type { CefrLevel } from "@/lib/auth/types";

/** Per-status card tallies from `GET /v1/me/stats`. */
export interface StatsCounts {
  new: number;
  learning: number;
  review: number;
  mastered: number;
}

/** Home-screen snapshot — `GET /v1/me/stats`. */
export interface StatsResponse {
  streakDays: number;
  dueNow: number;
  reviewedToday: number;
  dailyGoalMinutes: number;
  counts: StatsCounts;
  /** ISO timestamp of the soonest future-scheduled card, or null. */
  nextDueAt: string | null;
}

/** Summary card for a deck — `GET /v1/me/decks/suggested`, `GET /v1/decks`. */
export interface DeckSummary {
  id: string;
  name: string;
  description: string | null;
  language: string;
  cefrLevel: CefrLevel | null;
  vocabCount: number;
}
