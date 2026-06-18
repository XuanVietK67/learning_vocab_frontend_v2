/**
 * Minimal ambient types for the Google Identity Services (GIS) web SDK loaded
 * from https://accounts.google.com/gsi/client. Covers only the OAuth 2.0
 * authorization-code ("popup") flow we use for sign-in: our own button calls
 * `requestCode()`, Google returns an auth `code`, and the backend exchanges it.
 * See docs/api/auth_google_sign_in.md.
 */

/** Success payload delivered to the code client's `callback`. */
interface GoogleCodeResponse {
  /** The authorization code to POST to /v1/auth/google for exchange. */
  code: string;
  scope: string;
  authuser?: string;
  prompt?: string;
}

/** Failure payload delivered to the code client's `error_callback`. */
interface GoogleOAuthError {
  /** e.g. "popup_closed", "popup_failed_to_open", "unknown". */
  type: string;
  message?: string;
}

interface GoogleCodeClientConfig {
  client_id: string;
  /** Space-delimited scopes; include `openid` so the exchange yields an id_token. */
  scope: string;
  ux_mode?: "popup" | "redirect";
  callback: (response: GoogleCodeResponse) => void;
  error_callback?: (error: GoogleOAuthError) => void;
  /** Only for ux_mode "redirect". */
  redirect_uri?: string;
  state?: string;
}

interface GoogleCodeClient {
  requestCode: () => void;
}

interface GoogleAccountsOauth2 {
  initCodeClient: (config: GoogleCodeClientConfig) => GoogleCodeClient;
}

interface Window {
  google?: {
    accounts: {
      oauth2: GoogleAccountsOauth2;
    };
  };
}
