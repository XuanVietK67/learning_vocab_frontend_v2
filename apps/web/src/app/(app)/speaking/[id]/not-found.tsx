import Link from "next/link";
import { CompassIcon } from "lucide-react";

/** Shown when a scenario id is unknown, unpublished, or malformed (brief §5). */
export default function SceneNotFound() {
  return (
    <div className="app-shell speak-shell speak-field flex min-h-[calc(100vh-3.5rem)] flex-col justify-center px-4 py-10">
      <div className="lr-card lr-pop mx-auto w-full max-w-md p-9 text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-(--violet-soft) text-(--violet)">
          <CompassIcon className="size-7" />
        </div>
        <h1 className="serif text-2xl font-medium text-(--ink)">
          That scene isn&apos;t available
        </h1>
        <p className="mt-2 text-[15px] font-medium text-(--ink-2)">
          It may have been retired, or the link is wrong. Browse the other
          conversations instead.
        </p>
        <Link href="/speaking" className="lr-btn lr-btn--primary lr-btn--md mt-6">
          Back to scenarios
        </Link>
      </div>
    </div>
  );
}
