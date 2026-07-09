"use client";

import { Loader2Icon } from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { googleAuthAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GIS_SRC = "https://accounts.google.com/gsi/client";
// `openid` makes Google return an id_token at code exchange; email/profile
// populate the user record. See docs/api/auth_google_sign_in.md.
const SCOPES = "openid email profile";

interface GoogleSignInButtonProps {
  /** Button label — "Continue with Google" (sign in) or "Sign up with Google". */
  label: string;
}

/**
 * Google sign-in via the GIS OAuth 2.0 authorization-code popup flow. Our own
 * mint button calls {@link GoogleCodeClient.requestCode} on click, opening
 * Google's popup; the returned authorization `code` is handed to a Server
 * Action which exchanges it for a session.
 *
 * We use the code flow (not GIS `renderButton`) so the button can be fully
 * styled — Google forbids restyling its rendered button, and hiding it under
 * an overlay is blocked by its anti-clickjacking checks on real origins.
 * See docs/api/auth_google_sign_in.md.
 */
export function GoogleSignInButton({ label }: GoogleSignInButtonProps) {
  const codeClientRef = useRef<GoogleCodeClient | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleCode = useCallback((code: string) => {
    startTransition(async () => {
      const result = await googleAuthAction(code);
      // On success the action redirects; we only get here on failure.
      if (result?.error) toast.error(result.error);
    });
  }, []);

  // Build the code client once GIS is ready; the button's onClick drives it.
  useEffect(() => {
    if (!CLIENT_ID || !scriptReady || !window.google) return;

    codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      ux_mode: "popup",
      callback: (response) => {
        if (response.code) handleCode(response.code);
        else toast.error("We couldn't sign you in with Google. Please try again.");
      },
      error_callback: (err) => {
        // A user closing the popup isn't an error worth surfacing.
        if (err.type === "popup_closed") return;
        toast.error("Google sign-in is unavailable right now.");
      },
    });
  }, [scriptReady, handleCode]);

  const signIn = useCallback(() => {
    codeClientRef.current?.requestCode();
  }, []);

  // No client ID configured: keep a working, non-broken button.
  if (!CLIENT_ID) {
    return (
      <MintGoogleButton
        label={label}
        onClick={() => toast.info("Google sign-in is not configured.")}
      />
    );
  }

  // Script failed to load: degrade to a clear message rather than a dead button.
  if (scriptError) {
    return (
      <MintGoogleButton
        label={label}
        onClick={() => toast.error("Google sign-in is unavailable right now.")}
      />
    );
  }

  return (
    <>
      <Script
        src={GIS_SRC}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setScriptError(true)}
      />
      <MintGoogleButton
        label={label}
        pending={pending}
        disabled={!scriptReady}
        onClick={signIn}
      />
    </>
  );
}

interface MintGoogleButtonProps {
  label: string;
  pending?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function MintGoogleButton({ label, pending, disabled, onClick }: MintGoogleButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={pending || disabled}
      className={cn(
        "h-13.5 w-full justify-center gap-3 rounded-full text-base font-bold shadow-(--sh-primary) hover:bg-(--primary-press) active:translate-y-px",
      )}
    >
      {pending ? (
        <>
          <Loader2Icon className="animate-spin" />
          Signing in…
        </>
      ) : (
        <>
          <span className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-white">
            <GoogleIcon />
          </span>
          {label}
        </>
      )}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}
