"use server";

import { revalidatePath } from "next/cache";

import { authedRequest, firstMessage } from "@/lib/api";
import { createVocabularySchema } from "@/lib/validations/vocabulary";
import type { MyWord } from "./types";

/**
 * Result of the manual create form (`POST /v1/me/vocabularies`). Expected
 * failures (409 duplicate, 400 validation) are returned as values, not thrown,
 * so the form can map them inline and keep the user's input (frontend skill §9).
 */
export type CreateVocabResult =
  | { ok: true; id: string }
  | { ok: false; status: 409; message: string }
  | { ok: false; status: 400; message: string; fieldErrors: Record<string, string> }
  | { ok: false; status: number; message: string };

/** Pull the leading dotted-path token (e.g. `senses.0.examples`) off a Nest message. */
function fieldPathOf(message: string): string | null {
  const first = message.trim().split(/\s+/)[0] ?? "";
  return /^[a-z]+(\.\d+|\.[a-z]+)+$|^[a-z]+$/i.test(first) && first.includes(".")
    ? first
    : /^(lemma|language|partOfSpeech|ipa|cefrLevel|frequencyRank|audioUrl|topics)$/.test(first)
      ? first
      : null;
}

/**
 * Author a full user word — header + senses (each with translations and ≥2
 * examples) — in one atomic request. The client serializes its draft to JSON;
 * we re-validate with the shared schema before sending, then map the backend's
 * `201 | 409 | 400` onto a typed result.
 */
export async function createUserVocabulary(
  payloadJson: string,
): Promise<CreateVocabResult> {
  let raw: unknown;
  try {
    raw = JSON.parse(payloadJson);
  } catch {
    return { ok: false, status: 400, message: "Couldn't read the form.", fieldErrors: {} };
  }

  const parsed = createVocabularySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return {
      ok: false,
      status: 400,
      message: "Fix the highlighted fields.",
      fieldErrors,
    };
  }

  const res = await authedRequest<MyWord>("/v1/me/vocabularies", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (res.ok && res.data) {
    revalidatePath("/words");
    return { ok: true, id: res.data.id };
  }

  const message = firstMessage(res.error) ?? "Couldn't save that word.";

  if (res.status === 409) {
    return { ok: false, status: 409, message };
  }

  if (res.status === 400 && res.error) {
    const messages = Array.isArray(res.error.message)
      ? res.error.message
      : [res.error.message];
    const fieldErrors: Record<string, string> = {};
    for (const m of messages) {
      const path = fieldPathOf(m);
      if (path) fieldErrors[path] = m;
    }
    return { ok: false, status: 400, message, fieldErrors };
  }

  return { ok: false, status: res.status, message };
}

/** Remove a word the caller owns (`DELETE /v1/me/vocabularies/:id`). */
export async function deleteUserVocabulary(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await authedRequest(`/v1/me/vocabularies/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    return { ok: false, error: firstMessage(res.error) ?? "Couldn't remove that word." };
  }
  revalidatePath("/words");
  return { ok: true };
}
