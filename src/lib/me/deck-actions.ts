"use server";

import { revalidatePath } from "next/cache";

import { authedRequest, firstMessage } from "@/lib/api";
import { createDeckSchema, visibilitySchema } from "@/lib/validations/deck";
import type { DeckDetail, DeckVisibility } from "./types";

/** `202` response from starting a bulk import. `batchId` is null when nothing was accepted. */
export interface BulkImportStart {
  batchId: string | null;
  accepted: number;
  skipped: number;
}

/** Live batch progress (`GET /v1/me/vocabularies/batches/:batchId`). */
export interface BulkBatch {
  batchId: string;
  total: number;
  pending: number;
  completed: number;
  failed: number;
  resultVocabularyIds: string[];
}

/**
 * Create a personal list (`POST /v1/me/decks`). Re-validates the form fields
 * and returns the new deck id on success so the caller can navigate into it.
 */
export async function createDeck(input: {
  name: string;
  description?: string;
  language: string;
  cefrLevel?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = createDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const res = await authedRequest<DeckDetail>("/v1/me/decks", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok || !res.data) {
    return { ok: false, error: firstMessage(res.error) ?? "Couldn't create that list." };
  }
  revalidatePath("/decks");
  return { ok: true, id: res.data.id };
}

/**
 * Publish / unpublish one of the caller's lists (`PATCH /v1/me/decks/:id`) by
 * flipping `visibility` between `public` and `private`. `system` is rejected by
 * the schema (never offered in the UI). Re-validates the list, its detail, and
 * the community grid so the new badge shows everywhere.
 */
export async function setDeckVisibility(
  id: string,
  visibility: DeckVisibility,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = visibilitySchema.safeParse(visibility);
  if (!parsed.success) {
    return { ok: false, error: "That visibility can't be set." };
  }

  const res = await authedRequest<DeckDetail>(`/v1/me/decks/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ visibility: parsed.data }),
  });

  if (!res.ok) {
    return { ok: false, error: firstMessage(res.error) ?? "Couldn't update sharing." };
  }
  revalidatePath("/decks");
  revalidatePath(`/decks/${id}`);
  revalidatePath("/community");
  return { ok: true };
}

/**
 * Clone a public/seeded list into the caller's own lists as a fresh private copy
 * (`POST /v1/me/decks/:id/clone`). Returns the new deck id on `201` so the client
 * can deep-link to it; surfaces `status` so the caller can branch `401 → login`
 * and `404 → "no longer available"`.
 */
export async function cloneDeck(
  id: string,
): Promise<{ ok: true; id: string } | { ok: false; status: number; error: string }> {
  const res = await authedRequest<DeckDetail>(`/v1/me/decks/${id}/clone`, {
    method: "POST",
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      status: res.status,
      error: firstMessage(res.error) ?? "Couldn't save that list.",
    };
  }
  revalidatePath("/decks");
  return { ok: true, id: res.data.id };
}

/** Hard-delete one of the caller's lists (`DELETE /v1/me/decks/:id`). */
export async function deleteDeck(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await authedRequest(`/v1/me/decks/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    return { ok: false, error: firstMessage(res.error) ?? "Couldn't delete that list." };
  }
  revalidatePath("/decks");
  return { ok: true };
}

/**
 * Start a bulk import of lemmas into a deck (`POST /v1/me/decks/:id/bulk-import`).
 * Returns the batch handle plus accepted/skipped counts; the words enrich
 * asynchronously and land in the deck as each job finishes.
 */
export async function startBulkImport(
  deckId: string,
  input: { lemmas: string[]; language?: string; translationLanguage?: string },
): Promise<{ ok: true; result: BulkImportStart } | { ok: false; error: string }> {
  const lemmas = input.lemmas.map((l) => l.trim()).filter(Boolean).slice(0, 500);
  if (lemmas.length === 0) {
    return { ok: false, error: "Add at least one word." };
  }

  const body: Record<string, unknown> = { lemmas };
  if (input.language) body.language = input.language;
  if (input.translationLanguage) body.translationLanguage = input.translationLanguage;

  const res = await authedRequest<BulkImportStart>(
    `/v1/me/decks/${deckId}/bulk-import`,
    { method: "POST", body: JSON.stringify(body) },
  );

  if (!res.ok || !res.data) {
    return { ok: false, error: firstMessage(res.error) ?? "Couldn't start the import." };
  }
  return { ok: true, result: res.data };
}

/** One poll of a bulk-import batch. The client repeats this until `pending === 0`. */
export async function pollBulkBatch(
  batchId: string,
): Promise<BulkBatch | null> {
  const res = await authedRequest<BulkBatch>(
    `/v1/me/vocabularies/batches/${batchId}`,
    { method: "GET" },
  );
  return res.ok && res.data ? res.data : null;
}

/** Revalidate a list detail after its words change (called by the import sheet). */
export async function revalidateDeck(id: string): Promise<void> {
  revalidatePath(`/decks/${id}`);
  revalidatePath("/decks");
  revalidatePath("/words");
}
