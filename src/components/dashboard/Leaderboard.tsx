"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { LeaderboardRow } from "@/components/dashboard/LeaderboardRow";
import type { LeaderboardEntry } from "@/types/app";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const active = entries.filter((e) => e.points_7d > 0);
  const display = active.length > 0 ? active : entries;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="size-5 text-amber-400" />
        <h3 className="text-lg font-black">Winner of the Week</h3>
        <span className="text-xs text-muted-foreground">(last 7 days)</span>
      </div>

      {display.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No sessions logged yet. Someone&apos;s about to steal the crown — don&apos;t be
          last.
        </p>
      ) : (
        <motion.ul layout className="space-y-2">
          {display.map((entry) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              isCurrentUser={entry.id === currentUserId}
            />
          ))}
        </motion.ul>
      )}
    </section>
  );
}
