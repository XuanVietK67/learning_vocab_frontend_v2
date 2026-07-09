/**
 * Auth response shapes now live in `@repo/shared` (single source of truth,
 * shared with mobile). This re-export keeps the `@/lib/auth/types` import path
 * working across the web app.
 */
export type { Role, CefrLevel, UserResponse, AuthResponse } from "@repo/shared";
