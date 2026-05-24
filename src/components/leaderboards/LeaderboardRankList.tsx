"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { useClimberProfile } from "@/components/profile/ClimberProfileContext";
import { gapFromLeaderPct } from "@/lib/leaderboards/rank";
import type { RankedLeaderboardRow } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils";

interface LeaderboardRankListProps {
  rows: RankedLeaderboardRow[];
  higherIsBetter: boolean;
  metricKey: string;
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  startRank?: number;
}

export function LeaderboardRankList({
  rows,
  higherIsBetter,
  metricKey,
  highlightedId,
  onHighlight,
  startRank = 1,
}: LeaderboardRankListProps) {
  const { openProfile } = useClimberProfile();
  const list = rows.filter((r) => r.rank >= startRank);
  if (list.length === 0) return null;

  const leaderValue = rows[0]?.value ?? 1;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <div className="grid grid-cols-[2.5rem_1fr_auto] gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <span>#</span>
        <span>Climber</span>
        <span className="text-right">Score</span>
      </div>
      <ul className="max-h-[min(28rem,55vh)] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {list.map((row, index) => {
            const isTop = row.rank <= 3;
            const gap = gapFromLeaderPct(row.value, leaderValue, higherIsBetter);
            const isHighlighted =
              highlightedId === row.athlete.id ||
              (highlightedId == null && row.isCurrentUser);

            return (
              <motion.li
                key={row.athlete.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(index * 0.015, 0.2) }}
              >
                <button
                  type="button"
                  data-current-user={row.isCurrentUser ? "true" : undefined}
                  onMouseEnter={() => onHighlight(row.athlete.id)}
                  onMouseLeave={() => onHighlight(null)}
                  onClick={() => openProfile(row.athlete.id)}
                  className={cn(
                    "grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-2 border-b border-slate-50 px-3 py-2.5 text-left transition-colors last:border-0",
                    "hover:bg-slate-50/80",
                    row.isCurrentUser && "bg-teal-50/50",
                    isHighlighted && "bg-teal-50/70"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md text-xs font-bold",
                      row.rank === 1 && "bg-amber-500 text-black",
                      row.rank === 2 && "bg-slate-300 text-slate-900",
                      row.rank === 3 && "bg-amber-900 text-amber-50",
                      row.rank > 3 && "bg-slate-100 text-slate-600"
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
                  <div className="flex min-w-0 items-center gap-2">
                    <AvatarFrame
                      username={row.athlete.username}
                      avatarUrl={row.athlete.avatar_url}
                      lifetimeScore={row.athlete.current_pump_score}
                      size="sm"
                      plain
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {row.athlete.username}
                      </p>
                      {!isTop && (
                        <p className="truncate text-[10px] text-slate-400">
                          {row.athlete.title}
                          {gap > 0 && (
                            <span className="ml-1 text-slate-300">· {gap}% behind</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <motion.span
                    key={`${metricKey}-${row.displayValue}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-right text-sm font-bold tabular-nums text-teal-700"
                  >
                    {row.displayValue}
                  </motion.span>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
