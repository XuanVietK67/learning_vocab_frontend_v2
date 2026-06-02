"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";

import { authedRequest, firstMessage } from "@/lib/api";
import {
  createVocabularySchema,
  vocabularyFieldsSchema,
} from "@/lib/validations/vocabulary";
import type { ActionResult } from "./types";

const LIST_PATH = "/admin/vocabularies";

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
