import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Landing } from "@/components/marketing/landing";
import { getMe } from "@/lib/auth/me";

export const metadata: Metadata = {
  title: { absolute: "Vocab — Learn vocabulary in context" },
};

export default async function Home() {
  const user = await getMe();

  // Authenticated users never see the marketing page.
  // NOTE: getMe() is render-safe and does NOT refresh an expired access token,
  // so a logged-in user whose 15m token has lapsed may briefly see the landing
  // until their next action refreshes it. Middleware-based refresh is separate.
  if (user) {
    redirect(user.isOnboarded ? "/dashboard" : "/onboarding");
  }

  return <Landing />;
}
