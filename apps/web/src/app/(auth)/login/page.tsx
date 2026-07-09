import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" description="Sign in to continue learning.">
      <LoginForm />
      <p className="mt-5.5 text-center text-sm text-(--ink-2)">
        No account?{" "}
        <Link
          href="/register"
          className="font-bold text-(--primary-ink) hover:text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
