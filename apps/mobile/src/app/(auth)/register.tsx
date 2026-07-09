import { Link } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text } from "react-native";
import {
  fieldErrorsFrom,
  registerSchema,
  tokens,
  type RegisterInput,
} from "@repo/shared";

import { FormField } from "@/components/form-field";
import { AuthScreen, FormError, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-context";
import { applyFieldErrors } from "@/lib/form";

export default function RegisterScreen() {
  const { register } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    defaultValues: { username: "", email: "", password: "" },
  });
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setFormError(applyFieldErrors(fieldErrorsFrom(parsed.error), setError) ?? null);
      return;
    }
    setFormError(null);
    const res = await register(
      parsed.data.username,
      parsed.data.email,
      parsed.data.password,
    );
    if (!res.ok) setFormError(res.error ?? "Could not create your account.");
    // On success the route guard sends the user to verify-email.
  });

  return (
    <AuthScreen title="Create your account" subtitle="Start building your vocabulary.">
      <FormError message={formError} />
      <FormField
        control={control}
        name="username"
        label="Username"
        error={errors.username?.message}
        placeholder="yourname"
        autoCapitalize="none"
      />
      <FormField
        control={control}
        name="email"
        label="Email"
        error={errors.email?.message}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <FormField
        control={control}
        name="password"
        label="Password"
        error={errors.password?.message}
        placeholder="At least 8 characters"
        secureTextEntry
        autoComplete="new-password"
      />
      <PrimaryButton label="Create account" onPress={onSubmit} loading={isSubmitting} />
      <Link href="/login" asChild>
        <Pressable>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkStrong}>Sign in</Text>
          </Text>
        </Pressable>
      </Link>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  link: { textAlign: "center", color: tokens.color.ink2, fontSize: 15 },
  linkStrong: { color: tokens.color.primary, fontWeight: "700" },
});
