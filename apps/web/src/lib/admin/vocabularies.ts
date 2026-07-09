/**
 * Render-safe reads for the admin vocabulary catalog (`/v1/admin/vocabularies`).
 * Same single-attempt, no-refresh contract as the other `/v1/me` reads (safe
 * during Server Component render). Mutations live in admin Server Actions, not
 * here — these are reads only.
 */
import { apiRequest } from "../api";
import { getAccessToken } from "../auth/session";
import type {
  AdminVocabulary,
  AdminVocabularyDetail,
  AdminVocabularyFilters,
  Paginated,
} from "./types";

const EMPTY_PAGE: Paginated<AdminVocabulary> = {
  data: [],
  page: 1,
  limit: 20,
  total: 0,
};

/** Serialize defined, non-empty filter values into a query string. */
function toQuery(filters: AdminVocabularyFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * List the full vocabularies table (system + user-created) with admin fields.
 * Returns an empty page when unauthenticated or on error so callers can render
 * a stable empty state instead of throwing.
 */
export async function listAdminVocabularies(
  filters: AdminVocabularyFilters = {},
): Promise<Paginated<AdminVocabulary>> {
  const token = await getAccessToken();
  if (!token) return EMPTY_PAGE;

  const path = `/v1/admin/vocabularies${toQuery(filters)}`;
  const res = await apiRequest<Paginated<AdminVocabulary>>(
    path,
    { method: "GET" },
    token,
  );
  return res.ok && res.data ? res.data : EMPTY_PAGE;
}

/**
 * Read a single vocabulary with its full sense tree for the detail editor via
 * the admin `GET /v1/admin/vocabularies/:id`. Unlike the public read, this
 * resolves unapproved quick-create drafts (`isApproved: false`), so the review
 * "Edit" link can open a draft before it's published. Only `source="system"`
 * rows are visible; returns `null` when unauthenticated, on 403/404, or any
 * error, so the page can 404. Render-safe (single attempt, no token refresh),
 * matching the list read above.
 */
export async function getVocabularyDetail(
  id: string,
  translationLang?: string,
): Promise<AdminVocabularyDetail | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const query = translationLang
    ? `?translationLang=${encodeURIComponent(translationLang)}`
    : "";
  const res = await apiRequest<AdminVocabularyDetail>(
    `/v1/admin/vocabularies/${id}${query}`,
    { method: "GET" },
    token,
  );
  return res.ok && res.data ? res.data : null;
}
