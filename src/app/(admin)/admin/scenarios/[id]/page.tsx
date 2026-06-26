import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { getAdminScenario } from "@/lib/admin/scenarios/scenarios";
import type { ScenarioFormValues } from "@/lib/validations/scenario";
import { ScenarioForm } from "../scenario-form";
import { ScenarioAdminShell } from "../_shell";

export const metadata: Metadata = { title: "Edit scenario" };

const STATUS: Record<string, { cls: string; label: string }> = {
  draft: { cls: "sc-pill--draft", label: "Draft" },
  published: { cls: "sc-pill--live", label: "Live" },
  retired: { cls: "sc-pill--retired", label: "Retired" },
};

/** Edit + publish a scenario (brief §3.3) — same form as `new`, prefilled. */
export default async function EditScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = await getAdminScenario(id);
  if (!scenario) notFound();

  const initial: ScenarioFormValues = {
    title: scenario.title,
    topic: scenario.topic,
    cefrLevel: scenario.cefrLevel ?? "",
    setting: scenario.setting,
    aiRole: scenario.aiRole,
    userRole: scenario.userRole,
    goal: scenario.goal,
    openingLine: scenario.openingLine,
    seedPhrases: scenario.seedPhrases,
    estTurns: scenario.estTurns ?? "",
    introVideoScript: scenario.introVideoScript ?? "",
  };

  const status = STATUS[scenario.status];

  return (
    <ScenarioAdminShell>
      <div className="mx-auto w-full max-w-[1180px] px-5 pt-5 pb-20 sm:px-7">
        <Link
          href="/admin/scenarios"
          className="mb-3 inline-flex items-center gap-1.5 py-1.5 text-sm font-bold text-(--ink-2) transition-colors hover:text-(--ink)"
        >
          <ArrowLeftIcon className="size-4" /> Scenarios
        </Link>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h1 className="serif text-[30px] leading-tight font-medium tracking-[-0.01em] text-(--ink)">
            {scenario.title}
          </h1>
          <span className={cn("sc-pill", status.cls)}>{status.label}</span>
        </div>
        <ScenarioForm
          mode="edit"
          scenarioId={scenario.id}
          initial={initial}
          status={scenario.status}
          version={scenario.version}
        />
      </div>
    </ScenarioAdminShell>
  );
}
