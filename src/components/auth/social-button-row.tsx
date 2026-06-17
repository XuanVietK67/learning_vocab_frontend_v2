"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialButtonRowProps {
  /** Button label — "Continue with Google" (sign in) or "Sign up with Google". */
  label: string;
}

/**
 * Google sign-in — the loud, full-width primary CTA on the auth screens. UI only
 * for now: the click is stubbed until Google Identity Services is wired
 * (GIS ID token -> POST /v1/auth/google).
 */
export function SocialButtonRow({ label }: SocialButtonRowProps) {
  return (
    <Button
      type="button"
      onClick={() => {
        // TODO: integrate Google Identity Services / OAuth.
        toast.info(`${label} isn't wired up yet.`);
      }}
      className={cn(
        "h-13.5 w-full justify-center gap-3 rounded-full text-base font-bold",
        "shadow-(--sh-primary) hover:bg-(--primary-press) active:translate-y-px",
      )}
    >
      <span className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-white">
        <GoogleIcon />
      </span>
      {label}
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
