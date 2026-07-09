"use server";

/**
 * Server Actions for the guided learn loop. The HTTP client is server-only
 * (httpOnly-cookie tokens), so the interactive client runner reaches the
 * backend through these. Both POST through `authedRequest`, which transparently
 * rotates the refresh token on a 401 and retries once.
 *
 * `translationLang` is derived from the caller's onboarding `nativeLanguage`
 * (the language hints/translations should appear in) and injected here so the
 * client never has to manage it — and so the session and its answers agree.
 */
import { authedRequest, firstMessage } from "@/lib/api";
import { getMe } from "@/lib/auth/me";
import type { AnswerResponse, SessionResponse } from "@/lib/me/learn/types";
import {
  startSessionSchema,
  submitAnswerSchema,
  type StartSessionInput,
  type SubmitAnswerInput,
} from "@/lib/validations/learn";

export type StartSessionResult =
  | { ok: true; session: SessionResponse }
  | { ok: false; status: number; error: string };

export type SubmitAnswerResult =
  | { ok: true; result: AnswerResponse }
  | { ok: false; expired: boolean; error: string };

/** The caller's preferred translation language, or undefined when unset. */
async function translationLang(): Promise<string | undefined> {
  const me = await getMe();
  return me?.nativeLanguage ?? undefined;
}

/** Start a session for a mode; the server picks cards and signs each question. */
export async function startSessionAction(
  input: StartSessionInput,
): Promise<StartSessionResult> {
  const parsed = startSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "Invalid session request." };
  }

  const res = await authedRequest<SessionResponse>("/v1/me/learn/session", {
    method: "POST",
    body: JSON.stringify({ ...parsed.data, translationLang: await translationLang() }),
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      status: res.status,
      error: firstMessage(res.error) ?? "Could not start a session.",
    };
  }
  return { ok: true, session: res.data };
}

/** Submit one answer; the server grades it and may reschedule / requeue the card. */
export async function submitAnswerAction(
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult> {
  const parsed = submitAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, expired: false, error: "Invalid answer." };
  }

  const res = await authedRequest<AnswerResponse>("/v1/me/learn/answer", {
    method: "POST",
    body: JSON.stringify({ ...parsed.data, translationLang: await translationLang() }),
  });

  if (!res.ok || !res.data) {
    // authedRequest already retried after refreshing the access token, so a
    // lingering 401 means the question's HMAC signature expired/was tampered.
    if (res.status === 401) {
      return {
        ok: false,
        expired: true,
        error: "This question expired. Start a fresh session to continue.",
      };
    }
    return {
      ok: false,
      expired: false,
      error: firstMessage(res.error) ?? "Could not submit your answer.",
    };
  }
  return { ok: true, result: res.data };
}
