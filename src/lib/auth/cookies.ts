/**
 * Cookie names, lifetimes, and shared options for the auth session.
 *
 * Split out from session.ts so the two writers of these cookies — the
 * Server-Action helpers in session.ts (`next/headers`) and the request-time
 * refresh in proxy.ts (Node runtime, `NextResponse` cookies) — share one
 * source of truth for names and max-ages. Deliberately free of any
 * `next/headers` import so it is safe to pull into proxy.ts.
 *
 * Lifetimes follow the backend contract (docs/auth_session_tokens.md):
 * access token 15m, refresh token 30d (rotated on every /auth/refresh).
 */
export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";
export const USER_ID = "user_id";

export const ACCESS_MAX_AGE = 60 * 15; // 15 minutes — matches JWT_ACCESS_EXPIRES_IN
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — matches JWT_REFRESH_EXPIRES_IN

/** Shared flags for every auth cookie. `secure` only in prod (localhost is http). */
export const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;
