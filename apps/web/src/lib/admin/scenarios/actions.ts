"use server";

/**
 * Server Actions for admin scenario authoring (create / edit / publish / retire)
 * and the optional Draft-with-AI helper. Mirrors docs/api/admin_create_scenario.md
 * and admin_draft_scenario.md. Each returns a typed result (never throws on an
 * expected failure) so the form can render inline notices — most importantly the
 * `503` "AI drafting unavailable" path, which must keep the manual form usable.
 */
import { revalidatePath } from "next/cache";

import { authedRequest, firstMessage } from "@/lib/api";
import {
  draftBriefSchema,
  scenarioFormSchema,
  scenarioFormToPayload,
  type DraftBriefInput,
  type ScenarioFormValues,
} from "@/lib/validations/scenario";
import type { AdminScenario, ScenarioDraft } from "./types";

/** Draft helper outcome. `unavailable` (503) must not block the manual form. */
export type DraftScenarioResult =
  | { ok: true; draft: ScenarioDraft }
  | { ok: false; kind: "validation" | "unavailable" | "error"; message: string };

/** Ask the LLM to propose a full scenario spec from a one-line brief. */
export async function draftScenarioAction(
  input: DraftBriefInput,
): Promise<DraftScenarioResult> {
  const parsed = draftBriefSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      kind: "validation",
      message: parsed.error.issues[0]?.message ?? "Describe the scene in a few words.",
    };
  }

  const body: Record<string, unknown> = { brief: parsed.data.brief };
  if (parsed.data.cefrLevel) body.cefrLevel = parsed.data.cefrLevel;
  if (parsed.data.topic) body.topic = parsed.data.topic;

  const res = await authedRequest<ScenarioDraft>("/v1/admin/scenarios/draft", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (res.ok && res.data) return { ok: true, draft: res.data };

  if (res.status === 503) {
    return {
      ok: false,
      kind: "unavailable",
      message: "AI drafting is unavailable — fill the form manually below.",
    };
  }
  if (res.status === 400) {
    return { ok: false, kind: "validation", message: firstMessage(res.error) ?? "Check the brief." };
  }
  return { ok: false, kind: "error", message: firstMessage(res.error) ?? "Couldn't draft that. Try again." };
}

export type SaveScenarioResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Create a scenario (lands in `draft`). Returns the new id to navigate into. */
export async function createScenarioAction(
  values: ScenarioFormValues,
): Promise<SaveScenarioResult> {
  const parsed = scenarioFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const res = await authedRequest<AdminScenario>("/v1/admin/scenarios", {
    method: "POST",
    body: JSON.stringify(scenarioFormToPayload(parsed.data)),
  });

  if (!res.ok || !res.data) {
    return { ok: false, error: firstMessage(res.error) ?? "Couldn't create that scenario." };
  }
  revalidatePath("/admin/scenarios");
  return { ok: true, id: res.data.id };
}

/** Edit a scenario. Editing a published one bumps `version` server-side. */
export async function updateScenarioAction(
  id: string,
  values: ScenarioFormValues,
): Promise<SaveScenarioResult> {
  const parsed = scenarioFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const res = await authedRequest<AdminScenario>(`/v1/admin/scenarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(scenarioFormToPayload(parsed.data)),
  });

  if (!res.ok || !res.data) {
    return { ok: false, error: firstMessage(res.error) ?? "Couldn't save your changes." };
  }
  revalidatePath("/admin/scenarios");
  revalidatePath(`/admin/scenarios/${id}`);
  return { ok: true, id: res.data.id };
}

export type LifecycleResult = { ok: boolean; error?: string };

/** Publish a draft/retired scenario (makes it learner-visible). `400` if already live. */
export async function publishScenarioAction(id: string): Promise<LifecycleResult> {
  const res = await authedRequest<AdminScenario>(`/v1/admin/scenarios/${id}/publish`, {
    method: "POST",
  });
  if (!res.ok) {
    return { ok: false, error: firstMessage(res.error) ?? "Couldn't publish that scenario." };
  }
  revalidatePath("/admin/scenarios");
  revalidatePath(`/admin/scenarios/${id}`);
  return { ok: true };
}

/** Retire (soft-delete → `retired`) a scenario. Idempotent (`204`). */
export async function retireScenarioAction(id: string): Promise<LifecycleResult> {
  const res = await authedRequest(`/v1/admin/scenarios/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    return { ok: false, error: firstMessage(res.error) ?? "Couldn't retire that scenario." };
  }
  revalidatePath("/admin/scenarios");
  revalidatePath(`/admin/scenarios/${id}`);
  return { ok: true };
}
