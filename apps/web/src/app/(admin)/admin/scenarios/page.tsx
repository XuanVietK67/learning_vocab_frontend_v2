import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, SparklesIcon } from "lucide-react";

import type { CefrLevel } from "@/lib/auth/types";
import { getPracticeTopics } from "@/lib/me/practice/queue";
import { listAdminScenarios } from "@/lib/admin/scenarios/scenarios";
import type { ScenarioStatus } from "@/lib/admin/scenarios/types";
import { AdminScenarioFilters } from "./admin-filters";
import { ScenarioAdminCard } from "./scenario-admin-card";
import { ScenarioAdminShell } from "./_shell";

export const metadata: Metadata = { title: "Speaking scenarios" };

const CEFR_SET = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const STATUS_SET = new Set(["draft", "published", "retired"]);

/** Admin authoring gallery (brief §3.1) — a colourful card list, not a grey table. */
export default async function AdminScenariosPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; cefrLevel?: string; status?: string }>;
}) {
  const { topic = "", cefrLevel = "", status = "" } = await searchParams;

  const [topics, page] = await Promise.all([
    getPracticeTopics(),
    listAdminScenarios({
      topic: topic || undefined,
      cefrLevel: CEFR_SET.has(cefrLevel) ? (cefrLevel as CefrLevel) : undefined,
      status: STATUS_SET.has(status) ? (status as ScenarioStatus) : undefined,
    }),
  ]);

  const scenarios = page.data;
  const filtered = Boolean(topic || cefrLevel || status);

  return (
    <ScenarioAdminShell>
      <div className="mx-auto w-full max-w-[1140px] px-5 pt-6 pb-20 sm:px-7">
        {/* header band */}
        <header className="lr-card speak-band mb-6 flex flex-wrap items-center justify-between gap-4 px-7 py-6">
          <div>
            <p className="lr-eyebrow text-(--violet)!">Admin · Authoring</p>
            <h1 className="serif mt-1 text-[32px] leading-tight font-medium tracking-[-0.01em] text-(--ink)">
              Speaking scenarios
            </h1>
          </div>
          <Link href="/admin/scenarios/new" className="lr-btn lr-btn--primary lr-btn--md">
            <PlusIcon className="size-[18px]" /> New scenario
          </Link>
        </header>

        <div className="mb-5">
          <AdminScenarioFilters topics={topics} topic={topic} cefrLevel={cefrLevel} status={status} />
        </div>

        {scenarios.length === 0 ? (
          <AdminEmpty filtered={filtered} />
        ) : (
          <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-2">
            {scenarios.map((scenario) => (
              <ScenarioAdminCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        )}
      </div>
    </ScenarioAdminShell>
  );
}

function AdminEmpty({ filtered }: { filtered: boolean }) {
  return (
    <div className="lr-card flex flex-col items-center px-8 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-(--violet-soft) text-(--violet)">
        <SparklesIcon className="size-7" />
      </span>
      <h2 className="serif mt-5 text-2xl font-medium text-(--ink)">
        {filtered ? "No scenarios match those filters" : "Author your first scene"}
      </h2>
      <p className="mt-2 max-w-sm text-[15px] font-medium text-(--ink-2)">
        {filtered
          ? "Try a different topic, level, or status."
          : "Set a scene, cast the roles, and learners can practise it as a live conversation."}
      </p>
      {!filtered && (
        <Link href="/admin/scenarios/new" className="lr-btn lr-btn--primary lr-btn--md mt-6">
          <PlusIcon className="size-[18px]" /> New scenario
        </Link>
      )}
    </div>
  );
}
