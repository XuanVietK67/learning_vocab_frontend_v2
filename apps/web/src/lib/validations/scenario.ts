/**
 * One Zod schema for the scenario author form, shared by the client (inline
 * validation before submit) and the Server Action (always re-validated server
 * side). Mirrors the field rules in docs/api/admin_create_scenario.md. The form
 * keeps "any level" and "unset turns" as empty strings; {@link scenarioFormToPayload}
 * turns the validated values into the strict create/edit body (unknown fields are
 * rejected by the API, so we only send known keys).
 */
import { z } from "zod";

import type { CefrLevel } from "@/lib/auth/types";

export const CEFR_VALUES = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const TOPIC_RE = /^[a-z0-9-]+$/;

export const scenarioFormSchema = z.object({
  title: z.string().trim().min(1, "Give the scene a title.").max(160, "Keep the title under 160 characters."),
  topic: z
    .string()
    .trim()
    .min(1, "Add a topic slug.")
    .max(64)
    .regex(TOPIC_RE, "Lowercase letters, numbers and dashes only."),
  cefrLevel: z.union([z.literal(""), z.enum(CEFR_VALUES)]),
  setting: z.string().trim().min(1, "Describe the scene.").max(2000, "Keep the setting under 2000 characters."),
  aiRole: z.string().trim().min(1, "Who does the AI play?").max(120),
  userRole: z.string().trim().min(1, "Who does the learner play?").max(120),
  goal: z.string().trim().min(1, "What is the learner trying to do?").max(1000),
  openingLine: z.string().trim().min(1, "Write the AI's first line.").max(1000),
  seedPhrases: z.array(z.string().trim().min(1).max(200)).max(20, "Up to 20 phrases."),
  estTurns: z.union([z.literal(""), z.coerce.number().int().min(1, "1–100 turns.").max(100, "1–100 turns.")]),
  introVideoScript: z.string().trim().max(5000, "Keep the script under 5000 characters."),
});

export type ScenarioFormValues = z.infer<typeof scenarioFormSchema>;

/** The body sent to `POST`/`PATCH /v1/admin/scenarios` — only known keys. */
export interface ScenarioPayload {
  title: string;
  topic: string;
  cefrLevel?: CefrLevel | null;
  setting: string;
  aiRole: string;
  userRole: string;
  goal: string;
  openingLine: string;
  seedPhrases?: string[];
  estTurns?: number | null;
  introVideoScript?: string | null;
}

/** Validated form values → strict API payload (empty selects/inputs become null). */
export function scenarioFormToPayload(values: ScenarioFormValues): ScenarioPayload {
  const payload: ScenarioPayload = {
    title: values.title.trim(),
    topic: values.topic.trim(),
    cefrLevel: values.cefrLevel === "" ? null : values.cefrLevel,
    setting: values.setting.trim(),
    aiRole: values.aiRole.trim(),
    userRole: values.userRole.trim(),
    goal: values.goal.trim(),
    openingLine: values.openingLine.trim(),
    seedPhrases: values.seedPhrases,
    estTurns: values.estTurns === "" ? null : values.estTurns,
    introVideoScript: values.introVideoScript.trim() === "" ? null : values.introVideoScript.trim(),
  };
  return payload;
}

/** Blank form — the starting point for `/admin/scenarios/new`. */
export const EMPTY_SCENARIO_FORM: ScenarioFormValues = {
  title: "",
  topic: "",
  cefrLevel: "",
  setting: "",
  aiRole: "",
  userRole: "",
  goal: "",
  openingLine: "",
  seedPhrases: [],
  estTurns: "",
  introVideoScript: "",
};

export const draftBriefSchema = z.object({
  brief: z.string().trim().min(3, "Describe the scene in a few words.").max(500),
  cefrLevel: z.enum(CEFR_VALUES).optional(),
  topic: z.string().trim().max(64).regex(TOPIC_RE).optional(),
});

export type DraftBriefInput = z.input<typeof draftBriefSchema>;
