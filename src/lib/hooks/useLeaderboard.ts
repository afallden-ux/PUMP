"use client";

import { useCallback, useEffect, useState } from "react";
import { mapLeaderboardRows } from "@/lib/data/leaderboard";
import { createClient } from "@/lib/supabase/client";
import type { LeaderboardEntry } from "@/types/app";

export function useLeaderboard(initial: LeaderboardEntry[]) {
  const [entries, setEntries] = useState(initial);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("leaderboard_7d").select("*");
    if (data) setEntries(mapLeaderboardRows(data));
  }, [supabase]);

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
