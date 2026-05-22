"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CrewFeedSession } from "@/types/app";

const FEED_LIMIT = 30;

export function useActivityFeed(refreshKey = 0) {
  const [sessions, setSessions] = useState<CrewFeedSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workout_logs")
      .select(
        `
        *,
        profiles ( id, username, avatar_url, current_pump_score, home_crag ),
        session_comments (
          id, workout_log_id, user_id, body, created_at,
          profiles ( username, avatar_url )
        ),
        session_kudos (
          id, workout_log_id, user_id, created_at,
          profiles ( username )
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(FEED_LIMIT);

    if (!error && data) {
      setSessions(
        (data as unknown as CrewFeedSession[]).map((row) => ({
          ...row,
          session_comments: row.session_comments ?? [],
          session_kudos: row.session_kudos ?? [],
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workout_logs" },
        () => refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "session_comments" },
        () => refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "session_kudos" },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { sessions, loading, refresh };
}
