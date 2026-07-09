import { type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@repo/shared";

/** Consistent chrome for the auth screens: header + keyboard-aware form area. */
export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.kicker}>Learning Vocabulary</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.form}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={tokens.color.primaryForeground} />
      ) : (
        <Text style={styles.buttonLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.formError}>
      <Text style={styles.formErrorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  flex: { flex: 1 },
  scroll: { padding: 24, gap: 16, flexGrow: 1, justifyContent: "center" },
  kicker: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: tokens.color.primary,
  },
  title: { fontSize: 28, fontWeight: "800", color: tokens.color.ink },
  subtitle: { fontSize: 15, color: tokens.color.ink2, lineHeight: 21 },
  form: { gap: 14, marginTop: 8 },
  button: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.lg,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonPressed: { backgroundColor: tokens.color.primaryPress },
  buttonLabel: {
    color: tokens.color.primaryForeground,
    fontSize: 16,
    fontWeight: "700",
  },
  formError: {
    backgroundColor: tokens.color.badSoft,
    borderRadius: tokens.radius.md,
    padding: 12,
  },
  formErrorText: { color: tokens.color.badInk, fontSize: 14 },
});
