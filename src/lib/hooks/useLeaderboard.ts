"use client";

import { useCallback, useEffect, useState } from "react";
import { mapLeaderboardRows } from "@/lib/data/leaderboard";
import { filterLeaderboardToCrew } from "@/lib/data/crew";
import { createClient } from "@/lib/supabase/client";
import type { LeaderboardEntry } from "@/types/app";

export function useLeaderboard(
  initial: LeaderboardEntry[],
  memberIds: string[]
) {
  const [entries, setEntries] = useState(initial);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("leaderboard_7d").select("*");
    if (data) {
      const rows = memberIds.length > 0
        ? filterLeaderboardToCrew(data, memberIds)
        : mapLeaderboardRows(data);
      setEntries(rows);
    }
  }, [memberIds.join(",")]);

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

  return { entries, refresh };
}
