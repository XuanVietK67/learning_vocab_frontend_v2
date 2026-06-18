import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

/** Closing conversion band: a saturated colored crescendo, not the old black band. */
export function FinalCta() {
  return (
    <section className="px-4 pt-10 pb-24 sm:px-6">
      <div className="mk-cta-band mk-reveal relative mx-auto max-w-[1104px] overflow-hidden rounded-[40px] px-6 py-20 text-center shadow-(--sh-lg) sm:px-10">
        <h2 className="mb-4 font-(family-name:--serif) text-3xl font-medium tracking-tight text-balance text-white sm:text-4xl lg:text-[46px]">
          Start learning words that stay.
        </h2>
        <p className="mx-auto mb-8 max-w-md text-lg leading-relaxed text-white/90">
          Free to start, no card required. Your first words are five minutes
          away.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link href="/register" className="lr-btn lr-btn--amber lr-btn--md">
            Get started free
            <ArrowRightIcon className="size-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center rounded-full border-[1.5px] border-white/50 bg-white/15 px-6 text-[17px] font-bold text-white transition-colors hover:bg-white/25"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
