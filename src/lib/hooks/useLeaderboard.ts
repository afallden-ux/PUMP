"use client";

import { useCallback, useEffect, useState } from "react";
import {
  mapLeaderboardRows,
  mapLifetimeLeaderboard,
} from "@/lib/data/leaderboard";
import { createClient } from "@/lib/supabase/client";
import type { LeaderboardEntry } from "@/types/app";

export function useLeaderboard(
  initialWeekly: LeaderboardEntry[],
  initialLifetime: LeaderboardEntry[],
  memberIds: string[]
) {
  const [weeklyEntries, setWeeklyEntries] = useState(initialWeekly);
  const [lifetimeEntries, setLifetimeEntries] = useState(initialLifetime);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("leaderboard_7d").select("*");
    if (data) {
      const ids = memberIds.length > 0 ? memberIds : undefined;
      setWeeklyEntries(mapLeaderboardRows(data, ids));
      setLifetimeEntries(mapLifetimeLeaderboard(data, ids));
    }
  }, [memberIds.join(",")]);

  useEffect(() => {
    setWeeklyEntries(initialWeekly);
    setLifetimeEntries(initialLifetime);
  }, [initialWeekly, initialLifetime]);

  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-refresh")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "workout_logs" },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refresh]);

  return { weeklyEntries, lifetimeEntries, refresh };
}
