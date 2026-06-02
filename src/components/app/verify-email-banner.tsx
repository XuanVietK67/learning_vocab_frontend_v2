import Link from "next/link";
import { ArrowRightIcon, MailIcon } from "lucide-react";

/** Non-blocking nudge shown across authed pages until the email is verified. */
export function VerifyEmailBanner() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/50 px-4 py-2.5 sm:px-6">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <MailIcon className="size-4 shrink-0" />
        <span>Verify your email to secure your account.</span>
      </span>
      <Link
        href="/verify-email"
        className="flex shrink-0 items-center gap-1 text-sm font-medium text-foreground hover:underline"
      >
        Verify
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
