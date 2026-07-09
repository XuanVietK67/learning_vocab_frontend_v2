"use client";

import { useEffect } from "react";
import { XIcon } from "lucide-react";

/**
 * Right slide-over sheet (used by the bulk-import flow). Locks scroll, closes on
 * Escape / backdrop click, and renders a fixed footer slot. Mirrors the mobile
 * drawer pattern in `app-nav.tsx`; kept generic so other flows can reuse it.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-(--ink)/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-[520px] max-w-[94vw] flex-col border-l border-(--line-2) bg-(--surface) shadow-[var(--sh-lg)]"
      >
        <div className="flex items-start gap-3 border-b border-(--line) px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-[17px] font-bold tracking-tight text-(--ink)">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-(--ink-3)">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="lr-icon-btn size-8"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="border-t border-(--line) bg-(--card-2) px-5 py-3.5">{footer}</div>
        )}
      </div>
    </div>
  );
}
