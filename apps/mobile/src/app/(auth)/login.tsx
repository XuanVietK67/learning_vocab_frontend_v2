import { Link } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text } from "react-native";
import {
  fieldErrorsFrom,
  loginSchema,
  tokens,
  type LoginInput,
} from "@repo/shared";

import { FormField } from "@/components/form-field";
import { AuthScreen, FormError, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-context";
import { applyFieldErrors } from "@/lib/form";

export default function LoginScreen() {
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ defaultValues: { email: "", password: "" } });
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    // Same Zod schema the web uses — single source of truth in @repo/shared.
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setFormError(applyFieldErrors(fieldErrorsFrom(parsed.error), setError) ?? null);
      return;
    }
    setFormError(null);
    const res = await login(parsed.data.email, parsed.data.password);
    if (!res.ok) setFormError(res.error ?? "Login failed.");
    // On success the route guard navigates away.
  });

  return (
    <AuthScreen title="Welcome back" subtitle="Sign in to keep learning.">
      <FormError message={formError} />
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
        placeholder="••••••••"
        secureTextEntry
        autoComplete="password"
      />
      <PrimaryButton label="Sign in" onPress={onSubmit} loading={isSubmitting} />
      <Link href="/register" asChild>
        <Pressable>
          <Text style={styles.link}>
            New here? <Text style={styles.linkStrong}>Create an account</Text>
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
