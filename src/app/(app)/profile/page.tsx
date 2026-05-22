import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { fetchSessionCounts } from "@/lib/data/sessionBadges";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/app";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const sessionCounts = await fetchSessionCounts(supabase, user.id);

  return (
    <ProfileClient profile={profile as Profile} sessionCounts={sessionCounts} />
  );
}
