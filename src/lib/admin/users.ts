/**
 * Render-safe read of the admin user list. NOTE: this assumes a paginated
 * `GET /v1/admin/users` ({ data: UserResponse[], page, limit, total }) following
 * the same convention as the other admin lists. That route is not in the
 * documented contract yet (only `DELETE /:id` is) — until the backend serves
 * it, this returns an empty page and the table renders its empty state.
 */
import { apiRequest } from "../api";
import { getAccessToken } from "../auth/session";
import type { UserResponse } from "../auth/types";
import type { Paginated } from "./types";

const EMPTY_PAGE: Paginated<UserResponse> = {
  data: [],
  page: 1,
  limit: 20,
  total: 0,
};

export async function listAdminUsers(
  params: { page?: number; limit?: number } = {},
): Promise<Paginated<UserResponse>> {
  const token = await getAccessToken();
  if (!token) return EMPTY_PAGE;

  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString() ? `?${qs}` : "";

  const res = await apiRequest<Paginated<UserResponse>>(
    `/v1/admin/users${query}`,
    { method: "GET" },
    token,
  );
  return res.ok && res.data ? res.data : EMPTY_PAGE;
}
