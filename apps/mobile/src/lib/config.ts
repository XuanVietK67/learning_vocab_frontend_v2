import Constants from "expo-constants";

/**
 * Backend base URL for the NestJS API. Set `EXPO_PUBLIC_API_BASE_URL` (or an
 * `extra.apiBaseUrl` in app config) for device/production builds; falls back to
 * localhost for simulator development.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "http://localhost:3000";
