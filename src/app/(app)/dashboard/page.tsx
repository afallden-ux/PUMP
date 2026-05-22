import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { mapLeaderboardRows } from "@/lib/data/leaderboard";
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

  const initialLeaderboard = mapLeaderboardRows(leaderboard ?? []);

  return (
    <DashboardClient
      currentProfile={currentProfile as Profile}
      allProfiles={(allProfiles ?? []) as Profile[]}
      initialLeaderboard={initialLeaderboard}
    />
  );
}
