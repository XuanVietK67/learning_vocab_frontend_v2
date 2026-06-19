"use server";

import { revalidatePath } from "next/cache";

import { authedRequest, firstMessage } from "@/lib/api";
import { getUserId } from "@/lib/auth/session";
import type { UserResponse } from "@/lib/auth/types";

/**
 * Toggle the caller's leaderboard visibility (`PATCH /v1/users/:id`, field
 * `leaderboardOptOut`). `optOut = true` hides them from every board. Mirrors
 * `completeOnboardingAction`'s user-patch shape. Revalidates the surfaces that
 * read the flag so the change shows immediately.
 */
export async function setLeaderboardOptOut(
  optOut: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Please sign in again." };

  const res = await authedRequest<UserResponse>(`/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ leaderboardOptOut: optOut }),
  });

  if (!res.ok) {
    return {
      ok: false,
      error: firstMessage(res.error) ?? "Couldn't update your visibility.",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  return { ok: true };
}
