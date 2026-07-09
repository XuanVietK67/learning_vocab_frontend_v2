/**
 * Client-side auth session for mobile. Mirrors the web Server Actions
 * ([apps/web] src/app/(auth)/actions.ts) but runs on-device: it calls the same
 * backend endpoints through the shared HTTP client and persists tokens in
 * SecureStore. Navigation is handled by the route guard in the root layout.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { firstMessage, type AuthResponse, type UserResponse } from "@repo/shared";

import { apiRequest, authedRequest } from "@/lib/api";
import { getStoredUser, tokenStore } from "@/lib/token-store";

export type AuthStatus = "loading" | "authed" | "guest";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: UserResponse | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<ActionResult>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<ActionResult>;
  verifyEmail: (code: string) => Promise<ActionResult>;
  sendVerification: () => Promise<ActionResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const [token, stored] = await Promise.all([
        tokenStore.getAccessToken(),
        getStoredUser(),
      ]);
      if (!active) return;
      if (token && stored) {
        setUser(stored);
        setStatus("authed");
      } else {
        setStatus("guest");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function persist(auth: AuthResponse) {
    await tokenStore.saveSession(auth);
    setUser(auth.user);
    setStatus("authed");
  }

  async function login(email: string, password: string): Promise<ActionResult> {
    const res = await apiRequest<AuthResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok || !res.data) {
      if (res.status === 401) return { ok: false, error: "Invalid email or password." };
      if (res.status === 429)
        return { ok: false, error: "Too many attempts. Please wait and try again." };
      return { ok: false, error: firstMessage(res.error) ?? "Something went wrong." };
    }
    await persist(res.data);
    return { ok: true };
  }

  async function register(
    username: string,
    email: string,
    password: string,
  ): Promise<ActionResult> {
    const res = await apiRequest<AuthResponse>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok || !res.data) {
      if (res.status === 409)
        return { ok: false, error: "That email or username is already taken." };
      return { ok: false, error: firstMessage(res.error) ?? "Could not create your account." };
    }
    await persist(res.data);
    return { ok: true };
  }

  async function sendVerification(): Promise<ActionResult> {
    const res = await authedRequest<{ expiresAt: string }>(
      "/v1/auth/email/send-verification",
      { method: "POST" },
    );
    if (res.ok) return { ok: true };
    if (res.status === 429)
      return { ok: false, error: "Please wait before requesting another code." };
    return { ok: false, error: firstMessage(res.error) ?? "Could not send a code." };
  }

  async function verifyEmail(code: string): Promise<ActionResult> {
    const res = await authedRequest<UserResponse>("/v1/auth/email/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    if (!res.ok || !res.data) {
      return { ok: false, error: firstMessage(res.error) ?? "That code is not valid." };
    }
    await tokenStore.saveSession({
      accessToken: (await tokenStore.getAccessToken()) ?? "",
      refreshToken: (await tokenStore.getRefreshToken()) ?? "",
      user: res.data,
    });
    setUser(res.data);
    setStatus("authed");
    return { ok: true };
  }

  async function logout(): Promise<void> {
    const refreshToken = await tokenStore.getRefreshToken();
    if (refreshToken) {
      await apiRequest("/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    }
    await tokenStore.clearSession();
    setUser(null);
    setStatus("guest");
  }

  const value: AuthContextValue = {
    user,
    status,
    login,
    register,
    verifyEmail,
    sendVerification,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
