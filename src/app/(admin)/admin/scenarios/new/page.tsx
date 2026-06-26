import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { EMPTY_SCENARIO_FORM } from "@/lib/validations/scenario";
import { ScenarioForm } from "../scenario-form";
import { ScenarioAdminShell } from "../_shell";

export const metadata: Metadata = { title: "New scenario" };

/** Author a new scenario (brief §3.2). Lands in `draft`; the form hands off to edit. */
export default function NewScenarioPage() {
  return (
    <ScenarioAdminShell>
      <div className="mx-auto w-full max-w-[1180px] px-5 pt-5 pb-20 sm:px-7">
        <Link
          href="/admin/scenarios"
          className="mb-3 inline-flex items-center gap-1.5 py-1.5 text-sm font-bold text-(--ink-2) transition-colors hover:text-(--ink)"
        >
          <ArrowLeftIcon className="size-4" /> Scenarios
        </Link>
        <h1 className="serif mb-5 text-[30px] leading-tight font-medium tracking-[-0.01em] text-(--ink)">
          New scenario
        </h1>
        <ScenarioForm mode="create" initial={EMPTY_SCENARIO_FORM} />
      </div>
    </ScenarioAdminShell>
  );
}
