/**
 * Render-safe reads for the learner Speaking Room catalogue
 * (docs/api/speaking_browse_scenarios.md). Only **published** scenarios are ever
 * returned. Like the practice queue reads, these use `apiRequest` with an
 * explicit token and **degrade to empty / null rather than throwing**, so a cold
 * backend or a signed-out visitor lands on the composed empty state instead of an
 * error boundary. Mutations (starting a session) live in {@link import("./session-actions")}.
 */
import type { CefrLevel } from "@/lib/auth/types";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/session";
import type { ScenarioPage, SpeakingScenario } from "./types";

/** Raw scenario row as it arrives on the wire (fields may be absent / null). */
interface RawScenario {
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
  introVideoUrl?: string | null;
}

/** A v4 UUID — guard `:id` reads so a bad slug returns null instead of a 404 round-trip. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function toScenario(raw: RawScenario): SpeakingScenario {
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
    introVideoUrl: raw.introVideoUrl ?? null,
  };
}

const EMPTY_PAGE: ScenarioPage = { data: [], page: 1, limit: 20, total: 0 };

export interface ScenarioBrowseFilter {
  topic?: string;
  cefrLevel?: CefrLevel;
  page?: number;
  limit?: number;
}

/**
 * One page of published scenarios. The backend already orders the learner's own
 * CEFR level first (then any-level, then the rest) when `cefrLevel` is unpinned,
 * so the catalogue can surface a "recommended" ribbon on the leading cards.
 * Empty (never throwing) when signed out or the backend is cold.
 */
export async function listScenarios(
  filter: ScenarioBrowseFilter = {},
): Promise<ScenarioPage> {
  const token = await getAccessToken();
  if (!token) return EMPTY_PAGE;

  const params = new URLSearchParams();
  if (filter.topic) params.set("topic", filter.topic);
  if (filter.cefrLevel) params.set("cefrLevel", filter.cefrLevel);
  params.set("page", String(Math.max(1, filter.page ?? 1)));
  params.set("limit", String(Math.min(100, Math.max(1, filter.limit ?? 20))));

  const res = await apiRequest<{
    data?: RawScenario[] | null;
    page?: number;
    limit?: number;
    total?: number;
  }>(`/v1/speaking/scenarios?${params.toString()}`, { method: "GET" }, token);

  if (!res.ok || !res.data) return EMPTY_PAGE;
  return {
    data: (res.data.data ?? []).filter((s) => Boolean(s?.id)).map(toScenario),
    page: res.data.page ?? 1,
    limit: res.data.limit ?? 20,
    total: res.data.total ?? 0,
  };
}

/** One published scenario, or `null` when the id is malformed, unknown, or not published. */
export async function getScenario(id: string): Promise<SpeakingScenario | null> {
  if (!isUuid(id)) return null;
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiRequest<RawScenario>(
    `/v1/speaking/scenarios/${id}`,
    { method: "GET" },
    token,
  );
  if (!res.ok || !res.data?.id) return null;
  return toScenario(res.data);
}
