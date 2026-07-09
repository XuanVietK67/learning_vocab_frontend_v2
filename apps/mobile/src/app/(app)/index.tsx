import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@repo/shared";

import { useAuth } from "@/features/auth/auth-context";

/**
 * Placeholder authenticated home. This phase ships the working auth shell only;
 * the real feature screens (dashboard, words, learn, decks, …) are designed and
 * built in the next phase.
 */
export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.kicker}>Learning Vocabulary</Text>
        <Text style={styles.title}>You&apos;re signed in 🎉</Text>
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
        <Text style={styles.note}>
          The mobile shell is ready — shared auth, API client, and validation are
          wired up. Feature screens come next.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={logout}
        >
          <Text style={styles.buttonLabel}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, padding: 24, gap: 12, justifyContent: "center" },
  kicker: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: tokens.color.primary,
  },
  title: { fontSize: 28, fontWeight: "800", color: tokens.color.ink },
  email: { fontSize: 16, color: tokens.color.ink2 },
  note: { fontSize: 15, color: tokens.color.ink2, lineHeight: 22, marginTop: 4 },
  button: {
    marginTop: 16,
    backgroundColor: tokens.color.primarySoft,
    borderRadius: tokens.radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonPressed: { backgroundColor: tokens.color.primarySoft2 },
  buttonLabel: { color: tokens.color.primaryInk, fontSize: 16, fontWeight: "700" },
});
