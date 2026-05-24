"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { LeaderboardRow } from "@/components/dashboard/LeaderboardRow";
import type { LeaderboardEntry } from "@/types/app";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  crewName?: string;
  global?: boolean;
  mode?: "weekly" | "lifetime";
  hideTitle?: boolean;
}

export function Leaderboard({
  entries,
  currentUserId,
  crewName,
  global,
  mode = "weekly",
  hideTitle,
}: LeaderboardProps) {
  const isLifetime = mode === "lifetime";
  const active = isLifetime
    ? entries.filter((e) => e.current_pump_score > 0)
    : entries.filter((e) => e.points_7d > 0);
  const display = active.length > 0 ? active : entries;

  return (
    <section className="space-y-3">
      {!hideTitle && (
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-400" />
          <h3 className="text-lg font-black">
            {crewName
              ? `${crewName} — ${isLifetime ? "lifetime" : "week"}`
              : isLifetime
                ? "Lifetime CC"
                : "Winner of the Week"}
          </h3>
          <span className="text-xs text-muted-foreground">
            {isLifetime
              ? global
                ? "(all-time · everyone)"
                : "(all-time · crew)"
              : global
                ? "(last 7 days · everyone)"
                : "(last 7 days · crew)"}
          </span>
        </div>
      )}

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
              mode={mode}
            />
          ))}
        </motion.ul>
      )}
    </section>
  );
}
