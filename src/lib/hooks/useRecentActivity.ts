"use client";

import { useCallback, useEffect, useState } from "react";
import { buildTickerMessage } from "@/lib/utils/tickerMessage";
import { createClient } from "@/lib/supabase/client";
import type { IntensityLevel, WorkoutLogWithProfile } from "@/types/app";

const DEFAULT_TICKER =
  "WARNING: Someone is probably crushing a project right now. Log your session before your forearms file for unemployment.";

export function useRecentActivity() {
  const [message, setMessage] = useState(DEFAULT_TICKER);
  const supabase = createClient();

  const loadLatest = useCallback(async () => {
    const { data } = await supabase
      .from("workout_logs")
      .select("duration_minutes, intensity_level, created_at, profiles(username)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return;

    const row = data as WorkoutLogWithProfile & {
      profiles: { username: string } | { username: string }[];
    };
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    if (!profile?.username) return;

    setMessage(
      buildTickerMessage(
        profile.username,
        row.duration_minutes,
        row.intensity_level as IntensityLevel
      )
    );
  }, [supabase]);

  useEffect(() => {
    loadLatest();

    const channel = supabase
      .channel("ticker-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "workout_logs" },
        async (payload) => {
          const log = payload.new as {
            user_id: string;
            duration_minutes: number;
            intensity_level: number;
          };
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", log.user_id)
            .single();

          if (profile?.username) {
            setMessage(
              buildTickerMessage(
                profile.username,
                log.duration_minutes,
                log.intensity_level as IntensityLevel
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadLatest]);

  return message;
}
