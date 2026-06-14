"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";

/**
 * Lightweight centered modal for the mint `.app-shell` (the share confirm + the
 * clone login gate). Hand-rolled to match the design's `Dialog` — `.app-shell`
 * uses the `.lr-*` atoms, not shadcn primitives. Closes on Escape / backdrop
 * unless `dismissible` is false (e.g. while a request is in flight).
 */
export function Modal({
  children,
  onClose,
  dismissible = true,
  width = 460,
}: {
  children: React.ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  width?: number;
}) {
  useEffect(() => {
    if (!dismissible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismissible, onClose]);

  return (
    <div
      onMouseDown={() => dismissible && onClose()}
      className="fixed inset-0 z-[100] grid place-items-center bg-(--ink)/30 p-6 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "lr-pop w-full rounded-[24px] border border-(--line-2) bg-(--surface) p-6 shadow-(--sh-lg)",
        )}
        style={{ maxWidth: width }}
      >
        {children}
      </div>
    </div>
  );
}
