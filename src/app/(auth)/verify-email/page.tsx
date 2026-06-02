import { redirect } from "next/navigation";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMe } from "@/lib/auth/me";

import { VerifyEmailForm } from "./verify-email-form";

export const metadata: Metadata = {
  title: "Verify your email",
};

export default async function VerifyEmailPage() {
  const user = await getMe();
  if (!user) redirect("/login");
  if (user.isEmailVerified) redirect(user.isOnboarded ? "/" : "/onboarding");

  return (
    <Card className="py-6">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Check your inbox</CardTitle>
        <CardDescription>
          We&apos;ll send a 6-digit code to{" "}
          <span className="font-medium text-foreground">{user.email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyEmailForm />
      </CardContent>
    </Card>
  );
}
