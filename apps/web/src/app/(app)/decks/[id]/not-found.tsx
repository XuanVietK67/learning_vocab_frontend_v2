import Link from "next/link";
import { ListIcon } from "lucide-react";

/** Shown when a deck id is unknown or not owned by the caller. */
export default function DeckNotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-20 text-center sm:px-6">
      <span className="mb-4 inline-flex rounded-full bg-(--muted) p-4 text-(--ink-3)">
        <ListIcon className="size-6" />
      </span>
      <h1 className="font-heading text-xl font-bold tracking-tight text-(--ink)">
        This list isn’t available
      </h1>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-(--ink-2)">
        It may have been deleted, or it belongs to someone else.
      </p>
      <Link href="/decks" className="lr-btn lr-btn--primary lr-btn--md mt-5 inline-flex">
        Back to my lists
      </Link>
    </div>
  );
}
