/**
 * Render-safe fetch of the current user. Uses a single authenticated attempt
 * (no refresh rotation) so it is safe to call during Server Component render,
 * where writing cookies is not allowed. Returns `null` when unauthenticated.
 *
 * Wrapped in React `cache()` so multiple callers within one request (e.g. the
 * `(app)` layout sidebar and the page body) share a single backend round-trip.
 */
import { cache } from "react";

import { apiRequest } from "../api";
import { getAccessToken } from "./session";
import type { UserResponse } from "./types";

export const getMe = cache(async (): Promise<UserResponse | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiRequest<UserResponse>("/v1/auth/me", { method: "GET" }, token);
  return res.ok ? res.data : null;
});
