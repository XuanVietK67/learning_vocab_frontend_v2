/**
 * Avatar for a leaderboard entry — the user's `avatarUrl` when set, else their
 * initial in a `--violet-soft` circle. Mirrors the background-image fallback the
 * sidebar uses (app-nav.tsx). `ring` paints a medal halo on the podium.
 */
export function EntryAvatar({
  username,
  avatarUrl,
  size = 38,
  ring,
}: {
  username: string | null;
  avatarUrl: string | null;
  size?: number;
  /** CSS color for a medal ring halo (podium only). */
  ring?: string;
}) {
  const initial = (username || "?").trim().charAt(0).toUpperCase();
  const ringStyle = ring ? { boxShadow: `0 0 0 3px ${ring}` } : undefined;

  if (avatarUrl) {
    return (
      <span
        aria-hidden
        className="block flex-none rounded-full bg-cover bg-center"
        style={{
          width: size,
          height: size,
          backgroundImage: `url("${avatarUrl}")`,
          ...ringStyle,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex flex-none items-center justify-center rounded-full bg-(--violet-soft) font-bold text-(--violet)"
      style={{ width: size, height: size, fontSize: size * 0.42, ...ringStyle }}
    >
      {initial}
    </span>
  );
}
