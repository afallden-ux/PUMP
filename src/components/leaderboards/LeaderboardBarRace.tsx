"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { useClimberProfile } from "@/components/profile/ClimberProfileContext";
import { barWidthPct, gapFromLeaderPct } from "@/lib/leaderboards/rank";
import type { RankedLeaderboardRow } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils";

interface LeaderboardBarRaceProps {
  rows: RankedLeaderboardRow[];
  higherIsBetter: boolean;
  metricKey: string;
  limit?: number;
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
}

export function LeaderboardBarRace({
  rows,
  higherIsBetter,
  metricKey,
  limit = 12,
  highlightedId,
  onHighlight,
}: LeaderboardBarRaceProps) {
  const { openProfile } = useClimberProfile();
  const slice = rows.slice(0, limit);
  if (slice.length === 0) return null;

  const leaderValue = slice[0]?.value ?? 1;

  return (
    <ul className="space-y-2">
      <AnimatePresence mode="popLayout">
        {slice.map((row, index) => {
          const width = barWidthPct(row.value, leaderValue, higherIsBetter);
          const gap = gapFromLeaderPct(row.value, leaderValue, higherIsBetter);
          const isLeader = row.rank === 1;
          const isHighlighted =
            highlightedId === row.athlete.id ||
            (highlightedId == null && row.isCurrentUser);

          return (
            <motion.li
              key={row.athlete.id}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ delay: index * 0.03, duration: 0.25 }}
            >
              <button
                type="button"
                data-current-user={row.isCurrentUser ? "true" : undefined}
                onMouseEnter={() => onHighlight(row.athlete.id)}
                onMouseLeave={() => onHighlight(null)}
                onClick={() => openProfile(row.athlete.id)}
                className={cn(
                  "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-2.5 text-left transition-all sm:p-3",
                  "hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/5",
                  row.isCurrentUser
                    ? "border-teal-400/60 bg-gradient-to-r from-teal-50/90 to-white"
                    : "border-slate-200/90 bg-white",
                  isHighlighted && "border-teal-400/50 shadow-md shadow-teal-500/10"
                )}
              >
                {isLeader && (
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black tabular-nums",
                    row.rank === 1 && "bg-amber-500 text-black",
                    row.rank === 2 && "bg-slate-300 text-slate-900",
                    row.rank === 3 && "bg-amber-900 text-amber-50",
                    row.rank > 3 && "bg-slate-100 text-slate-600"
                  )}
                >
                  {row.rank}
                </span>
                <AvatarFrame
                  username={row.athlete.username}
                  avatarUrl={row.athlete.avatar_url}
                  lifetimeScore={row.athlete.current_pump_score}
                  size="sm"
                  plain
                />
                <div className="relative z-10 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {row.athlete.username}
                      {row.isCurrentUser && (
                        <span className="ml-1.5 text-[10px] font-semibold uppercase text-teal-600">
                          you
                        </span>
                      )}
                    </p>
                    <div className="flex shrink-0 items-baseline gap-2">
                      {!isLeader && gap > 0 && (
                        <span className="hidden text-[10px] text-slate-400 sm:inline">
                          −{gap}%
                        </span>
                      )}
                      <motion.p
                        key={`${metricKey}-${row.displayValue}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-black tabular-nums text-teal-700 sm:text-base"
                      >
                        {row.displayValue}
                      </motion.p>
                    </div>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100/90">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        isLeader
                          ? "bg-gradient-to-r from-amber-500 via-amber-400 to-teal-500"
                          : "bg-gradient-to-r from-teal-700 to-teal-400"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{
                        duration: 0.55,
                        delay: index * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </div>
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
