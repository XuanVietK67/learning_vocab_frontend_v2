/**
 * Session token storage. Tokens live in httpOnly cookies so they never reach
 * client JS. Importing `next/headers` makes this module server-only — pulling it
 * into a Client Component is a build error, which is the guard we want.
 *
 * Token lifetimes follow the backend contract (docs/api/frontend_handoff.md):
 * access token 15m, refresh token 30d (rotated on every /auth/refresh).
 */
import { cookies } from "next/headers";

import {
  ACCESS_MAX_AGE,
  ACCESS_TOKEN,
  baseCookie,
  REFRESH_MAX_AGE,
  REFRESH_TOKEN,
  USER_ID,
} from "./cookies";
import type { AuthResponse } from "./types";

/** Persist a full auth response (after login/register/refresh). */
export async function setSession(auth: AuthResponse): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_TOKEN, auth.accessToken, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_TOKEN, auth.refreshToken, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
  store.set(USER_ID, auth.user.id, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN);
  store.delete(REFRESH_TOKEN);
  store.delete(USER_ID);
}

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_TOKEN)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  return (await cookies()).get(REFRESH_TOKEN)?.value ?? null;
}

export async function getUserId(): Promise<string | null> {
  return (await cookies()).get(USER_ID)?.value ?? null;
}
