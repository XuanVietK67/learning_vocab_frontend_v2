"use client";

import { useActionState } from "react";

import { registerAction } from "@/app/(auth)/actions";
import { FieldError } from "@/components/auth/field-error";
import { FormAlert } from "@/components/auth/form-alert";
import { AUTH_INPUT_CLASS } from "@/components/auth/input-style";
import { OrDivider } from "@/components/auth/or-divider";
import { PasswordField } from "@/components/auth/password-field";
import { SocialButtonRow } from "@/components/auth/social-button-row";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMPTY_FORM_STATE } from "@/lib/forms";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, EMPTY_FORM_STATE);
  const usernameErrors = state.fieldErrors?.username;
  const emailErrors = state.fieldErrors?.email;

  return (
    <div className="grid gap-5">
      <SocialButtonRow label="Sign up with Google" />

      <OrDivider />

      <form action={formAction} className="grid gap-4" noValidate>
        <FormAlert message={state.error} />

        <div className="grid gap-2">
          <Label htmlFor="username" className="text-[13px] font-semibold text-(--ink)">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
            defaultValue={state.values?.username}
            placeholder="alice_99"
            aria-invalid={Boolean(usernameErrors?.length)}
            aria-describedby={usernameErrors?.length ? "username-error" : undefined}
            className={AUTH_INPUT_CLASS}
          />
          <FieldError id="username-error" messages={usernameErrors} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-[13px] font-semibold text-(--ink)">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            placeholder="you@example.com"
            aria-invalid={Boolean(emailErrors?.length)}
            aria-describedby={emailErrors?.length ? "email-error" : undefined}
            className={AUTH_INPUT_CLASS}
          />
          <FieldError id="email-error" messages={emailErrors} />
        </div>

        <PasswordField
          name="password"
          label="Password"
          autoComplete="new-password"
          minLength={8}
          errors={state.fieldErrors?.password}
          placeholder="At least 8 characters"
        />

        <SubmitButton variant="secondary" pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>
    </div>
  );
}
