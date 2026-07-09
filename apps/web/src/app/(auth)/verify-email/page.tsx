import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
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
    <AuthCard
      title="Check your inbox"
      description={
        <>
          We&apos;ll send a 6-digit code to{" "}
          <span className="font-bold text-(--primary-ink)">{user.email}</span>.
        </>
      }
    >
      <VerifyEmailForm />
    </AuthCard>
  );
}
