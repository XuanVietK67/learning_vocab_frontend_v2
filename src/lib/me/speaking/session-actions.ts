"use server";

/**
 * Server Actions for the live Speaking Room session
 * (docs/api/speaking_practice_session.md). The HTTP client is server-only
 * (httpOnly-cookie tokens), so the client conversation screen reaches the backend
 * through here. The whole flow: **start → (turn ⇄ reply)\* → end → report.**
 *
 * Each action returns a discriminated result so the screen can branch on the
 * exact failure the API doc calls out (429 daily cap, 503 retry-safe turn, …)
 * rather than a generic throw — a failed turn is *not* saved, so the learner's
 * text is kept and the same send can be retried.
 */
import { z } from "zod";

import { authedRequest, firstMessage } from "@/lib/api";
import type { CatalogueWord } from "@/lib/me/practice/types";
import { asArray } from "@/lib/me/practice/words";
import { toCatalogueWord, type RawCatalogVocab } from "@/lib/me/practice/queue";
import type {
  SpeakingReportEnvelope,
  SpeakingSession,
  SpeakingTurn,
} from "./types";

const startSchema = z.object({
  scenarioId: z.string().uuid(),
  vocabularyIds: z.array(z.string().uuid()).max(50).optional(),
});

/** Why starting a session failed, mapped to how the scene screen should respond. */
export type StartFailureKind =
  /** `429`: daily session cap — "try again tomorrow". */
  | "quota"
  /** `404`: scenario gone / not published — back to the catalogue. */
  | "notFound"
  /** `503`: Groq unconfigured or timed out — the feature is unavailable. */
  | "unavailable"
  | "error";

export type StartSessionResult =
  | { ok: true; session: SpeakingSession }
  | { ok: false; kind: StartFailureKind; message: string };

/** Start a session on a published scenario, optionally seeding target words. */
export async function startSessionAction(input: {
  scenarioId: string;
  vocabularyIds?: string[];
}): Promise<StartSessionResult> {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, kind: "error", message: "Couldn't start that scenario." };
  }

  const body: Record<string, unknown> = { scenarioId: parsed.data.scenarioId };
  if (parsed.data.vocabularyIds && parsed.data.vocabularyIds.length > 0) {
    body.vocabularyIds = parsed.data.vocabularyIds;
  }

  const res = await authedRequest<SpeakingSession>("/v1/speaking/sessions", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (res.ok && res.data) return { ok: true, session: res.data };

  const message = firstMessage(res.error);
  switch (res.status) {
    case 404:
      return { ok: false, kind: "notFound", message: "That scenario isn't available anymore." };
    case 429:
      return {
        ok: false,
        kind: "quota",
        message: message ?? "You've hit today's practice limit — try again tomorrow.",
      };
    case 503:
      return {
        ok: false,
        kind: "unavailable",
        message: "The Speaking Room is resting right now — try again in a moment.",
      };
    default:
      return { ok: false, kind: "error", message: message ?? "Couldn't start the conversation." };
  }
}

const turnSchema = z.object({
  text: z.string().trim().min(1, "Say something first.").max(1000, "Keep it under 1000 characters."),
});

/** Why a turn failed. `capReached` (400) should prompt the learner to End. */
export type TurnFailureKind = "capReached" | "retry" | "ended" | "error";

export type TakeTurnResult =
  | { ok: true; turn: SpeakingTurn }
  | { ok: false; kind: TurnFailureKind; message: string };

/**
 * Send one learner turn; get the AI reply + corrections + used target words.
 * A `503` is **retry-safe** (the turn was not saved) — the screen keeps the text
 * and offers Retry. A `400` usually means the per-session turn cap was hit.
 */
