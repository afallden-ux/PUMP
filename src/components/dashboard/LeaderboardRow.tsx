"use client";

import { motion } from "framer-motion";
import { Crown, Medal, TrendingUp } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { useClimberProfile } from "@/components/profile/ClimberProfileContext";
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
  const { openProfile } = useClimberProfile();
  const isLifetime = mode === "lifetime";
  const isTop = entry.rank === 1;
  const isSecond = !isLifetime && entry.rank === 2;
  const isThird = !isLifetime && entry.rank === 3;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-lg border ${
        isCurrentUser
          ? "border-teal-500/50 bg-teal-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => openProfile(entry.id)}
        className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-teal-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
        aria-label={`View ${entry.username}'s profile`}
      >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
          isTop
            ? "bg-amber-500 text-black"
            : isSecond
              ? "bg-zinc-300 text-zinc-900"
              : isThird
                ? "bg-amber-800 text-amber-50"
                : "bg-muted text-muted-foreground"
        }`}
      >
        {isTop ? (
          <Crown className="size-4" />
        ) : isSecond ? (
          <Medal className="size-4" />
        ) : isThird ? (
          <Medal className="size-4" />
        ) : (
          entry.rank
        )}
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
        <p className="truncate text-xs text-teal-600/90">{entry.rank_title}</p>
        <p className="text-[10px] text-muted-foreground">
          Lifetime: {entry.current_pump_score.toLocaleString()} · {entry.sessions_7d}{" "}
          sessions this week
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="flex items-center justify-end gap-1 text-lg font-black text-teal-600">
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
      </button>
    </motion.li>
  );
}
