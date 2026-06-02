/**
 * Chrome for authenticated pages: the persistent sidebar + a one-time auth
 * guard, shared by every route in the `(app)` group. `getMe()` is cached, so
 * pages can call it again for their own data without a second backend hit.
 */
import { redirect } from "next/navigation";

import { AppMobileBar, AppSidebar } from "@/components/app/app-nav";
import { VerifyEmailBanner } from "@/components/app/verify-email-banner";
import { getMe } from "@/lib/auth/me";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();
  if (!user) redirect("/login");
  if (!user.isOnboarded) redirect("/onboarding");

  return (
    <div className="flex flex-1">
      <AppSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppMobileBar user={user} />
        {!user.isEmailVerified && <VerifyEmailBanner />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
