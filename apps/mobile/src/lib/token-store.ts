/**
 * Mobile implementation of the shared `TokenStore`, backed by Expo SecureStore
 * (Keychain / Keystore). This is the mobile counterpart to the web's httpOnly
 * cookie store — the refresh-on-401 algorithm in `@repo/shared` is identical;
 * only this storage differs.
 */
import * as SecureStore from "expo-secure-store";
import type { AuthResponse, TokenStore, UserResponse } from "@repo/shared";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "auth_user";

export const tokenStore: TokenStore = {
  getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },
  getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async saveSession(auth: AuthResponse) {
    await SecureStore.setItemAsync(ACCESS_KEY, auth.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, auth.refreshToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(auth.user));
  },
  async clearSession() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};

/** Read the persisted user, used to hydrate the session on app launch. */
export async function getStoredUser(): Promise<UserResponse | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}
