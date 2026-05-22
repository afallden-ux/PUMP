import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  mapLeaderboardRows,
  mapLifetimeLeaderboard,
} from "@/lib/data/leaderboard";
import {
  fetchSessionCounts,
  fetchSessionCountsMap,
} from "@/lib/data/sessionBadges";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/app";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: currentProfile }, { data: allProfiles }, { data: leaderboard }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("profiles").select("*").order("username"),
      supabase.from("leaderboard_7d").select("*"),
    ]);

  if (!currentProfile) redirect("/login");

  const climbers = (allProfiles ?? []) as Profile[];
  const memberIds = climbers.map((p) => p.id);

  const [sessionCounts, memberCountsMap] = await Promise.all([
    fetchSessionCounts(supabase, user.id),
    fetchSessionCountsMap(supabase, memberIds),
  ]);

  const initialWeekly = mapLeaderboardRows(leaderboard ?? []);
  const initialLifetime = mapLifetimeLeaderboard(leaderboard ?? []);

  return (
    <DashboardClient
      currentProfile={currentProfile as Profile}
      allClimbers={climbers}
      initialWeekly={initialWeekly}
      initialLifetime={initialLifetime}
      sessionCounts={sessionCounts}
      memberCountsMap={memberCountsMap}
    />
  );
}
