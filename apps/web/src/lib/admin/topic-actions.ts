"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";

import { authedRequest, firstMessage } from "@/lib/api";
import {
  createTopicSchema,
  updateTopicSchema,
} from "@/lib/validations/topic";
import type { ActionResult } from "./types";

const TOPICS_PATH = "/admin/topics";

/** First Zod issue message, for surfacing a single inline error. */
function firstIssue(error: ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

/** Create a topic (`POST /v1/admin/topics`). `409` means the slug is taken. */
export async function createTopicAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = createTopicSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    iconUrl: formData.get("iconUrl"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const v = parsed.data;
  const res = await authedRequest("/v1/admin/topics", {
    method: "POST",
    body: JSON.stringify({
      slug: v.slug,
      name: v.name,
      description: v.description ?? null,
      iconUrl: v.iconUrl ?? null,
    }),
  });

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    if (res.status === 409) {
      return { ok: false, error: `The slug "${v.slug}" is already in use.` };
    }
    return { ok: false, error: firstMessage(res.error) ?? "Could not create the topic." };
  }

  revalidatePath(TOPICS_PATH);
  redirect(TOPICS_PATH);
}

/** Patch a topic's name / description / iconUrl (`PATCH /v1/admin/topics/:slug`). */
export async function updateTopicAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return { ok: false, error: "Missing topic slug." };

  const parsed = updateTopicSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    iconUrl: formData.get("iconUrl"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const v = parsed.data;
  const res = await authedRequest(`/v1/admin/topics/${slug}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: v.name,
      description: v.description ?? null,
      iconUrl: v.iconUrl ?? null,
    }),
  });

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    return { ok: false, error: firstMessage(res.error) ?? "Could not save the topic." };
  }

  revalidatePath(TOPICS_PATH);
  return { ok: true };
}

/** Delete a topic (`DELETE /v1/admin/topics/:slug`). Vocabularies keep other tags. */
export async function deleteTopicAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  const res = await authedRequest(`/v1/admin/topics/${slug}`, {
    method: "DELETE",
  });
  if (res.status === 401) redirect("/login");

  revalidatePath(TOPICS_PATH);
}
