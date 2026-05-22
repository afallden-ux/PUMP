"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Crew, CrewBattle } from "@/types/app";

export function useCrewBattles(crewId: string | undefined, refreshKey = 0) {
  const [battles, setBattles] = useState<CrewBattle[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!crewId) {
      setBattles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    await supabase.rpc("finalize_expired_battles");

    const { data, error } = await supabase
      .from("crew_battles")
      .select("*")
      .or(`challenger_crew_id.eq.${crewId},opponent_crew_id.eq.${crewId}`)
      .order("created_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const crewIds = new Set<string>();
    for (const b of data) {
      crewIds.add(b.challenger_crew_id);
      crewIds.add(b.opponent_crew_id);
    }

    const { data: crews } = await supabase
      .from("crews")
      .select("id, name, invite_code")
      .in("id", [...crewIds]);

    const crewMap = new Map((crews ?? []).map((c) => [c.id, c as Crew]));

    const withScores = await Promise.all(
      (data as CrewBattle[]).map(async (battle) => {
        const enriched: CrewBattle = {
          ...battle,
          challenger_crew: crewMap.get(battle.challenger_crew_id),
          opponent_crew: crewMap.get(battle.opponent_crew_id),
        };
        if (battle.status !== "active") return enriched;
        const { data: scores } = await supabase.rpc("compute_battle_scores", {
          p_battle_id: battle.id,
        });
        const s = scores as {
          challenger_points: number;
          opponent_points: number;
        } | null;
        return {
          ...enriched,
          challenger_points: s?.challenger_points ?? 0,
          opponent_points: s?.opponent_points ?? 0,
        };
      })
    );

    setBattles(withScores);
    setLoading(false);
  }, [crewId]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  useEffect(() => {
    if (!crewId) return;
    const supabase = createClient();
    const channel = supabase
      .channel("crew-battles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crew_battles" },
        () => refresh()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "workout_logs" },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [crewId, refresh]);

  return { battles, loading, refresh };
}
