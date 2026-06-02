/**
 * Format a future ISO timestamp as a short, human relative string —
 * e.g. "in 45m", "in 3h 20m", "in 2d". Returns "now" if the instant has passed.
 * Used for the dashboard's "next review in …" copy (see frontend_handoff.md).
 */
export function formatTimeUntil(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  if (diffMs <= 0) return "now";

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return `in ${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remMin = minutes % 60;
    return remMin ? `in ${hours}h ${remMin}m` : `in ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours ? `in ${days}d ${remHours}h` : `in ${days}d`;
}
