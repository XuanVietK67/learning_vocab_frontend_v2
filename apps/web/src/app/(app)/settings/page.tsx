import type { Metadata } from "next";

import { getMe } from "@/lib/auth/me";

import { LeaderboardVisibilityToggle } from "./leaderboard-visibility-toggle";

export const metadata: Metadata = { title: "Settings" };

/**
 * `/settings` — currently hosts the leaderboard visibility control (the
 * `/leaderboard` "Open Settings" prompt lands here). Languages, level, and the
 * daily goal will join this page later.
 */
export default async function SettingsPage() {
  const user = await getMe();

  return (
    <div className="lr-stagger mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6 lg:py-10">
      <header>
        <p className="lr-eyebrow mb-2">Account</p>
        <h1 className="serif text-[32px] font-semibold tracking-[-0.015em] text-(--ink)">
          Settings
        </h1>
        <p className="mt-1.5 text-(--ink-2)">Manage how you show up across the app.</p>
      </header>

      <section className="lr-card mt-7 p-6">
        <h2 className="serif text-[20px] font-semibold text-(--ink)">Leaderboard</h2>
        <p className="mt-1 text-sm text-(--ink-2)">
          Control whether other learners can see you on the board.
        </p>
        <div className="mt-5 border-t border-(--line) pt-5">
          <LeaderboardVisibilityToggle
            initialOptOut={user?.leaderboardOptOut ?? false}
          />
        </div>
      </section>

      <p className="mt-5 text-[13px] text-(--ink-3)">
        More settings — languages, level, and daily goal — are coming here soon.
      </p>
    </div>
  );
}
