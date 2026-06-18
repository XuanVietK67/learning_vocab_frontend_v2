/**
 * Minimal ambient types for the Google Identity Services (GIS) web SDK loaded
 * from https://accounts.google.com/gsi/client. Covers only the ID-token
 * ("credential") flow we use for sign-in. See docs/api/auth_google_sign_in.md.
 */

interface GoogleCredentialResponse {
  /** The Google ID token (JWT) to POST to /v1/auth/google. */
  credential: string;
  select_by?: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  use_fedcm_for_prompt?: boolean;
}

interface GoogleButtonOptions {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  logo_alignment?: "left" | "center";
}

/** One Tap "moment" notification — exposes why the prompt was/wasn't shown. */
interface GooglePromptNotification {
  getMomentType: () => "display" | "skipped" | "dismissed";
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () =>
    | "browser_not_supported"
    | "invalid_client"
    | "missing_client_id"
    | "opt_out_or_no_session"
    | "secure_http_required"
    | "suppressed_by_user"
    | "unregistered_origin"
    | "unknown_reason";
  isSkippedMoment: () => boolean;
  getSkippedReason: () =>
    | "auto_cancel"
    | "user_cancel"
    | "tap_outside"
    | "issuing_failed";
  isDismissedMoment: () => boolean;
  getDismissedReason: () =>
    | "credential_returned"
    | "cancel_called"
    | "flow_restarted";
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
  prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
  cancel: () => void;
}

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsId;
    };
  };
}
