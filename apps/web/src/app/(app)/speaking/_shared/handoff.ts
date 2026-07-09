/**
 * There is no GET-session endpoint (the transcript is accumulated client-side),
 * so the scene screen stashes the `POST /sessions` response in `sessionStorage`
 * and the live screen reads it back by session id. A refresh / cold deep-link
 * loses the in-memory transcript — that's an accepted backend limitation
 * (docs/api/speaking_practice_session.md), handled by the live screen's recovery
 * card. All access is wrapped so SSR / private-mode never throws.
 */
import type { SpeakingSession } from "@/lib/me/speaking/types";

const key = (sessionId: string): string => `speaking:start:${sessionId}`;

export function stashStart(session: SpeakingSession): void {
  try {
    sessionStorage.setItem(key(session.id), JSON.stringify(session));
  } catch {
    /* storage unavailable — the live screen falls back to its recovery card */
  }
}

export function readStart(sessionId: string): SpeakingSession | null {
  try {
    const raw = sessionStorage.getItem(key(sessionId));
    return raw ? (JSON.parse(raw) as SpeakingSession) : null;
  } catch {
    return null;
  }
}

export function clearStart(sessionId: string): void {
  try {
    sessionStorage.removeItem(key(sessionId));
  } catch {
    /* no-op */
  }
}
