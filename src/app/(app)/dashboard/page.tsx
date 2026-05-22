import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  fetchCrewMembership,
  filterLeaderboardToCrew,
} from "@/lib/data/crew";
import { mapLeaderboardRows } from "@/lib/data/leaderboard";
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

  const membership = await fetchCrewMembership(supabase, user.id);

  let crewProfiles: Profile[];
  if (membership) {
    crewProfiles = membership.members;
  } else {
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("*")
      .order("username");
    crewProfiles = (allProfiles ?? []) as Profile[];
  }

  const memberIdsForBadges = membership
    ? membership.members.map((m) => m.id)
    : crewProfiles.map((p) => p.id);

  const [{ data: currentProfile }, { data: leaderboard }, sessionCounts, memberCountsMap] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("leaderboard_7d").select("*"),
      fetchSessionCounts(supabase, user.id),
      fetchSessionCountsMap(supabase, memberIdsForBadges),
    ]);

  if (!currentProfile) redirect("/login");

  const memberIds = membership
    ? membership.members.map((m) => m.id)
    : crewProfiles.map((p) => p.id);

  const initialLeaderboard = membership
    ? filterLeaderboardToCrew(leaderboard ?? [], memberIds)
    : mapLeaderboardRows(leaderboard ?? []);

  return (
    <DashboardClient
      currentProfile={currentProfile as Profile}
      membership={membership}
      crewProfiles={crewProfiles}
      initialLeaderboard={initialLeaderboard}
      sessionCounts={sessionCounts}
      memberCountsMap={memberCountsMap}
    />
  );
}
