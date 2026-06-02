"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";

import { authedRequest, firstMessage } from "@/lib/api";
import {
  bulkImportSchema,
  createVocabularySchema,
  exampleSchema,
  senseSchema,
  translationSchema,
  vocabularyFieldsSchema,
} from "@/lib/validations/vocabulary";
import type { ActionResult, BulkImportSummary, ImportResult } from "./types";

const LIST_PATH = "/admin/vocabularies";

/** Path of a single vocabulary's editor — the page to revalidate after edits. */
function editorPath(vocabularyId: string): string {
  return `${LIST_PATH}/${vocabularyId}`;
}

/** First Zod issue message, for surfacing a single inline error. */
function firstIssue(error: ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

/**
 * Create a system vocabulary with one seed sense, then jump to its editor.
 * `409` means the (language, lemma, partOfSpeech) natural key already exists.
 */
export async function createVocabularyAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = createVocabularySchema.safeParse({
    language: formData.get("language"),
    lemma: formData.get("lemma"),
    partOfSpeech: formData.get("partOfSpeech"),
    ipa: formData.get("ipa"),
    cefrLevel: formData.get("cefrLevel") || undefined,
    gloss: formData.get("gloss"),
    definition: formData.get("definition"),
    translationLang: formData.get("translationLang"),
    translation: formData.get("translation"),
    exampleSentence: formData.get("exampleSentence"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const v = parsed.data;
  const body = {
    language: v.language,
    lemma: v.lemma,
    partOfSpeech: v.partOfSpeech,
    ...(v.ipa ? { ipa: v.ipa } : {}),
    ...(v.cefrLevel ? { cefrLevel: v.cefrLevel } : {}),
    senses: [
      {
        ...(v.gloss ? { gloss: v.gloss } : {}),
        ...(v.definition ? { definition: v.definition } : {}),
        translations:
          v.translation && v.translationLang
            ? [{ language: v.translationLang, translation: v.translation }]
            : [],
        examples: v.exampleSentence ? [{ sentence: v.exampleSentence }] : [],
      },
    ],
  };

  const res = await authedRequest<{ id: string }>("/v1/admin/vocabularies", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.data) {
    if (res.status === 401) redirect("/login");
    if (res.status === 409) {
      return {
        ok: false,
        error: "A word with this language, lemma, and part of speech already exists.",
      };
    }
    return { ok: false, error: firstMessage(res.error) ?? "Could not create the word." };
  }

  revalidatePath(LIST_PATH);
  redirect(`${LIST_PATH}/${res.data.id}`);
}

/** Patch a vocabulary's top-level fields (`PATCH /v1/admin/vocabularies/:id`). */
export async function updateVocabularyFieldsAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing vocabulary id." };

  const parsed = vocabularyFieldsSchema.safeParse({
    language: formData.get("language"),
    lemma: formData.get("lemma"),
    partOfSpeech: formData.get("partOfSpeech"),
    ipa: formData.get("ipa"),
    cefrLevel: formData.get("cefrLevel") || undefined,
    frequencyRank: formData.get("frequencyRank") ?? "",
    audioUrl: formData.get("audioUrl"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const v = parsed.data;
  const body = {
    language: v.language,
    lemma: v.lemma,
    partOfSpeech: v.partOfSpeech,
    ipa: v.ipa ?? null,
    ...(v.cefrLevel ? { cefrLevel: v.cefrLevel } : {}),
    ...(v.frequencyRank !== undefined ? { frequencyRank: v.frequencyRank } : {}),
    audioUrl: v.audioUrl ?? null,
  };

  const res = await authedRequest(`/v1/admin/vocabularies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    return { ok: false, error: firstMessage(res.error) ?? "Could not save changes." };
  }

  revalidatePath(`${LIST_PATH}/${id}`);
  return { ok: true };
}

/** Replace the topic-link set for a vocabulary (`PUT /:id/topics`). */
export async function updateVocabularyTopicsAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing vocabulary id." };

  const slugs = formData.getAll("slugs").map(String);

  const res = await authedRequest(`/v1/admin/vocabularies/${id}/topics`, {
    method: "PUT",
    body: JSON.stringify({ slugs }),
  });

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    return { ok: false, error: firstMessage(res.error) ?? "Could not update topics." };
  }

  revalidatePath(`${LIST_PATH}/${id}`);
  return { ok: true };
}

/**
 * Hard-delete a vocabulary, then return to the list. Invoked from a plain
 * `<form action>` (list row or the editor header), so it takes only FormData.
 */
export async function deleteVocabularyAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const res = await authedRequest(`/v1/admin/vocabularies/${id}`, {
    method: "DELETE",
  });
  if (res.status === 401) redirect("/login");

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

/**
 * Idempotent bulk upsert from pasted/uploaded JSON
 * (`POST /v1/admin/vocabularies/bulk-import`). Accepts either a bare array of
 * items or a `{ items: [...] }` envelope. Returns the count summary on success.
 */
export async function bulkImportAction(
  _prev: ImportResult,
  formData: FormData,
): Promise<ImportResult> {
  const raw = String(formData.get("items") ?? "").trim();
  if (!raw) return { ok: false, error: "Paste JSON or upload a file first." };

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That isn't valid JSON." };
  }

  const payload = Array.isArray(json) ? { items: json } : json;
  const parsed = bulkImportSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(".")}: ` : "";
    return { ok: false, error: `${where}${issue?.message ?? "Invalid items."}` };
  }

  const res = await authedRequest<BulkImportSummary>(
    "/v1/admin/vocabularies/bulk-import",
    { method: "POST", body: JSON.stringify(parsed.data) },
  );

  if (!res.ok || !res.data) {
    if (res.status === 401) redirect("/login");
    return { ok: false, error: firstMessage(res.error) ?? "Import failed." };
  }

  revalidatePath(LIST_PATH);
  return { ok: true, summary: res.data };
}

// ── Senses ────────────────────────────────────────────────────────────────

/** Append a sense to a vocabulary (`POST /:id/senses`). */
export async function addSenseAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const vocabularyId = String(formData.get("vocabularyId") ?? "");
  if (!vocabularyId) return { ok: false, error: "Missing vocabulary id." };

  const parsed = senseSchema.safeParse({
    gloss: formData.get("gloss"),
    definition: formData.get("definition"),
    imageUrl: formData.get("imageUrl"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const v = parsed.data;
  const res = await authedRequest(
    `/v1/admin/vocabularies/${vocabularyId}/senses`,
    {
      method: "POST",
      body: JSON.stringify({
        ...(v.gloss ? { gloss: v.gloss } : {}),
        ...(v.definition ? { definition: v.definition } : {}),
        ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
      }),
    },
  );

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    return { ok: false, error: firstMessage(res.error) ?? "Could not add the sense." };
  }

  revalidatePath(editorPath(vocabularyId));
  return { ok: true };
}

/** Patch a sense's gloss / definition / imageUrl (`PATCH /:id/senses/:senseId`). */
export async function updateSenseAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const vocabularyId = String(formData.get("vocabularyId") ?? "");
  const senseId = String(formData.get("senseId") ?? "");
  if (!vocabularyId || !senseId) return { ok: false, error: "Missing ids." };

  const parsed = senseSchema.safeParse({
    gloss: formData.get("gloss"),
    definition: formData.get("definition"),
    imageUrl: formData.get("imageUrl"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const v = parsed.data;
  const res = await authedRequest(
    `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        gloss: v.gloss ?? null,
        definition: v.definition ?? null,
        imageUrl: v.imageUrl ?? null,
      }),
    },
  );

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    return { ok: false, error: firstMessage(res.error) ?? "Could not save the sense." };
  }

  revalidatePath(editorPath(vocabularyId));
  return { ok: true };
}

/** Delete a sense (`DELETE /:id/senses/:senseId`). Remaining senses recompact. */
export async function deleteSenseAction(formData: FormData): Promise<void> {
  const vocabularyId = String(formData.get("vocabularyId") ?? "");
  const senseId = String(formData.get("senseId") ?? "");
  if (!vocabularyId || !senseId) return;

  const res = await authedRequest(
    `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}`,
    { method: "DELETE" },
  );
  if (res.status === 401) redirect("/login");

  revalidatePath(editorPath(vocabularyId));
}

/** Reorder senses by posting the full permutation of ids (`PUT /:id/senses/reorder`). */
export async function reorderSensesAction(formData: FormData): Promise<void> {
  const vocabularyId = String(formData.get("vocabularyId") ?? "");
  const senseIds = formData.getAll("senseIds").map(String);
  if (!vocabularyId || senseIds.length === 0) return;

  const res = await authedRequest(
    `/v1/admin/vocabularies/${vocabularyId}/senses/reorder`,
    { method: "PUT", body: JSON.stringify({ senseIds }) },
  );
  if (res.status === 401) redirect("/login");

  revalidatePath(editorPath(vocabularyId));
}

// ── Translations ────────────────────────────────────────────────────────────

/** Add a translation to a sense (`POST …/translations`). */
export async function addTranslationAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const vocabularyId = String(formData.get("vocabularyId") ?? "");
  const senseId = String(formData.get("senseId") ?? "");
  if (!vocabularyId || !senseId) return { ok: false, error: "Missing ids." };

  const parsed = translationSchema.safeParse({
    language: formData.get("language"),
    translation: formData.get("translation"),
    note: formData.get("note"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const v = parsed.data;
  const res = await authedRequest(
    `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/translations`,
    {
      method: "POST",
      body: JSON.stringify({
        language: v.language,
        translation: v.translation,
        ...(v.note ? { note: v.note } : {}),
      }),
    },
  );

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    if (res.status === 409) {
      return { ok: false, error: "That translation already exists for this sense." };
    }
    return { ok: false, error: firstMessage(res.error) ?? "Could not add the translation." };
  }

  revalidatePath(editorPath(vocabularyId));
  return { ok: true };
}

/** Delete a translation (`DELETE …/translations/:translationId`). */
export async function deleteTranslationAction(formData: FormData): Promise<void> {
  const vocabularyId = String(formData.get("vocabularyId") ?? "");
  const senseId = String(formData.get("senseId") ?? "");
  const translationId = String(formData.get("translationId") ?? "");
  if (!vocabularyId || !senseId || !translationId) return;

  const res = await authedRequest(
    `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/translations/${translationId}`,
    { method: "DELETE" },
  );
  if (res.status === 401) redirect("/login");

  revalidatePath(editorPath(vocabularyId));
}

// ── Examples ────────────────────────────────────────────────────────────────

/** Add an example to a sense (`POST …/examples`). */
export async function addExampleAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const vocabularyId = String(formData.get("vocabularyId") ?? "");
  const senseId = String(formData.get("senseId") ?? "");
  if (!vocabularyId || !senseId) return { ok: false, error: "Missing ids." };

  const parsed = exampleSchema.safeParse({
    sentence: formData.get("sentence"),
    translation: formData.get("translation"),
    source: formData.get("source"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const v = parsed.data;
  const res = await authedRequest(
    `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/examples`,
    {
      method: "POST",
      body: JSON.stringify({
        sentence: v.sentence,
        ...(v.translation ? { translation: v.translation } : {}),
        ...(v.source ? { source: v.source } : {}),
      }),
    },
  );

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    return { ok: false, error: firstMessage(res.error) ?? "Could not add the example." };
  }

  revalidatePath(editorPath(vocabularyId));
  return { ok: true };
}

/** Delete an example (`DELETE …/examples/:exampleId`). */
export async function deleteExampleAction(formData: FormData): Promise<void> {
  const vocabularyId = String(formData.get("vocabularyId") ?? "");
  const senseId = String(formData.get("senseId") ?? "");
  const exampleId = String(formData.get("exampleId") ?? "");
  if (!vocabularyId || !senseId || !exampleId) return;

  const res = await authedRequest(
    `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/examples/${exampleId}`,
    { method: "DELETE" },
  );
  if (res.status === 401) redirect("/login");

  revalidatePath(editorPath(vocabularyId));
}
