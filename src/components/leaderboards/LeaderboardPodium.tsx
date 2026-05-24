"use client";

import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { useClimberProfile } from "@/components/profile/ClimberProfileContext";
import type { RankedLeaderboardRow } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils";

const PODIUM_ORDER = [1, 0, 2] as const;

interface LeaderboardPodiumProps {
  rows: RankedLeaderboardRow[];
}

export function LeaderboardPodium({ rows }: LeaderboardPodiumProps) {
  const { openProfile } = useClimberProfile();
  const top3 = rows.slice(0, 3);
  if (top3.length === 0) return null;

  const ordered = PODIUM_ORDER.map((i) => top3[i]).filter(Boolean);

  return (
    <div className="grid grid-cols-3 items-end gap-2 px-2 pb-2 pt-4 sm:gap-4">
      {ordered.map((row, visualIndex) => {
        const place = row.rank;
        const isFirst = place === 1;
        const heights = { 1: "h-28 sm:h-36", 2: "h-20 sm:h-28", 3: "h-16 sm:h-24" };
        const height = heights[place as 1 | 2 | 3] ?? "h-16";

        return (
          <motion.button
            key={row.athlete.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: visualIndex * 0.08 }}
            onClick={() => openProfile(row.athlete.id)}
            className={cn(
              "flex flex-col items-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40",
              row.isCurrentUser && "ring-2 ring-teal-500/30",
              isFirst && "border-amber-200 bg-gradient-to-b from-amber-50/80 to-white"
            )}
          >
            <div
              className={cn(
                "mb-2 flex w-full flex-col items-center justify-end rounded-t-lg bg-slate-100/80",
                height
              )}
            >
              <span
                className={cn(
                  "mb-2 flex size-9 items-center justify-center rounded-full text-sm font-bold",
                  place === 1 && "bg-amber-500 text-black",
                  place === 2 && "bg-slate-300 text-slate-800",
                  place === 3 && "bg-amber-800 text-amber-50"
                )}
              >
                {place === 1 ? (
                  <Crown className="size-5" />
                ) : (
                  <Medal className="size-4" />
                )}
              </span>
              <AvatarFrame
                username={row.athlete.username}
                avatarUrl={row.athlete.avatar_url}
                lifetimeScore={row.athlete.current_pump_score}
                size={isFirst ? "md" : "sm"}
                plain
              />
            </div>
            <p className="max-w-full truncate text-sm font-bold text-slate-800">
              {row.athlete.username}
            </p>
            <p className="mt-0.5 text-lg font-black tabular-nums text-teal-700">
              {row.displayValue}
            </p>
            {row.isCurrentUser && (
              <span className="mt-1 text-[10px] font-semibold uppercase text-teal-600">
                You
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
