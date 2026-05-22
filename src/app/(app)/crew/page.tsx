import { redirect } from "next/navigation";
import { CrewPageClient } from "@/components/crew/CrewPageClient";
import { CrewOnboarding } from "@/components/crew/CrewOnboarding";
import { fetchCrewMembership } from "@/lib/data/crew";
import { fetchSessionCountsMap } from "@/lib/data/sessionBadges";
import { createClient } from "@/lib/supabase/server";

export default async function CrewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await fetchCrewMembership(supabase, user.id);

  if (!membership) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-black text-orange-400">Your crew</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create or join a crew — or browse every squad on PUMP.
          </p>
        </div>
        <CrewOnboarding />
        <p className="text-center text-sm">
          <a href="/crews" className="font-semibold text-orange-400 underline">
            Browse all crews
          </a>
        </p>
      </div>
    );
  }

  const memberIds = membership.members.map((m) => m.id);
  const memberCountsMap = await fetchSessionCountsMap(supabase, memberIds);

  return (
    <CrewPageClient
      membership={membership}
      currentUserId={user.id}
      memberCountsMap={memberCountsMap}
    />
  );
}
