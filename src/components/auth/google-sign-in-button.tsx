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

// TEMP debug instrumentation for the Google sign-in failure on prod.
// Remove this (and the [GAUTH] logs below) once the cause is found.
const DEBUG_AUTH = true;
function glog(...args: unknown[]) {
  // console.warn so the line shows even under a restrictive console level filter.
  if (DEBUG_AUTH) console.warn("[GAUTH]", ...args);
}

interface GoogleSignInButtonProps {
  /** Button label — "Continue with Google" (sign in) or "Sign up with Google". */
  label: string;
}

/**
 * Google sign-in via Google Identity Services. The mint pill is the visual; the
 * real GIS button is rendered transparently on top (`.auth-google-overlay`) so
 * the official SDK handles the click and yields the ID token, which a Server
 * Action exchanges for a session. See docs/api/auth_google_sign_in.md.
 */
export function GoogleSignInButton({ label }: GoogleSignInButtonProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleCredential = useCallback((credential: string) => {
    glog("credential received, len:", credential.length);
    startTransition(async () => {
      const result = await googleAuthAction(credential);
      glog("action result:", result ?? "redirected (success)");
      // On success the action redirects; we only get here on failure.
      if (result?.error) toast.error(result.error);
    });
  }, []);

  useEffect(() => {
    glog("effect run", {
      hasClientId: Boolean(CLIENT_ID),
      clientId: CLIENT_ID,
      origin: typeof window !== "undefined" ? window.location.origin : "(ssr)",
      href: typeof window !== "undefined" ? window.location.href : "(ssr)",
      scriptReady,
      hasWindowGoogle: typeof window !== "undefined" && Boolean(window.google),
      hasOverlay: Boolean(overlayRef.current),
    });

    if (!CLIENT_ID || !scriptReady || !window.google || !overlayRef.current) {
      glog("effect bailed — a precondition is false (see flags above)");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: ({ credential }) => {
          glog("GIS callback fired, credential present:", Boolean(credential));
          if (credential) handleCredential(credential);
        },
        // TEMP: FedCM off so prompt() can report a machine-readable reason below.
        use_fedcm_for_prompt: false,
      });
      glog("initialize() ok");
    } catch (err) {
      glog("initialize() THREW:", err);
    }

    // Clear any prior render (e.g. navigating login <-> register) before redrawing.
    overlayRef.current.replaceChildren();
    try {
      window.google.accounts.id.renderButton(overlayRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: label.startsWith("Sign up") ? "signup_with" : "continue_with",
        width: 400,
      });
      glog("renderButton() ok");
    } catch (err) {
      glog("renderButton() THREW:", err);
    }

    // TEMP probe: ask GIS to show One Tap and report WHY it would/wouldn't.
    // This shares the same client-id/origin validation as the button click, so
    // its reason (e.g. "unregistered_origin", "invalid_client") explains the
    // button's silent failure too.
    try {
      window.google.accounts.id.prompt((n) => {
        const detail: Record<string, unknown> = { moment: n.getMomentType() };
        if (n.isNotDisplayed()) detail.notDisplayedReason = n.getNotDisplayedReason();
        if (n.isSkippedMoment()) detail.skippedReason = n.getSkippedReason();
        if (n.isDismissedMoment()) detail.dismissedReason = n.getDismissedReason();
        glog("prompt() moment:", detail);
      });
      glog("prompt() called");
    } catch (err) {
      glog("prompt() THREW:", err);
    }
  }, [scriptReady, handleCredential, label]);

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
        onReady={() => {
          glog("GIS script onReady");
          setScriptReady(true);
        }}
        onError={(e) => {
          glog("GIS script onError:", e);
          setScriptError(true);
        }}
      />
      <div className="relative rounded-full focus-within:ring-3 focus-within:ring-ring/50">
        <MintGoogleButton label={label} pending={pending} decorative />
        <div
          ref={overlayRef}
          className={cn("auth-google-overlay", pending && "pointer-events-none")}
        />
      </div>
    </>
  );
}

interface MintGoogleButtonProps {
  label: string;
  pending?: boolean;
  /** Render as a purely visual layer (the real control is the GIS overlay). */
  decorative?: boolean;
  onClick?: () => void;
}

function MintGoogleButton({ label, pending, decorative, onClick }: MintGoogleButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-hidden={decorative}
      tabIndex={decorative ? -1 : undefined}
      className={cn(
        "h-13.5 w-full justify-center gap-3 rounded-full text-base font-bold shadow-(--sh-primary) hover:bg-(--primary-press) active:translate-y-px",
        decorative && "pointer-events-none",
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
