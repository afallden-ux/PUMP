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
    <section className="space-y-4 rounded-2xl border border-amber-500/25 bg-gradient-to-b from-amber-500/10 to-transparent p-4 lg:p-5">
      <div className="flex items-center gap-2">
        <Trophy className="size-6 text-amber-400" />
        <div>
          <h2 className="text-lg font-black">Leaderboards</h2>
          <p className="text-xs text-muted-foreground">Everyone on CC</p>
        </div>
      </div>

      <Leaderboard
        entries={weeklyEntries}
        currentUserId={currentUserId}
        global
        mode="weekly"
      />

      <div className="border-t border-border/50 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <Crown className="size-5 text-orange-400" />
          <h3 className="text-lg font-black">Lifetime CC</h3>
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
