"use client";

import { Trophy, Crown } from "lucide-react";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import type { LeaderboardEntry } from "@/types/app";

interface LeaderboardsPanelProps {
  weeklyEntries: LeaderboardEntry[];
  lifetimeEntries: LeaderboardEntry[];
  currentUserId: string;
}

export function LeaderboardsPanel({
  weeklyEntries,
  lifetimeEntries,
  currentUserId,
}: LeaderboardsPanelProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200/90 bg-white p-4 shadow-sm lg:p-5">
      <div className="flex items-center gap-2">
        <Trophy className="size-6 text-teal-600" />
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Leaderboards</h2>
          <p className="text-xs text-slate-500">Everyone on CC</p>
        </div>
      </div>

      <Leaderboard
        entries={weeklyEntries}
        currentUserId={currentUserId}
        global
        mode="weekly"
      />

      <div className="border-t border-slate-100 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <Crown className="size-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-slate-800">Lifetime CC</h3>
        </div>
        <Leaderboard
          entries={lifetimeEntries}
          currentUserId={currentUserId}
          global
          mode="lifetime"
        />
      </div>
    </section>
  );
}
