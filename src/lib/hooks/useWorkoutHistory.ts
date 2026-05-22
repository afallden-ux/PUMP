"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FontGrade } from "@/lib/constants/fontGrades";
import type { SessionType } from "@/lib/constants/sessionTypes";
import type { WorkoutLog } from "@/types/app";

const HISTORY_LIMIT = 40;

function normalizeLog(row: Record<string, unknown>): WorkoutLog {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    session_type: (row.session_type as SessionType) ?? "climbing",
    duration_minutes: row.duration_minutes as number,
    intensity_level: row.intensity_level as WorkoutLog["intensity_level"],
    total_points: row.total_points as number,
    photo_url: (row.photo_url as string | null) ?? null,
    is_moonboard: Boolean(row.is_moonboard),
    is_outdoors: Boolean(row.is_outdoors),
    hardest_grade: (row.hardest_grade as FontGrade | null) ?? null,
    created_at: row.created_at as string,
  };
}

export function useWorkoutHistory(userId: string, refreshKey = 0) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT);

    if (!error && data) {
      setLogs(data.map((row) => normalizeLog(row as Record<string, unknown>)));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  return { logs, loading, refresh };
}
