"use server";

/**
 * Server Actions for the AI-assisted vocabulary flows (single quick-create and
 * bulk import). These are invoked imperatively from client components — the
 * submit calls plus the poll loops — so they return typed `DataResult`s instead
 * of redirecting. The browser never talks to the backend directly: the access
 * token lives in an HTTP-only cookie and is attached here by `authedRequest`.
 *
 * Approve/reject mutate the catalog and revalidate the review + list pages.
 */
import { revalidatePath } from "next/cache";

import { authedRequest, firstMessage } from "@/lib/api";
import type {
  ActionResult,
  BatchStatus,
  BulkSubmitResult,
  DataResult,
  ExtractResult,
  ExtractMode,
  QuickJob,
} from "./types";

const LIST_PATH = "/admin/vocabularies";
const REVIEW_PATH = "/admin/vocabularies/review";

const SESSION_EXPIRED = "Your session expired — please sign in again.";

// ── Single quick-create ──────────────────────────────────────────────────────

/**
 * Submit one lemma for enrichment (`POST …/quick`). Idempotent server-side: a
 * still-pending job for the same `(language, lemma)` returns that same job.
 *
 * `translationLanguage` is the target for the per-sense translation Gemma adds.
 * Passing it equal to `language` tells the backend to skip translation; we omit
 * it entirely when not given so the server falls back to its default.
 */
export async function quickCreateAction(
  lemma: string,
  language = "en",
  translationLanguage?: string,
): Promise<DataResult<QuickJob>> {
  const trimmed = lemma.trim();
  if (!trimmed || trimmed.length > 128) {
    return { ok: false, error: "Enter a word between 1 and 128 characters." };
  }

  const res = await authedRequest<QuickJob>("/v1/admin/vocabularies/quick", {
    method: "POST",
    body: JSON.stringify({
      lemma: trimmed,
      language,
      ...(translationLanguage ? { translationLanguage } : {}),
    }),
  });

  if (!res.ok || !res.data) {
    if (res.status === 401) return { ok: false, error: SESSION_EXPIRED };
    return {
      ok: false,
      error: firstMessage(res.error) ?? "Could not start enrichment.",
    };
  }
  return { ok: true, data: res.data };
}

/** Poll a single-word job (`GET …/quick/:jobId`). */
export async function pollJobAction(
  jobId: string,
): Promise<DataResult<QuickJob>> {
  const res = await authedRequest<QuickJob>(
    `/v1/admin/vocabularies/quick/${jobId}`,
    { method: "GET" },
  );

  if (!res.ok || !res.data) {
    if (res.status === 401) return { ok: false, error: SESSION_EXPIRED };
    if (res.status === 404) return { ok: false, error: "This job no longer exists." };
    return { ok: false, error: firstMessage(res.error) ?? "Could not check the job." };
  }
  return { ok: true, data: res.data };
}

// ── Bulk import ──────────────────────────────────────────────────────────────

/**
 * Parse a pasted list or uploaded file into candidate lemmas
 * (`POST …/quick/extract`, multipart). No jobs are created — the admin confirms
 * the list before any enrichment runs.
 */
export async function extractCandidatesAction(
  formData: FormData,
): Promise<DataResult<ExtractResult>> {
  const file = formData.get("file");
  const text = String(formData.get("text") ?? "").trim();
  const mode = (String(formData.get("mode") ?? "list") as ExtractMode);
  const language = String(formData.get("language") ?? "en");

  const hasFile = file instanceof File && file.size > 0;
  if (!hasFile && !text) {
    return { ok: false, error: "Paste a list or choose a file first." };
  }
  if (hasFile && file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "That file is larger than 5 MB." };
  }

  const body = new FormData();
  if (hasFile) body.append("file", file);
  else body.append("text", text);
  body.append("mode", mode);
  body.append("language", language);

  const res = await authedRequest<ExtractResult>(
    "/v1/admin/vocabularies/quick/extract",
    { method: "POST", body },
  );

  if (!res.ok || !res.data) {
    if (res.status === 401) return { ok: false, error: SESSION_EXPIRED };
    if (res.status === 413) return { ok: false, error: "That file is larger than 5 MB." };
    return { ok: false, error: firstMessage(res.error) ?? "Could not read your words." };
  }
  return { ok: true, data: res.data };
}

/**
 * Enrich a confirmed list (`POST …/quick/bulk`). Topic slugs (if any) tag every
 * word the submission touches — including words skipped because they already
 * exist. An unknown topic slug fails the whole request with 400.
 */
export async function submitBulkAction(
  lemmas: string[],
  language = "en",
  topics: string[] = [],
): Promise<DataResult<BulkSubmitResult>> {
  const clean = lemmas.map((l) => l.trim()).filter(Boolean);
  if (clean.length === 0) return { ok: false, error: "Select at least one word." };
  if (clean.length > 500) {
    return { ok: false, error: "You can enrich at most 500 words per import." };
  }

  const res = await authedRequest<BulkSubmitResult>(
    "/v1/admin/vocabularies/quick/bulk",
    {
      method: "POST",
      body: JSON.stringify({
        lemmas: clean,
        language,
        ...(topics.length ? { topics } : {}),
      }),
    },
  );

  if (!res.ok || !res.data) {
    if (res.status === 401) return { ok: false, error: SESSION_EXPIRED };
    return { ok: false, error: firstMessage(res.error) ?? "Could not start the import." };
  }
  return { ok: true, data: res.data };
}

/** Poll a batch (`GET …/quick/batch/:batchId`). Drafts fill in gradually. */
export async function pollBatchAction(
  batchId: string,
): Promise<DataResult<BatchStatus>> {
  const res = await authedRequest<BatchStatus>(
    `/v1/admin/vocabularies/quick/batch/${batchId}`,
    { method: "GET" },
  );

  if (!res.ok || !res.data) {
    if (res.status === 401) return { ok: false, error: SESSION_EXPIRED };
    if (res.status === 404) return { ok: false, error: "This import no longer exists." };
    return { ok: false, error: firstMessage(res.error) ?? "Could not check the import." };
  }
  return { ok: true, data: res.data };
}

// ── Review actions (shared by both flows) ────────────────────────────────────

/**
 * Publish a draft (`POST /:id/approve`). Audio + per-sense images generate in
 * the background, so they're usually still missing in the response — the review
 * UI shows a "media pending" state. Idempotent.
 */
export async function approveDraftAction(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing draft id." };

  const res = await authedRequest(`/v1/admin/vocabularies/${id}/approve`, {
    method: "POST",
  });

  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: SESSION_EXPIRED };
    if (res.status === 404) return { ok: false, error: "This draft no longer exists." };
    return { ok: false, error: firstMessage(res.error) ?? "Could not approve the draft." };
  }

  revalidatePath(REVIEW_PATH);
  revalidatePath(LIST_PATH);
  return { ok: true };
}

/** Reject (hard-delete) a draft (`DELETE /:id`), then revalidate the queue. */
export async function rejectDraftAction(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing draft id." };

  const res = await authedRequest(`/v1/admin/vocabularies/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: SESSION_EXPIRED };
    return { ok: false, error: firstMessage(res.error) ?? "Could not reject the draft." };
  }

  revalidatePath(REVIEW_PATH);
  revalidatePath(LIST_PATH);
  return { ok: true };
}
