"use client";

import { Button } from "@/components/ui/button";

/** Catches unexpected render/data errors anywhere in the admin segment. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-sm text-muted-foreground">
        {error.digest
          ? `An unexpected error occurred (ref: ${error.digest}).`
          : "An unexpected error occurred while loading this page."}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
