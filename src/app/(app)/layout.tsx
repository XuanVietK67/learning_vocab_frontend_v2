/**
 * Chrome for authenticated pages: the persistent sidebar + a one-time auth
 * guard, shared by every route in the `(app)` group. `getMe()` is cached, so
 * pages can call it again for their own data without a second backend hit.
 *
 * The shell carries the Sprout brand: `.app-shell` (see globals.css) lifts the
 * mint tokens off `/learn` onto the whole authenticated user surface, and the
 * Jakarta + Newsreader fonts are loaded here so the serif display numbers and
 * `.lr-*` atoms render correctly. Admin keeps its own neutral theme.
 */
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { redirect } from "next/navigation";

import { AppMobileBar, AppSidebar } from "@/components/app/app-nav";
import { VerifyEmailBanner } from "@/components/app/verify-email-banner";
import { getMe } from "@/lib/auth/me";
import { cn } from "@/lib/utils";

/** Friendly geometric sans for all Sprout UI text (Vietnamese-capable). */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

/** Dictionary-feel serif for display moments: greeting, big counts, eyebrows. */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();
  if (!user) redirect("/login");
  if (!user.isOnboarded) redirect("/onboarding");

  return (
    <div
      className={cn(
        jakarta.variable,
        newsreader.variable,
        "app-shell flex flex-1",
      )}
    >
      <AppSidebar user={user} />
      <div className="app-field flex min-w-0 flex-1 flex-col">
        <AppMobileBar user={user} />
        {!user.isEmailVerified && <VerifyEmailBanner />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
