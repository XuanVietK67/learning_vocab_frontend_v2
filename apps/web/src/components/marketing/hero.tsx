import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

import { SampleQuestionCard } from "./sample-question-card";

/** Above-the-fold hero: value proposition, CTAs, and the product visual. */
export function Hero() {
  return (
    <section className="hero-band relative overflow-hidden">
      {/* decorative floating ornaments — purely atmospheric, never content */}
      <div
        aria-hidden
        className="lr-float pointer-events-none absolute -top-24 -left-16 size-80 rounded-full blur-[14px]"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(18,189,138,0.32), transparent 68%)",
        }}
      />
      <div
        aria-hidden
        className="lr-float pointer-events-none absolute -right-10 -bottom-28 size-72 rounded-full blur-[14px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(31,159,209,0.26), transparent 68%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-24">
        <div className="mk-reveal flex flex-col items-start">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-(--primary-soft) px-3.5 py-1.5 text-xs font-bold tracking-wide text-(--primary-ink) uppercase">
            <SparklesIcon className="size-3.5" />
            Vocabulary, in context
          </span>

          <h1 className="mb-5 font-(family-name:--serif) text-4xl leading-[1.05] font-medium tracking-tight text-balance text-(--ink) sm:text-5xl lg:text-6xl">
            Learn words <span className="text-(--primary) italic">in context</span>
            , and actually remember them.
          </h1>

          <p className="mb-8 max-w-lg text-lg leading-relaxed text-(--ink-2)">
            Vocab teaches vocabulary inside real sentences with native audio,
            then schedules every word with spaced repetition so it stays with you
            for good.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <Link href="/register" className="lr-btn lr-btn--primary lr-btn--lg">
              Get started free
              <ArrowRightIcon className="size-5" />
            </Link>
            <Link href="/login" className="lr-btn lr-btn--ghost lr-btn--lg">
              I have an account
            </Link>
          </div>
        </div>

        <div className="mk-reveal flex justify-center lg:justify-end">
          <SampleQuestionCard />
        </div>
      </div>
    </section>
  );
}
