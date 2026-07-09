/**
 * Request-time silent refresh (Next.js 16 Proxy — the renamed Middleware).
 *
 * The render path can't rotate tokens: Server Components may read cookies but
 * not write them, so once the 15-minute access token lapses, render-safe reads
 * (getMe, getStats, …) would 401 and the layout guard would bounce a user with
 * a perfectly valid 30-day refresh token back to /login. Proxy is the one place
 * that runs *before* render and *can* set cookies, so we renew here: if the
 * access token is missing/expiring and a refresh token is present, exchange it
 * for a fresh pair, forward it to this same request, and persist it to the
 * browser. By the time the layout calls getMe(), the access token is fresh.
 *
 * Mutations keep their own safety net: authedRequest() still refreshes on a 401
 * (see src/lib/api.ts). This just covers the read/navigation path.
 *
 * Runtime: Proxy runs on the Node.js runtime in Next 16, so Buffer / fetch /
 * process.env are all available.
 */
import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_MAX_AGE,
  ACCESS_TOKEN,
  baseCookie,
  REFRESH_MAX_AGE,
  REFRESH_TOKEN,
  USER_ID,
} from "@/lib/auth/cookies";
import type { AuthResponse } from "@/lib/auth/types";
import { env } from "@/lib/env";

/** Refresh this many seconds before the access token actually expires (clock skew). */
const EXPIRY_SKEW_SECONDS = 30;

export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_TOKEN)?.value;

  // Access token still good — nothing to do.
  if (access && !isExpiringSoon(access)) {
    return NextResponse.next();
  }

  const refresh = request.cookies.get(REFRESH_TOKEN)?.value;

  // No refresh token: let the route's own guard decide (redirect to /login).
  if (!refresh) {
    return NextResponse.next();
  }

  // Never spend a single-use refresh token on a prefetch. Next prefetches
  // protected routes on hover/viewport; several can fire at once, and replaying
  // the same refresh token trips the backend's reuse detection, which revokes
  // every session for the user. Only real navigations refresh.
  if (isPrefetch(request)) {
    return NextResponse.next();
  }

  const pair = await refreshPair(refresh);

  // Refresh rejected (expired / already-rotated / reused) → session is dead.
  if (!pair) {
    return clearAndRedirect(request);
  }

  // Forward the rotated tokens to this same request so the layout's getMe()
  // reads the fresh access token, then persist them to the browser.
  request.cookies.set(ACCESS_TOKEN, pair.accessToken);
  request.cookies.set(REFRESH_TOKEN, pair.refreshToken);
  request.cookies.set(USER_ID, pair.user.id);

  const response = NextResponse.next({ request });
  response.cookies.set(ACCESS_TOKEN, pair.accessToken, {
    ...baseCookie,
    maxAge: ACCESS_MAX_AGE,
  });
  response.cookies.set(REFRESH_TOKEN, pair.refreshToken, {
    ...baseCookie,
    maxAge: REFRESH_MAX_AGE,
  });
  response.cookies.set(USER_ID, pair.user.id, {
    ...baseCookie,
    maxAge: REFRESH_MAX_AGE,
  });
  return response;
}

/** Exchange a refresh token for a new pair. `null` on any non-2xx or network error. */
async function refreshPair(refreshToken: string): Promise<AuthResponse | null> {
  try {
    const res = await fetch(`${env.API_BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthResponse;
  } catch {
    return null;
  }
}

/** Drop all session cookies and send the user to /login. */
function clearAndRedirect(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/login", request.nextUrl));
  for (const name of [ACCESS_TOKEN, REFRESH_TOKEN, USER_ID]) {
    response.cookies.set(name, "", { ...baseCookie, maxAge: 0 });
  }
  return response;
}

/** True when the access JWT is past (or within the skew window of) its `exp`. */
function isExpiringSoon(jwt: string): boolean {
  const exp = jwtExp(jwt);
  if (exp === null) return true; // unparseable → treat as expired and refresh
  return Date.now() >= (exp - EXPIRY_SKEW_SECONDS) * 1000;
}

/** Read `exp` (seconds) from a JWT payload without verifying — the backend verifies. */
function jwtExp(jwt: string): number | null {
  const payload = jwt.split(".")[1];
  if (!payload) return null;
  try {
    const json = Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

/** Next signals a prefetch with either of these headers; skip refresh for them. */
function isPrefetch(request: NextRequest): boolean {
  return (
    request.headers.get("next-router-prefetch") !== null ||
    request.headers.get("purpose") === "prefetch"
  );
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/onboarding/:path*",
    "/verify-email/:path*",
    "/admin/:path*",
  ],
};
