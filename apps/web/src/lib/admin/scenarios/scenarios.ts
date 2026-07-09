/**
 * Render-safe reads for the admin scenario list + editor
 * (docs/api/admin_create_scenario.md). The `(admin)` layout already role-gates
 * the surface; these reads still degrade to empty / null rather than throwing so
 * a cold backend shows the composed empty state, not an error boundary. Mutations
 * live in {@link import("./actions")}.
 */
import type { CefrLevel } from "@/lib/auth/types";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/session";
import type { AdminScenario, AdminScenarioPage, ScenarioStatus } from "./types";

interface RawAdminScenario {
  id?: string | null;
  title?: string | null;
  topic?: string | null;
  cefrLevel?: CefrLevel | null;
  setting?: string | null;
  aiRole?: string | null;
  userRole?: string | null;
  goal?: string | null;
  openingLine?: string | null;
  seedPhrases?: string[] | null;
  estTurns?: number | null;
  introVideoScript?: string | null;
  introVideoUrl?: string | null;
  status?: ScenarioStatus | null;
  version?: number | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function toAdminScenario(raw: RawAdminScenario): AdminScenario {
  return {
    id: String(raw.id),
    title: String(raw.title ?? ""),
    topic: String(raw.topic ?? ""),
    cefrLevel: raw.cefrLevel ?? null,
    setting: String(raw.setting ?? ""),
    aiRole: String(raw.aiRole ?? ""),
    userRole: String(raw.userRole ?? ""),
    goal: String(raw.goal ?? ""),
    openingLine: String(raw.openingLine ?? ""),
    seedPhrases: Array.isArray(raw.seedPhrases)
      ? raw.seedPhrases.filter((p): p is string => Boolean(p))
      : [],
    estTurns: typeof raw.estTurns === "number" ? raw.estTurns : null,
    introVideoScript: raw.introVideoScript ?? null,
    introVideoUrl: raw.introVideoUrl ?? null,
    status: raw.status ?? "draft",
    version: typeof raw.version === "number" ? raw.version : 1,
    createdBy: raw.createdBy ?? null,
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

const EMPTY_PAGE: AdminScenarioPage = { data: [], page: 1, limit: 20, total: 0 };

export interface AdminScenarioFilter {
  topic?: string;
  cefrLevel?: CefrLevel;
  status?: ScenarioStatus;
  page?: number;
  limit?: number;
}

/** One page of scenarios (newest first). Empty (never throwing) on any failure. */
export async function listAdminScenarios(
  filter: AdminScenarioFilter = {},
): Promise<AdminScenarioPage> {
  const token = await getAccessToken();
  if (!token) return EMPTY_PAGE;

  const params = new URLSearchParams();
  if (filter.topic) params.set("topic", filter.topic);
  if (filter.cefrLevel) params.set("cefrLevel", filter.cefrLevel);
  if (filter.status) params.set("status", filter.status);
  params.set("page", String(Math.max(1, filter.page ?? 1)));
  params.set("limit", String(Math.min(100, Math.max(1, filter.limit ?? 20))));

  const res = await apiRequest<{
    data?: RawAdminScenario[] | null;
    page?: number;
    limit?: number;
    total?: number;
  }>(`/v1/admin/scenarios?${params.toString()}`, { method: "GET" }, token);

  if (!res.ok || !res.data) return EMPTY_PAGE;
  return {
    data: (res.data.data ?? []).filter((s) => Boolean(s?.id)).map(toAdminScenario),
    page: res.data.page ?? 1,
    limit: res.data.limit ?? 20,
    total: res.data.total ?? 0,
  };
}

/** One scenario for the editor, or `null` when the id is malformed / unknown. */
export async function getAdminScenario(id: string): Promise<AdminScenario | null> {
  if (!UUID_RE.test(id)) return null;
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiRequest<RawAdminScenario>(
    `/v1/admin/scenarios/${id}`,
    { method: "GET" },
    token,
  );
  if (!res.ok || !res.data?.id) return null;
  return toAdminScenario(res.data);
}
