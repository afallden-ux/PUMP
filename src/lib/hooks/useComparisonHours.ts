"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HoursRange } from "@/lib/utils/aggregateHours";
import type { WorkoutLog } from "@/types/app";

const CUTOFF_DAYS: Record<HoursRange, number> = {
  week: 84,
  month: 365,
  year: 365 * 3,
};

export function useComparisonHours(
  userIds: string[],
  range: HoursRange,
  refreshKey = 0
) {
  const [logsByUser, setLogsByUser] = useState<Record<string, WorkoutLog[]>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (userIds.length === 0) {
      setLogsByUser({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CUTOFF_DAYS[range]);

    const { data, error } = await supabase
      .from("workout_logs")
      .select("id, user_id, duration_minutes, created_at, intensity_level, total_points, photo_url, is_moonboard, is_outdoors, hardest_grade")
      .in("user_id", userIds)
      .gte("created_at", cutoff.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      setLoading(false);
      return;
    }

    const grouped: Record<string, WorkoutLog[]> = {};
    for (const id of userIds) grouped[id] = [];
    for (const row of (data ?? []) as WorkoutLog[]) {
      grouped[row.user_id]?.push(row);
    }
    setLogsByUser(grouped);
    setLoading(false);
  }, [userIds.join(","), range]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  return { logsByUser, loading, refresh };
}
