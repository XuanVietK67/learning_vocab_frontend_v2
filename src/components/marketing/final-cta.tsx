import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Closing conversion band. */
export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-foreground px-6 py-14 text-center text-background sm:px-12">
        <h2 className="font-heading max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Start learning in two minutes
        </h2>
        <p className="max-w-md text-lg text-background/70 text-pretty">
          Create a free account, pick your languages, and answer your first
          question today.
        </p>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 gap-2 border-transparent bg-background px-6 text-base text-foreground hover:bg-background/90",
          )}
        >
          Create free account
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </section>
  );
}
