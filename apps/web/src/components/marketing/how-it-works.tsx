import { RefreshCwIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Meet the word",
    description:
      "See it inside a real sentence with native audio, never on a bare flashcard.",
    disc: "bg-(--primary) shadow-(--sh-primary)",
  },
  {
    title: "Use it in context",
    description:
      "Fill the blank and pick the word that fits the meaning, building real recall.",
    disc: "bg-(--sky) shadow-[0_8px_18px_-5px_rgba(31,159,209,.5)]",
  },
  {
    title: "Review on schedule",
    description:
      "Spaced repetition brings each word back at exactly the right moment.",
    disc: "bg-(--amber-2) shadow-(--sh-amber)",
  },
] as const;

/** Three-step explainer of the core learning loop. */
export function HowItWorks() {
  return (
    <section className="mk-band-mint py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mk-reveal mx-auto mb-14 max-w-xl text-center">
          <div className="mb-3.5 text-xs font-bold tracking-[0.12em] text-(--ink-3) uppercase">
            The loop
          </div>
          <h2 className="mb-3.5 font-(family-name:--serif) text-3xl font-medium tracking-tight text-(--ink) sm:text-4xl">
            Three steps that turn into a habit
          </h2>
          <p className="text-lg leading-relaxed text-(--ink-2)">
            See it, use it, then review it right before you would forget. The
            loop is the whole product.
          </p>
        </div>

        <ol className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="lr-card mk-reveal p-7">
              <span
                className={cn(
                  "mb-5 flex size-14 items-center justify-center rounded-full text-[22px] font-extrabold text-white",
                  step.disc,
                )}
              >
                {index + 1}
              </span>
              <h3 className="mb-2 text-xl font-extrabold tracking-tight text-(--ink)">
                {step.title}
              </h3>
              <p className="leading-relaxed text-(--ink-2)">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mk-reveal mt-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-(--primary-soft) px-4 py-2.5 text-sm font-bold text-(--primary-ink)">
            <RefreshCwIcon className="size-4" />
            And it repeats, every day
          </span>
        </div>
      </div>
    </section>
  );
}
