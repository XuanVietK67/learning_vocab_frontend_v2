import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shown when a vocabulary can't be loaded for editing (see note below). */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        Word not available
      </h1>
      <p className="text-sm text-muted-foreground">
        This word couldn&apos;t be opened for editing. User-submitted words
        aren&apos;t editable here yet — they can still be removed from the list.
      </p>
      <Link
        href="/admin/vocabularies"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Back to vocabulary
      </Link>
    </div>
  );
}
