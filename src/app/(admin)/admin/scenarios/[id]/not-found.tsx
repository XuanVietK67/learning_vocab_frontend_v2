import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

import { ScenarioAdminShell } from "../_shell";

/** Shown when a scenario id is unknown in the editor. */
export default function EditScenarioNotFound() {
  return (
    <ScenarioAdminShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-(--violet-soft) text-(--violet)">
          <FileQuestionIcon className="size-7" />
        </div>
        <h1 className="serif mt-5 text-2xl font-medium text-(--ink)">
          That scenario doesn&apos;t exist
        </h1>
        <p className="mt-2 max-w-sm text-[15px] font-medium text-(--ink-2)">
          It may have been removed. Head back to the list to find another.
        </p>
        <Link href="/admin/scenarios" className="lr-btn lr-btn--primary lr-btn--md mt-6">
          Back to scenarios
        </Link>
      </div>
    </ScenarioAdminShell>
  );
}
