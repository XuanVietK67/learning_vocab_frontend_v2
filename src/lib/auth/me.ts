/**
 * Render-safe fetch of the current user. Uses a single authenticated attempt
 * (no refresh rotation) so it is safe to call during Server Component render,
 * where writing cookies is not allowed. Returns `null` when unauthenticated.
 */
import { apiRequest } from "../api";
import { getAccessToken } from "./session";
import type { UserResponse } from "./types";

export async function getMe(): Promise<UserResponse | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiRequest<UserResponse>("/v1/auth/me", { method: "GET" }, token);
  return res.ok ? res.data : null;
}
