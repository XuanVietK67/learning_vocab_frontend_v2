import { Skeleton } from "@/components/ui/skeleton";

/** Route-level fallback while the learn page resolves on the server. */
export default function LearnLoading() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6">
      <Skeleton className="h-8 w-full" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