export async function takeTurnAction(
  sessionId: string,
  text: string,
): Promise<TakeTurnResult> {
  if (!z.string().uuid().safeParse(sessionId).success) {
    return { ok: false, kind: "error", message: "That session couldn't be found." };
  }
  const parsed = turnSchema.safeParse({ text });
  if (!parsed.success) {
    return { ok: false, kind: "error", message: parsed.error.issues[0]?.message ?? "Say something first." };
  }

  const res = await authedRequest<SpeakingTurn>(
    `/v1/speaking/sessions/${sessionId}/turn`,
    { method: "POST", body: JSON.stringify(parsed.data) },
  );

  if (res.ok && res.data) {
    return {
      ok: true,
      turn: {
        turnIndex: res.data.turnIndex,
        reply: res.data.reply,
        corrections: Array.isArray(res.data.corrections) ? res.data.corrections : [],
        usedTargetWords: Array.isArray(res.data.usedTargetWords) ? res.data.usedTargetWords : [],
      },
    };
  }

  const message = firstMessage(res.error);
  switch (res.status) {
    case 400:
      return {
        ok: false,
        kind: "capReached",
        message: message ?? "You've reached the turn limit — end the session for your report.",
      };
    case 503:
      return {
        ok: false,
        kind: "retry",
        message: "That didn't go through — your message is safe, tap Retry.",
      };
    default:
      return { ok: false, kind: "error", message: message ?? "Couldn't send that. Try again." };
  }
}

export type ReportResult =
  | { ok: true; envelope: SpeakingReportEnvelope }
  | { ok: false; message: string };

function normaliseEnvelope(data: SpeakingReportEnvelope): SpeakingReportEnvelope {
  return {
    sessionId: data.sessionId,
    reportStatus: data.reportStatus,
    reportModel: data.reportModel ?? null,
    report: data.report ?? null,
  };
}

/** End the session and build the feedback report (idempotent). */
export async function endSessionAction(sessionId: string): Promise<ReportResult> {
  if (!z.string().uuid().safeParse(sessionId).success) {
    return { ok: false, message: "That session couldn't be found." };
  }
  const res = await authedRequest<SpeakingReportEnvelope>(
    `/v1/speaking/sessions/${sessionId}/end`,
    { method: "POST" },
  );
  if (res.ok && res.data) return { ok: true, envelope: normaliseEnvelope(res.data) };
  return { ok: false, message: firstMessage(res.error) ?? "Couldn't build your report." };
}

/** Re-fetch the report (regenerated on read if it wasn't ready). */
export async function getReportAction(sessionId: string): Promise<ReportResult> {
  if (!z.string().uuid().safeParse(sessionId).success) {
    return { ok: false, message: "That session couldn't be found." };
  }
  const res = await authedRequest<SpeakingReportEnvelope>(
    `/v1/speaking/sessions/${sessionId}/report`,
    { method: "GET" },
  );
  if (res.ok && res.data) return { ok: true, envelope: normaliseEnvelope(res.data) };
  return { ok: false, message: firstMessage(res.error) ?? "Couldn't load your report." };
}

/**
 * Search the public vocabulary catalogue for the scene-screen word picker
 * (`GET /v1/vocabularies`). Reuses the practice catalogue projection; empty on
 * error. Selected ids are passed straight to `startSessionAction` (the start
 * endpoint drops any inaccessible ones into `inaccessibleVocabularyIds`).
 */
const vocabFilterSchema = z.object({
  q: z.string().trim().max(64).optional(),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
  topic: z.string().trim().max(64).optional(),
});

export async function searchVocabularyAction(filter: {
  q?: string;
  cefrLevel?: string;
  topic?: string;
}): Promise<CatalogueWord[]> {
  const parsed = vocabFilterSchema.safeParse(filter);
  if (!parsed.success) return [];

  const params = new URLSearchParams({ limit: "40" });
  if (parsed.data.q) params.set("q", parsed.data.q);
  if (parsed.data.cefrLevel) params.set("cefrLevel", parsed.data.cefrLevel);
  if (parsed.data.topic) params.set("topic", parsed.data.topic);

  const res = await authedRequest<unknown>(`/v1/vocabularies?${params.toString()}`, {
    method: "GET",
  });
  if (!res.ok) return [];
  return asArray<RawCatalogVocab>(res.data)
    .filter((v) => Boolean(v?.id && v?.lemma))
    .map(toCatalogueWord);
}
