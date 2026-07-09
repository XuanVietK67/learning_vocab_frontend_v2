import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getScenario } from "@/lib/me/speaking/scenarios";
import { SessionScreen } from "./session-screen";

export const metadata: Metadata = { title: "Conversation · Speaking Room" };

/**
 * The live conversation (brief §4.3). The scenario card is re-read server-side
 * for the header; the live session handle itself is handed off by the scene
 * screen via `sessionStorage` (there is no GET-session endpoint), so the client
 * {@link SessionScreen} reads it by the `sid` query param and recovers gracefully
 * if it's gone.
 */
export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sid?: string }>;
}) {
  const [{ id }, { sid }] = await Promise.all([params, searchParams]);
  const scenario = await getScenario(id);
  if (!scenario) notFound();

  return <SessionScreen scenario={scenario} sessionId={sid ?? null} />;
}
