/**
 * Shared config for My Words pagination. The page size isn't fixed — the client
 * measures how many rows fit the viewport and persists that in a cookie, which
 * the server reads to fetch exactly one screenful (see page.tsx + the measuring
 * effect in my-words-screen.tsx). Kept in one module so the server and client
 * clamp identically.
 */

/** Cookie holding the client-measured rows-per-page. */
export const PAGE_SIZE_COOKIE = "words_per_page";

/** Server's first guess before the client has measured (a typical laptop fit). */
export const DEFAULT_PAGE_SIZE = 12;
export const MIN_PAGE_SIZE = 4;
export const MAX_PAGE_SIZE = 50;

/** Clamp a (possibly bogus) measured/cookie value into the allowed range. */
export function clampPageSize(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.round(n)));
}
