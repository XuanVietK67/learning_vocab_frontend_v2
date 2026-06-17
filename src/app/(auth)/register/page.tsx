import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start building your vocabulary today."
    >
      <RegisterForm />
      <p className="mt-5.5 text-center text-sm text-(--ink-2)">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-(--primary-ink) hover:text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
