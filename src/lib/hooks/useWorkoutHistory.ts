"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FontGrade } from "@/lib/constants/fontGrades";
import type { SessionType } from "@/lib/constants/sessionTypes";
import type { WorkoutLog } from "@/types/app";

const HISTORY_LIMIT = 40;

export const SESSION_HISTORY_PAGE_SIZE = 5;

const HISTORY_SELECT = `
  id,
  user_id,
  session_type,
  duration_minutes,
  intensity_level,
  total_points,
  photo_url,
  notes,
  is_moonboard,
  is_outdoors,
  hardest_grade,
  created_at
`;

function normalizeLog(row: Record<string, unknown>): WorkoutLog {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    session_type: (row.session_type as SessionType) ?? "climbing",
    duration_minutes: row.duration_minutes as number,
    intensity_level: row.intensity_level as WorkoutLog["intensity_level"],
    total_points: row.total_points as number,
    photo_url: (row.photo_url as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
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

export function usePaginatedWorkoutHistory(
  userId: string,
  page: number,
  refreshKey = 0
) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const from = page * SESSION_HISTORY_PAGE_SIZE;
    const to = from + SESSION_HISTORY_PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("workout_logs")
      .select(HISTORY_SELECT, { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setLogs(data.map((row) => normalizeLog(row as Record<string, unknown>)));
      setTotal(count ?? 0);
    } else {
      setLogs([]);
      setTotal(0);
    }
    setLoading(false);
  }, [userId, page]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / SESSION_HISTORY_PAGE_SIZE));

  return { logs, total, totalPages, loading, refresh, pageSize: SESSION_HISTORY_PAGE_SIZE };
}
