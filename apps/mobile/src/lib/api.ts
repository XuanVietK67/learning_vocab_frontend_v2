/**
 * Mobile binding of the shared HTTP client: the transport-agnostic core lives in
 * `@repo/shared`, bound here to the mobile base URL and the SecureStore-backed
 * token store.
 */
import { createApiRequest, createAuthedRequest } from "@repo/shared";

import { API_BASE_URL } from "./config";
import { tokenStore } from "./token-store";

/** Unauthenticated calls (login, register). */
export const apiRequest = createApiRequest(API_BASE_URL);

/** Authenticated calls with one-shot refresh-on-401, backed by SecureStore. */
export const authedRequest = createAuthedRequest(tokenStore, API_BASE_URL);
