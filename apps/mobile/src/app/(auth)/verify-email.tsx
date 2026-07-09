import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text } from "react-native";
import {
  fieldErrorsFrom,
  tokens,
  verifyEmailSchema,
  type VerifyEmailInput,
} from "@repo/shared";

import { FormField } from "@/components/form-field";
import { AuthScreen, FormError, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-context";
import { applyFieldErrors } from "@/lib/form";

export default function VerifyEmailScreen() {
  const { user, verifyEmail, sendVerification, logout } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailInput>({ defaultValues: { code: "" } });
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    const parsed = verifyEmailSchema.safeParse(values);
    if (!parsed.success) {
      setFormError(applyFieldErrors(fieldErrorsFrom(parsed.error), setError) ?? null);
      return;
    }
    setFormError(null);
    const res = await verifyEmail(parsed.data.code);
    if (!res.ok) setFormError(res.error ?? "That code is not valid.");
    // On success the route guard sends the user into the app.
  });

  async function resend() {
    setInfo(null);
    setFormError(null);
    const res = await sendVerification();
    if (res.ok) setInfo("We sent a new code to your email.");
    else setFormError(res.error ?? "Could not send a code.");
  }

  return (
    <AuthScreen
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${user?.email ?? "your email"}.`}
    >
      <FormError message={formError} />
      {info ? <Text style={styles.info}>{info}</Text> : null}
      <FormField
        control={control}
        name="code"
        label="Verification code"
        error={errors.code?.message}
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
      />
      <PrimaryButton label="Verify" onPress={onSubmit} loading={isSubmitting} />
      <Pressable onPress={resend}>
        <Text style={styles.link}>
          Didn&apos;t get it? <Text style={styles.linkStrong}>Resend code</Text>
        </Text>
      </Pressable>
      <Pressable onPress={logout}>
        <Text style={styles.subtle}>Use a different account</Text>
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  info: { color: tokens.color.okInk, fontSize: 14 },
  link: { textAlign: "center", color: tokens.color.ink2, fontSize: 15 },
  linkStrong: { color: tokens.color.primary, fontWeight: "700" },
  subtle: { textAlign: "center", color: tokens.color.ink3, fontSize: 14 },
});
