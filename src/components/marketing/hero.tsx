import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SampleQuestionCard } from "./sample-question-card";

/** Above-the-fold hero: value proposition, CTAs, and the product visual. */
export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
      <div className="flex flex-col items-start gap-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <SparklesIcon className="size-3.5" />
          Vocabulary, in context
        </span>

        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Learn words where they live — inside real sentences.
        </h1>

        <p className="max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
          Spaced repetition that adapts to what you actually remember. Six
          question formats, all built from real example sentences — not flashcards
          in a vacuum.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className={cn(buttonVariants(), "h-11 gap-2 px-6 text-base")}
          >
            Get started free
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 px-6 text-base",
            )}
          >
            I have an account
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Free to start · No credit card required
        </p>
      </div>

      <div className="flex justify-center lg:justify-end">
        <div className="w-full max-w-sm">
          <SampleQuestionCard />
        </div>
      </div>
    </section>
  );
}
