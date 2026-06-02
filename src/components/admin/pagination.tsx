"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
}

/** Prev/next pager that preserves the current filter params in the URL. */
export function Pagination({ page, limit, total }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  function hrefForPage(target: number): string {
    const params = new URLSearchParams(searchParams);
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const linkClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "gap-1",
  );
  const disabledClass =
    "pointer-events-none opacity-50 aria-disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <span className="tabular-nums">
        {total === 0 ? "No results" : `${first}–${last} of ${total}`}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={hrefForPage(page - 1)}
          aria-label="Previous page"
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(linkClass, page <= 1 && disabledClass)}
        >
          <ChevronLeftIcon className="size-4" />
          Prev
        </Link>
        <span className="tabular-nums">
          Page {page} of {pageCount}
        </span>
        <Link
          href={hrefForPage(page + 1)}
          aria-label="Next page"
          aria-disabled={page >= pageCount}
          tabIndex={page >= pageCount ? -1 : undefined}
          className={cn(linkClass, page >= pageCount && disabledClass)}
        >
          Next
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
