import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CompareClient } from "@/components/compare/CompareClient";
import { mergeClimbersWithMocks } from "@/lib/compare/mockAthletes";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/app";

export default async function ComparePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, username, avatar_url, title, home_crag, height_cm, current_pump_score, last_logged_at"
    )
    .order("username");

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">Loading compare…</div>
      }
    >
      <CompareClient
        currentUserId={user.id}
        climbers={mergeClimbersWithMocks((profiles ?? []) as Profile[])}
      />
    </Suspense>
  );
}
