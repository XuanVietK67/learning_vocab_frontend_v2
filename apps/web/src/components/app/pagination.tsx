"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
}

/**
 * App-styled prev/next pager (mirrors components/admin/pagination.tsx but uses
 * the learner `lr-*` / `(--ink)` design tokens). Page state lives in the URL so
 * the page stays a Server Component and the back button works; the current
 * filter params (e.g. `q`) are preserved across page changes.
 */
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

  const btnClass = "lr-btn lr-btn--ghost lr-btn--sm";
  const disabledClass = "pointer-events-none opacity-50";

  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-[12.5px] text-(--ink-3)">
      <span className="tnum">
        {total === 0 ? "No words" : `${first}–${last} of ${total}`}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={hrefForPage(page - 1)}
          aria-label="Previous page"
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(btnClass, page <= 1 && disabledClass)}
        >
          <ChevronLeftIcon className="size-4" />
          Prev
        </Link>
        <span className="tnum px-1">
          Page {page} of {pageCount}
        </span>
        <Link
          href={hrefForPage(page + 1)}
          aria-label="Next page"
          aria-disabled={page >= pageCount}
          tabIndex={page >= pageCount ? -1 : undefined}
          className={cn(btnClass, page >= pageCount && disabledClass)}
        >
          Next
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
