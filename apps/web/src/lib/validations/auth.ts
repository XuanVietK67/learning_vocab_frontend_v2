/**
 * Auth Zod schemas now live in `@repo/shared` (single source of truth, shared
 * with mobile's react-hook-form resolver). This re-export keeps the
 * `@/lib/validations/auth` import path working across the web app.
 */
export {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  onboardingSchema,
  fieldErrorsFrom,
} from "@repo/shared";
export type {
  LoginInput,
  RegisterInput,
  VerifyEmailInput,
  OnboardingInput,
} from "@repo/shared";
