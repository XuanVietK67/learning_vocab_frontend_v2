import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { tokens } from "@repo/shared";

import { useAuth } from "@/features/auth/auth-context";
import { Providers } from "@/providers";

/**
 * Route guard: keeps the visible route in sync with auth state.
 *  - guest            → auth screens
 *  - authed, unverified → verify-email
 *  - authed, verified   → app
 */
function useAuthGuard() {
  const { status, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const inAuthGroup = segments[0] === "(auth)";
    const onVerify = segments[segments.length - 1] === "verify-email";

    if (status === "guest") {
      if (!inAuthGroup) router.replace("/login");
      return;
    }
    // authed
    if (user && !user.isEmailVerified) {
      if (!onVerify) router.replace("/verify-email");
      return;
    }
    if (inAuthGroup) router.replace("/");
  }, [status, user, segments, router]);
}

function RootNavigator() {
  useAuthGuard();
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={tokens.color.primary} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar style="dark" />
      <RootNavigator />
    </Providers>
  );
}

const styles = {
  splash: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#ffffff",
  },
};
