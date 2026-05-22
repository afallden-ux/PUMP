import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  fetchCrewMembership,
  filterLeaderboardToCrew,
} from "@/lib/data/crew";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/app";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: currentProfile }, { data: leaderboard }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("leaderboard_7d").select("*"),
  ]);

  if (!currentProfile) redirect("/login");

  const membership = await fetchCrewMembership(supabase, user.id);
  const memberIds = membership?.members.map((m) => m.id) ?? [];
  const crewProfiles = membership?.members ?? [];

  const initialLeaderboard =
    memberIds.length > 0
      ? filterLeaderboardToCrew(leaderboard ?? [], memberIds)
      : [];

  return (
    <DashboardClient
      currentProfile={currentProfile as Profile}
      membership={membership}
      crewProfiles={crewProfiles}
      initialLeaderboard={initialLeaderboard}
    />
  );
}
