"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";

import { authedRequest, firstMessage } from "@/lib/api";
import { deleteUserSchema } from "@/lib/validations/user";
import type { ActionResult } from "./types";

const USERS_PATH = "/admin/users";

/** First Zod issue message, for surfacing a single inline error. */
function firstIssue(error: ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

/**
 * Hard-delete a non-admin user by id (`DELETE /v1/admin/users/:id`). The backend
 * refuses to delete admin accounts (`403`) and 404s on unknown ids.
 */
export async function deleteUserAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = deleteUserSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const res = await authedRequest(`/v1/admin/users/${parsed.data.id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    if (res.status === 403) {
      return {
        ok: false,
        error: firstMessage(res.error) ?? "Admin accounts can't be deleted.",
      };
    }
    if (res.status === 404) {
      return { ok: false, error: "No user found with that ID." };
    }
    return { ok: false, error: firstMessage(res.error) ?? "Could not delete the user." };
  }

  revalidatePath(USERS_PATH);
  return { ok: true };
}
