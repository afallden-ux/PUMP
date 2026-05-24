"use client";

import { useCallback, useEffect, useState } from "react";
import type { AssessmentLog } from "@/lib/assessments/types";
import type { AssessmentType } from "@/lib/constants/assessments";
import { createClient } from "@/lib/supabase/client";

function mapRow(row: Record<string, unknown>): AssessmentLog {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    assessment_type: row.assessment_type as AssessmentType,
    recorded_at: row.recorded_at as string,
    body_weight_kg: row.body_weight_kg != null ? Number(row.body_weight_kg) : null,
    resistance_kg: row.resistance_kg != null ? Number(row.resistance_kg) : null,
    time_under_tension_s:
      row.time_under_tension_s != null ? Number(row.time_under_tension_s) : null,
    total_duration_s:
      row.total_duration_s != null ? Number(row.total_duration_s) : null,
    distance_cm: row.distance_cm != null ? Number(row.distance_cm) : null,
    sets: row.sets != null ? Number(row.sets) : null,
    reps: row.reps != null ? Number(row.reps) : null,
    notes: (row.notes as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

export function useAssessments(userId: string, type?: AssessmentType) {
  const [logs, setLogs] = useState<AssessmentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("assessment_logs")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false });

    if (type) {
      query = query.eq("assessment_type", type);
    }

    const { data, error } = await query;

    if (error) {
      if (error.message.includes("assessment_logs")) {
        setSchemaMissing(true);
      }
      setLogs([]);
    } else {
      setSchemaMissing(false);
      setLogs((data ?? []).map((row) => mapRow(row as Record<string, unknown>)));
    }
    setLoading(false);
  }, [userId, type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { logs, loading, schemaMissing, refresh };
}
