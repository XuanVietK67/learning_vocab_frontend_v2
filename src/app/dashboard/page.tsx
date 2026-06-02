import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { BrandMark } from "@/components/brand-mark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMe } from "@/lib/auth/me";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getMe();
  if (!user) redirect("/login");
  if (!user.isOnboarded) redirect("/onboarding");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <BrandMark />
      <div className="w-full max-w-sm">
        <Card className="py-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Welcome back, {user.username}
            </CardTitle>
            <CardDescription>
              Your dashboard is coming soon. We&apos;re building your daily
              session, stats, and decks next.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={logoutAction}>
              <SubmitButton pendingLabel="Signing out…">Sign out</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
