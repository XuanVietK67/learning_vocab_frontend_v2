"use server";

import { redirect } from "next/navigation";

import { apiRequest, authedRequest, firstMessage } from "@/lib/api";
import { clearSession, getRefreshToken, getUserId, setSession } from "@/lib/auth/session";
import type { AuthResponse, UserResponse } from "@/lib/auth/types";
import type { FormState } from "@/lib/forms";
import {
  fieldErrorsFrom,
  loginSchema,
  onboardingSchema,
  type OnboardingInput,
  registerSchema,
  verifyEmailSchema,
} from "@/lib/validations/auth";

/** Where to send a user once authenticated, based on onboarding state. */
function homeFor(user: UserResponse): string {
  return user.isOnboarded ? "/" : "/onboarding";
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({
    email,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error), values: { email } };
  }

  const res = await apiRequest<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok || !res.data) {
    if (res.status === 401) {
      return { error: "Invalid email or password.", values: { email } };
    }
    if (res.status === 429) {
      return {
        error: "Too many attempts. Please wait a few minutes and try again.",
        values: { email },
      };
    }
    return {
      error: firstMessage(res.error) ?? "Something went wrong. Please try again.",
      values: { email },
    };
  }

  await setSession(res.data);
  redirect(homeFor(res.data.user));
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const username = String(formData.get("username") ?? "");
  const email = String(formData.get("email") ?? "");
  const parsed = registerSchema.safeParse({
    username,
    email,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error), values: { username, email } };
  }

  const res = await apiRequest<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok || !res.data) {
    if (res.status === 409) {
      return {
        error: "That email or username is already taken.",
        values: { username, email },
      };
    }
    return {
      error: firstMessage(res.error) ?? "Could not create your account.",
      values: { username, email },
    };
  }

  await setSession(res.data);
  redirect("/verify-email");
}

export interface SendVerificationResult {
  ok: boolean;
  message?: string;
  /** Seconds to wait before retrying (from a 429 cooldown). */
  retryAfter?: number;
}

export async function sendVerificationAction(): Promise<SendVerificationResult> {
  const res = await authedRequest<{ expiresAt: string }>(
    "/v1/auth/email/send-verification",
    { method: "POST" },
  );

  if (res.ok) return { ok: true };

  switch (res.status) {
    case 400:
      return { ok: false, message: "Your email is already verified." };
    case 401:
      return { ok: false, message: "Your session expired. Please sign in again." };
    case 429:
      return {
        ok: false,
        message: "Please wait before requesting another code.",
        retryAfter: Number(res.error?.retryAfter) || 60,
      };
    case 503:
      return { ok: false, message: "We couldn't send the email. Try again shortly." };
    default:
      return { ok: false, message: firstMessage(res.error) ?? "Could not send a code." };
  }
}

export async function verifyEmailAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = verifyEmailSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const res = await authedRequest<UserResponse>("/v1/auth/email/verify", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok || !res.data) {
    if (res.status === 401) {
      redirect("/login");
    }
    const remaining = res.error?.attemptsRemaining;
    const base = firstMessage(res.error) ?? "That code is not valid.";
    return {
      error:
        typeof remaining === "number"
          ? `${base} ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
          : base,
    };
  }

  redirect(homeFor(res.data));
}

export async function completeOnboardingAction(
  input: OnboardingInput,
): Promise<FormState> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const userId = await getUserId();
  if (!userId) redirect("/login");

  const res = await authedRequest<UserResponse>(`/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    return { error: firstMessage(res.error) ?? "Could not save your preferences." };
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await apiRequest("/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }
  await clearSession();
  redirect("/login");
}
