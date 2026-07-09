import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { EYEBROW } from "./cards";

interface PickerHeadProps {
  eyebrow: string;
  title: string;
  sub?: string;
  /** Where the back pill returns to (defaults to the hub). */
  backHref?: string;
}

/** Shared header for the topic/deck "See all" pickers: back pill + title block. */
export function PickerHead({ eyebrow, title, sub, backHref = "/learn" }: PickerHeadProps) {
  return (
    <header>
      <Link
        href={backHref}
        className="group inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--learn-surface) py-2 pr-3.5 pl-2.5 text-[13.5px] font-semibold text-(--primary-ink) shadow-(--sh-sm) transition hover:border-transparent hover:bg-(--primary-soft)"
      >
        <ArrowLeftIcon className="size-4 transition group-hover:-translate-x-0.5" />
        Back
      </Link>
      <div className="mt-4.5">
        <div className={EYEBROW}>{eyebrow}</div>
        <h1 className="mt-3 text-[32px] leading-[1.05] font-extrabold tracking-[-0.025em] text-(--ink)">
          {title}
        </h1>
        {sub && <p className="mt-1 max-w-[46ch] text-[15px] text-(--ink-2)">{sub}</p>}
      </div>
    </header>
  );
}
