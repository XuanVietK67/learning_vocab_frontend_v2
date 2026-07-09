/**
 * Server-side environment configuration.
 *
 * `API_BASE_URL` points at the NestJS backend. All API calls are made from
 * Server Actions / Server Components, so this is intentionally not exposed to
 * the client (no `NEXT_PUBLIC_` prefix).
 */
export const env = {
  API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:3000",
} as const;
