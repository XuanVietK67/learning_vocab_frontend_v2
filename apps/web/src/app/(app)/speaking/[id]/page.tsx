import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getScenario } from "@/lib/me/speaking/scenarios";
import { SceneScreen } from "./scene-screen";

export const metadata: Metadata = { title: "Scene · Speaking Room" };

/**
 * The "ready room" before a live session (brief §4.2). Loads the full scenario
 * card; a missing / unpublished / malformed id `notFound()`s into the colourful
 * 404 below. Everything interactive (word picker + start) lives in the client
 * {@link SceneScreen}, which starts the session and hands off to the live screen.
 */
export default async function ScenePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = await getScenario(id);
  if (!scenario) notFound();

  return <SceneScreen scenario={scenario} />;
}
