import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  fetchAllCrewMemberships,
  unionCrewMembers,
} from "@/lib/data/crew";
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

  const memberships = await fetchAllCrewMemberships(supabase, user.id);
  const activeMembership = memberships[0] ?? null;

  let crewProfiles: Profile[];
  if (memberships.length > 0) {
    crewProfiles = unionCrewMembers(memberships);
  } else {
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("*")
      .order("username");
    crewProfiles = (allProfiles ?? []) as Profile[];
  }

  const leaderboardMemberIds = activeMembership
    ? activeMembership.members.map((m) => m.id)
    : undefined;

  const memberIdsForBadges = crewProfiles.map((p) => p.id);

  const [{ data: currentProfile }, { data: leaderboard }, sessionCounts, memberCountsMap] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("leaderboard_7d").select("*"),
      fetchSessionCounts(supabase, user.id),
      fetchSessionCountsMap(supabase, memberIdsForBadges),
    ]);

  if (!currentProfile) redirect("/login");

  const initialWeekly = mapLeaderboardRows(leaderboard ?? [], leaderboardMemberIds);
  const initialLifetime = mapLifetimeLeaderboard(
    leaderboard ?? [],
    leaderboardMemberIds
  );

  return (
    <DashboardClient
      currentProfile={currentProfile as Profile}
      memberships={memberships}
      crewProfiles={crewProfiles}
      initialWeekly={initialWeekly}
      initialLifetime={initialLifetime}
      sessionCounts={sessionCounts}
      memberCountsMap={memberCountsMap}
    />
  );
}
