"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/(auth)/actions";
import { FieldError } from "@/components/auth/field-error";
import { FormAlert } from "@/components/auth/form-alert";
import { OrDivider } from "@/components/auth/or-divider";
import { PasswordField } from "@/components/auth/password-field";
import { SocialButtonRow } from "@/components/auth/social-button-row";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMPTY_FORM_STATE } from "@/lib/forms";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, EMPTY_FORM_STATE);
  const emailErrors = state.fieldErrors?.email;

  return (
    <div className="grid gap-4">
      <form action={formAction} className="grid gap-4" noValidate>
        <FormAlert message={state.error} />

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
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
            className="h-11"
          />
          <FieldError id="email-error" messages={emailErrors} />
        </div>

        <PasswordField
          name="password"
          label="Password"
          autoComplete="current-password"
          errors={state.fieldErrors?.password}
        />

        <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
      </form>

      <OrDivider />
      <SocialButtonRow />
    </div>
  );
}
