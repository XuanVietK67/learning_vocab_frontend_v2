/**
 * Web binding of the shared HTTP client. The transport-agnostic core lives in
 * `@repo/shared`; here it is bound to the web base URL and a cookie-backed token
 * store. Importing `./auth/session` (→ `next/headers`) keeps this module
 * server-only — the guard we want. Call `authedRequest` only from Server Actions
 * / Route Handlers (it may write rotated tokens to cookies). For render-safe
 * authenticated reads use `apiRequest` with an explicit token.
 */
import {
  createApiRequest,
  createAuthedRequest,
  type TokenStore,
} from "@repo/shared";

import { env } from "./env";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
} from "./auth/session";

export { firstMessage } from "@repo/shared";
export type { ApiResult, ApiErrorBody } from "@repo/shared";

/** Unauthenticated calls (login, register, refresh); pass an explicit token for render-safe authed reads. */
export const apiRequest = createApiRequest(env.API_BASE_URL);

/** httpOnly cookie-backed token store (server-only via next/headers). */
const cookieStore: TokenStore = {
  getAccessToken,
  getRefreshToken,
  saveSession: setSession,
  clearSession,
};

export const authedRequest = createAuthedRequest(cookieStore, env.API_BASE_URL);
