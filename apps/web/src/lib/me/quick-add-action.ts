"use server";

import { z } from "zod";

import { authedRequest, firstMessage } from "@/lib/api";

/** Async quick-create job — `POST …/quick-create` → `202`, poll `…/jobs/:id`. */
interface QuickCreateJob {
  id: string;
  status: "pending" | "completed" | "failed";
  /** Created word id(s) — one per resolved part of speech. Empty = already owned. */
  resultVocabularyIds: string[];
  error: string | null;
}

export type JobStatus = QuickCreateJob["status"] | "unknown";

export interface QuickAddResult {
  ok: boolean;
  jobId?: string;
  error?: string;
}

const lemmaSchema = z.string().trim().min(1, "Enter a word.").max(128, "That word is too long.");
const LANGUAGE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

interface QuickAddOptions {
  language?: string;
  translationLanguage?: string;
}

/**
 * Start a quick-create job for a single lemma (§10). Returns the job id so the
 * caller can poll. Async by design — the word lands in the user's collection
 * once the background worker enriches it. `language`/`translationLanguage` are
 * optional (the server defaults them).
 */
export async function quickAddWord(
  lemma: string,
  opts: QuickAddOptions = {},
): Promise<QuickAddResult> {
  const parsed = lemmaSchema.safeParse(lemma);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a word." };
  }

  const body: Record<string, string> = { lemma: parsed.data };
  if (opts.language && LANGUAGE_RE.test(opts.language)) body.language = opts.language;
  if (opts.translationLanguage && LANGUAGE_RE.test(opts.translationLanguage)) {
    body.translationLanguage = opts.translationLanguage;
  }

  const res = await authedRequest<QuickCreateJob>(
    "/v1/me/vocabularies/quick-create",
    { method: "POST", body: JSON.stringify(body) },
  );

  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: firstMessage(res.error) ?? "Couldn't add that word right now.",
    };
  }
  return { ok: true, jobId: res.data.id };
}

/** One poll of a quick-create job. The client repeats this with backoff. */
export async function pollVocabularyJob(
  jobId: string,
): Promise<{ status: JobStatus; error?: string; resultVocabularyIds: string[] }> {
  const res = await authedRequest<QuickCreateJob>(
    `/v1/me/vocabularies/jobs/${jobId}`,
    { method: "GET" },
  );
  if (!res.ok || !res.data) return { status: "unknown", resultVocabularyIds: [] };
  return {
    status: res.data.status,
    error: res.data.error ?? undefined,
    resultVocabularyIds: res.data.resultVocabularyIds ?? [],
  };
}
