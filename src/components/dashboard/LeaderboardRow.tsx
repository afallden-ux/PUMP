"use client";

import { motion } from "framer-motion";
import { Crown, TrendingUp } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry } from "@/types/app";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  mode?: "weekly" | "lifetime";
}

export function LeaderboardRow({
  entry,
  isCurrentUser,
  mode = "weekly",
}: LeaderboardRowProps) {
  const isLifetime = mode === "lifetime";
  const isTop = entry.rank === 1;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        isCurrentUser
          ? "border-orange-500/60 bg-orange-500/10"
          : "border-border/60 bg-card/50"
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
          isTop ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground"
        }`}
      >
        {isTop ? <Crown className="size-4" /> : entry.rank}
      </span>

      <AvatarFrame
        username={entry.username}
        avatarUrl={entry.avatar_url}
        lifetimeScore={entry.current_pump_score}
        size="sm"
        plain
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-bold">{entry.username}</p>
          {isCurrentUser && (
            <Badge variant="secondary" className="text-[10px]">
              You
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-orange-400/90">{entry.rank_title}</p>
        <p className="text-[10px] text-muted-foreground">
          Lifetime: {entry.current_pump_score.toLocaleString()} · {entry.sessions_7d}{" "}
          sessions this week
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="flex items-center justify-end gap-1 text-lg font-black text-orange-400">
          {isLifetime ? (
            entry.current_pump_score.toLocaleString()
          ) : (
            <>
              <TrendingUp className="size-4" />
              {entry.points_7d}
            </>
          )}
        </p>
        <p className="text-[10px] uppercase text-muted-foreground">
          {isLifetime ? "lifetime pts" : "7-day pts"}
        </p>
      </div>
    </motion.li>
  );
}
