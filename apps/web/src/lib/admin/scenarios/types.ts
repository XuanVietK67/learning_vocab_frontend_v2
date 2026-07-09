/**
 * Wire shapes for the admin scenario-authoring surface
 * (docs/api/admin_create_scenario.md + admin_draft_scenario.md). The learner only
 * ever sees the subset in {@link import("@/lib/me/speaking/types")}; these carry
 * the lifecycle fields (`status`, `version`, …) too.
 */
import type { CefrLevel } from "@/lib/auth/types";

export type ScenarioStatus = "draft" | "published" | "retired";

/** The full scenario record an admin edits. */
export interface AdminScenario {
  id: string;
  title: string;
  topic: string;
  cefrLevel: CefrLevel | null;
  setting: string;
  aiRole: string;
  userRole: string;
  goal: string;
  openingLine: string;
  seedPhrases: string[];
  estTurns: number | null;
  introVideoScript: string | null;
  introVideoUrl: string | null;
  status: ScenarioStatus;
  version: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminScenarioPage {
  data: AdminScenario[];
  page: number;
  limit: number;
  total: number;
}

/** A Draft-with-AI suggestion — maps 1:1 onto the create form, plus the model. */
export interface ScenarioDraft {
  title: string;
  topic: string;
  cefrLevel: CefrLevel | null;
  setting: string;
  aiRole: string;
  userRole: string;
  goal: string;
  openingLine: string;
  seedPhrases: string[];
  estTurns: number | null;
  introVideoScript: string | null;
  model: string;
}
