"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FEED_LOG_SELECT, normalizeFeedSession } from "@/lib/data/feedSessions";
import type { CrewFeedSession } from "@/types/app";

export const FEED_PAGE_SIZE = 5;

interface UseActivityFeedOptions {
  page?: number;
  pageSize?: number;
  refreshKey?: number;
}

export function useActivityFeed({
  page = 0,
  pageSize = FEED_PAGE_SIZE,
  refreshKey = 0,
}: UseActivityFeedOptions = {}) {
  const [sessions, setSessions] = useState<CrewFeedSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("workout_logs")
      .select(FEED_LOG_SELECT, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setSessions(
        data.map((row) =>
          normalizeFeedSession(row as unknown as Record<string, unknown>)
        )
      );
      setTotal(count ?? 0);
    } else {
      setSessions([]);
      setTotal(0);
    }
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`activity-feed-${page}`)
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
  }, [refresh, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { sessions, total, totalPages, loading, refresh, pageSize };
}
