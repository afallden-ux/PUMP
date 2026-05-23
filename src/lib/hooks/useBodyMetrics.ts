"use client";

import { useCallback, useEffect, useState } from "react";
import type { BodyMetricType } from "@/lib/constants/bodyMetrics";
import { createClient } from "@/lib/supabase/client";

export interface BodyMetricLog {
  id: string;
  user_id: string;
  metric_type: BodyMetricType;
  value_kg: number;
  recorded_at: string;
}

export function useBodyMetrics(userId: string) {
  const [logs, setLogs] = useState<BodyMetricLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("body_metric_logs")
      .select("id, user_id, metric_type, value_kg, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: true });

    if (!error && data) {
      setLogs(
        data.map((row) => ({
          id: row.id as string,
          user_id: row.user_id as string,
          metric_type: row.metric_type as BodyMetricType,
          value_kg: Number(row.value_kg),
          recorded_at: row.recorded_at as string,
        }))
      );
    } else {
      setLogs([]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { logs, loading, refresh };
}
