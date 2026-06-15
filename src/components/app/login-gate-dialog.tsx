"use client";

import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { Modal } from "./modal";

/**
 * Clone gate for an anonymous viewer (design §5.3 / §9). Saving a list requires
 * sign-in; this routes to login with a `returnTo` so the user lands back on the
 * preview after authenticating. Browsing itself is never gated — only Save.
 */
export function LoginGateDialog({
  name,
  returnTo,
  onCancel,
}: {
  name: string;
  returnTo: string;
  onCancel: () => void;
}) {
  return (
    <Modal onClose={onCancel} width={420}>
      <div className="text-center">
        <div className="mx-auto mb-4 mt-0.5 grid size-[60px] place-items-center rounded-[18px] bg-(--primary-soft) text-(--primary)">
          <HeartIcon className="size-7" strokeWidth={2.2} />
        </div>
        <h2 className="font-heading mb-2 text-xl font-bold tracking-tight text-(--ink)">
          Log in to save this list
        </h2>
        <p className="mx-auto mb-5 max-w-xs text-sm leading-relaxed text-(--ink-2)">
          Saving <strong className="text-(--ink)">“{name}”</strong> drops a private copy
          into your lists. It’s free — we’ll bring you right back here.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="lr-btn lr-btn--primary lr-btn--lg"
          >
            Log in &amp; save
          </Link>
          <button type="button" className="lr-btn lr-btn--ghost lr-btn--lg" onClick={onCancel}>
            Keep browsing
          </button>
        </div>
      </div>
    </Modal>
  );
}
