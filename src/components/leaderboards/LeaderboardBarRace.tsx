"use client";

import { motion } from "framer-motion";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { useClimberProfile } from "@/components/profile/ClimberProfileContext";
import { barWidthPct } from "@/lib/leaderboards/rank";
import type { RankedLeaderboardRow } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils";

interface LeaderboardBarRaceProps {
  rows: RankedLeaderboardRow[];
  higherIsBetter: boolean;
  limit?: number;
}

export function LeaderboardBarRace({
  rows,
  higherIsBetter,
  limit = 8,
}: LeaderboardBarRaceProps) {
  const { openProfile } = useClimberProfile();
  const slice = rows.slice(0, limit);
  if (slice.length === 0) return null;

  const leaderValue = slice[0]?.value ?? 1;

  return (
    <ul className="space-y-2">
      {slice.map((row, index) => {
        const width = barWidthPct(row.value, leaderValue, higherIsBetter);
        return (
          <motion.li
            key={row.athlete.id}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.04 }}
          >
            <button
              type="button"
              onClick={() => openProfile(row.athlete.id)}
              className={cn(
                "group flex w-full items-center gap-2 rounded-lg border border-slate-100 bg-white p-2 text-left transition-colors hover:border-teal-200 hover:bg-teal-50/30",
                row.isCurrentUser && "border-teal-300 bg-teal-50/50"
              )}
            >
              <span className="w-6 shrink-0 text-center text-xs font-bold text-slate-400">
                {row.rank}
              </span>
              <AvatarFrame
                username={row.athlete.username}
                avatarUrl={row.athlete.avatar_url}
                lifetimeScore={row.athlete.current_pump_score}
                size="sm"
                plain
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {row.athlete.username}
                  </p>
                  <p className="shrink-0 text-sm font-bold tabular-nums text-teal-700">
                    {row.displayValue}
                  </p>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                </div>
              </div>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
