import { redirect } from "next/navigation";
import { FeedPageClient } from "@/components/feed/FeedPageClient";
import { fetchSessionCountsMap } from "@/lib/data/sessionBadges";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/app";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: currentProfile }, { data: allProfiles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("profiles").select("id"),
  ]);

  if (!currentProfile) redirect("/login");

  const memberIds = (allProfiles ?? []).map((p) => p.id);
  const memberCountsMap = await fetchSessionCountsMap(supabase, memberIds);

  return (
    <FeedPageClient
      currentProfile={currentProfile as Profile}
      memberCountsMap={memberCountsMap}
    />
  );
}
