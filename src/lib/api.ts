/**
 * Server-side HTTP client for the NestJS backend.
 *
 * `next/headers` (via ./auth/session) makes this module server-only. Two entry
 * points:
 *   - `apiRequest`  — unauthenticated calls (login, register, refresh).
 *   - `authedRequest` — attaches the access token and, on 401, transparently
 *     rotates the refresh token once and retries. Only safe to call from a
 *     Server Action or Route Handler (it writes cookies). For render-safe
 *     authenticated reads use `apiRequest` with an explicit token.
 */
import { env } from "./env";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
} from "./auth/session";
import type { AuthResponse } from "./auth/types";

/** Standard Nest error body — `message` is a string or an array of strings. */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  [key: string]: unknown;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: ApiErrorBody | null;
}

/** First human-readable message from a Nest error body. */
export function firstMessage(error: ApiErrorBody | null): string | null {
  if (!error) return null;
  const { message } = error;
  if (Array.isArray(message)) return message[0] ?? null;
  return typeof message === "string" ? message : null;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  token?: string | null,
): Promise<ApiResult<T>> {
  const res = await fetch(`${env.API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = await parseBody(res);

  if (res.ok) {
    return { ok: true, status: res.status, data: body as T, error: null };
  }
  return {
    ok: false,
    status: res.status,
    data: null,
    error: toErrorBody(body, res.status),
  };
}

/**
 * Authenticated request with one-shot refresh-on-401. Call only from Server
 * Actions / Route Handlers — it may write rotated tokens to cookies.
 */
export async function authedRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const token = await getAccessToken();
  let res = await apiRequest<T>(path, init, token);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await apiRequest<T>(path, init, refreshed);
    }
  }
  return res;
}

/** Exchange the stored refresh token for a fresh pair; returns the new access token. */
async function tryRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const res = await apiRequest<AuthResponse>("/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok || !res.data) {
    await clearSession();
    return null;
  }
  await setSession(res.data);
  return res.data.accessToken;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toErrorBody(body: unknown, status: number): ApiErrorBody {
  if (body && typeof body === "object") {
    return body as ApiErrorBody;
  }
  return { statusCode: status, message: typeof body === "string" ? body : "Request failed" };
}
