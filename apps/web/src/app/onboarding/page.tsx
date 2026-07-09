import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getAccessToken } from "@/lib/auth/session";

import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = {
  title: "Set up your profile",
};

export default async function OnboardingPage() {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <OnboardingWizard />
      </div>
    </main>
  );
}
