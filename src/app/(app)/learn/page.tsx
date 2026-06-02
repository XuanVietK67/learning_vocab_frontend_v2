import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCapIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Learn",
};

const MODE_LABELS: Record<string, string> = {
  daily: "Daily session",
  review: "Review session",
  topic: "Topic session",
  deck: "Deck session",
};

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const label = (mode && MODE_LABELS[mode]) ?? "Learning sessions";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-foreground">
        <GraduationCapIcon className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {label}
        </h1>
        <p className="text-muted-foreground">
          The learning experience is coming next — this is where your signed,
          context-anchored questions will appear.
        </p>
      </div>
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "outline" }), "h-10 px-5")}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
