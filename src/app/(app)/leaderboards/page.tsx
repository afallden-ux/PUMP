import { redirect } from "next/navigation";
import { LeaderboardsClient } from "@/components/leaderboards/LeaderboardsClient";
import { fetchLeaderboardAthletes } from "@/lib/leaderboards/aggregate";
import { createClient } from "@/lib/supabase/server";

export default async function LeaderboardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const athletes = await fetchLeaderboardAthletes(supabase);

  return <LeaderboardsClient athletes={athletes} currentUserId={user.id} />;
}
