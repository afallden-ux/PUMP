"use client";

import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { useClimberProfile } from "@/components/profile/ClimberProfileContext";
import { Badge } from "@/components/ui/badge";
import type { RankedLeaderboardRow } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils";

interface LeaderboardRankListProps {
  rows: RankedLeaderboardRow[];
  startRank?: number;
}

export function LeaderboardRankList({ rows, startRank = 4 }: LeaderboardRankListProps) {
  const { openProfile } = useClimberProfile();
  const rest = rows.filter((r) => r.rank >= startRank);
  if (rest.length === 0) return null;

  return (
    <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
      {rest.map((row) => {
        const isTop = row.rank <= 3;
        return (
          <motion.li
            key={row.athlete.id}
            layout
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              type="button"
              onClick={() => openProfile(row.athlete.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                row.isCurrentUser
                  ? "border-teal-400/50 bg-teal-50/60"
                  : "border-slate-200 bg-white"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                  row.rank === 1 && "bg-amber-500 text-black",
                  row.rank === 2 && "bg-slate-300 text-slate-900",
                  row.rank === 3 && "bg-amber-800 text-amber-50",
                  row.rank > 3 && "bg-slate-100 text-slate-500"
                )}
              >
                {row.rank === 1 ? (
                  <Crown className="size-3.5" />
                ) : row.rank === 2 || row.rank === 3 ? (
                  <Medal className="size-3.5" />
                ) : (
                  row.rank
                )}
              </span>
              <AvatarFrame
                username={row.athlete.username}
                avatarUrl={row.athlete.avatar_url}
                lifetimeScore={row.athlete.current_pump_score}
                size="sm"
                plain
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-800">
                    {row.athlete.username}
                  </p>
                  {row.isCurrentUser && (
                    <Badge variant="secondary" className="text-[10px]">
                      You
                    </Badge>
                  )}
                </div>
                {!isTop && (
                  <p className="truncate text-[10px] text-slate-400">
                    {row.athlete.title}
                  </p>
                )}
              </div>
              <p className="shrink-0 text-base font-bold tabular-nums text-teal-700">
                {row.displayValue}
              </p>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
