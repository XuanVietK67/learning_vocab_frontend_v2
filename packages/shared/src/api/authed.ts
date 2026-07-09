/**
 * Authenticated request with one-shot refresh-on-401, parameterized by a token
 * store so the rotation algorithm lives once and each platform injects only its
 * storage: web = httpOnly cookies (`next/headers`), mobile = Expo SecureStore.
 */
import type { AuthResponse } from "../types/auth";
import { createApiRequest, type ApiResult } from "./client";

export interface TokenStore {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  /** Persist a full auth response (after login/register/refresh). */
  saveSession(auth: AuthResponse): Promise<void>;
  clearSession(): Promise<void>;
}

export type AuthedRequest = <T>(
  path: string,
  init?: RequestInit,
) => Promise<ApiResult<T>>;

/** Build an `authedRequest`: attaches the access token and, on 401, rotates the refresh token once and retries. */
export function createAuthedRequest(
  store: TokenStore,
  baseUrl: string,
): AuthedRequest {
  const apiRequest = createApiRequest(baseUrl);

  async function tryRefresh(): Promise<string | null> {
    const refreshToken = await store.getRefreshToken();
    if (!refreshToken) return null;

    const res = await apiRequest<AuthResponse>("/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok || !res.data) {
      await store.clearSession();
      return null;
    }
    await store.saveSession(res.data);
    return res.data.accessToken;
  }

  return async function authedRequest<T>(
    path: string,
    init?: RequestInit,
  ): Promise<ApiResult<T>> {
    const token = await store.getAccessToken();
    let res = await apiRequest<T>(path, init, token);

    if (res.status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        res = await apiRequest<T>(path, init, refreshed);
      }
    }
    return res;
  };
}
