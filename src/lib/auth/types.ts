/**
 * Shapes returned by the `/v1/auth` surface. Mirrors docs/api/frontend_handoff.md —
 * keep in sync when the backend contract changes.
 */

export type Role = "user" | "admin";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: Role;
  isEmailVerified: boolean;
  isActive: boolean;
  isOnboarded: boolean;
  nativeLanguage: string | null;
  targetLanguage: string | null;
  proficiencyLevel: CefrLevel | null;
  dailyGoalMinutes: number | null;
  weeklyVocabGoal: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Shared response shape for register / login / refresh / oauth endpoints. */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
