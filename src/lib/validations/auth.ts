/**
 * Zod schemas for the auth forms — the single source of truth for validation.
 * Shared between client hints and server-side re-validation inside the actions.
 * Rules mirror docs/frontend_handoff.md.
 */
import { z } from "zod";

const LANGUAGE_RE = /^[a-z]{2}(-[A-Z]{2})?$/; // ISO 639-1, optional region

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."),
});

export const verifyEmailSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const onboardingSchema = z.object({
  nativeLanguage: z.string().regex(LANGUAGE_RE, "Choose your native language."),
  targetLanguage: z.string().regex(LANGUAGE_RE, "Choose the language you're learning."),
  proficiencyLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  dailyGoalMinutes: z.number().int().min(5).max(240),
  weeklyVocabGoal: z.number().int().min(5).max(250),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

/**
 * Collapse a ZodError into `{ field: messages[] }`. Uses `error.issues`, which
 * is stable across Zod versions (avoids the deprecated `.flatten()`).
 */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
