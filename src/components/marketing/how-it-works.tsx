const STEPS = [
  {
    title: "Tell us your languages & level",
    description:
      "Pick what you speak and what you're learning. We tune the catalog to your CEFR level so words are never too easy or too hard.",
  },
  {
    title: "Answer in-context questions",
    description:
      "Fill blanks, match meanings, build sentences, train your ear. Every prompt is generated from a real example sentence.",
  },
  {
    title: "We schedule each word for you",
    description:
      "A spaced-repetition engine resurfaces every word right before you'd forget it — so reviews stay short and effective.",
  },
] as const;

/** Three-step explainer of the core learning loop. */
export function HowItWorks() {
  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex max-w-xl flex-col gap-3">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps to your first review
          </h2>
          <p className="text-lg text-muted-foreground">
            No setup busywork — you&apos;ll be answering questions within a minute.
          </p>
        </div>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                {index + 1}
              </span>
              <h3 className="font-heading text-lg font-medium tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
