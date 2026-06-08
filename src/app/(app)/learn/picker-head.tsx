import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

interface PickerHeadProps {
  eyebrow: string;
  title: string;
  sub?: string;
  /** Where the back chevron returns to (defaults to the source picker). */
  backHref?: string;
}

/** Shared header for the topic/deck sub-pickers: back chevron + title block. */
export function PickerHead({ eyebrow, title, sub, backHref = "/learn" }: PickerHeadProps) {
  return (
    <div className="mb-6">
      <Link href={backHref} aria-label="Back" className="lr-icon-btn mb-4">
        <ChevronLeftIcon className="size-5" />
      </Link>
      <div className="lr-eyebrow mb-2">{eyebrow}</div>
      <h1 className="text-[32px] font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="mt-2 text-(--ink-2)">{sub}</p>}
    </div>
  );
}
