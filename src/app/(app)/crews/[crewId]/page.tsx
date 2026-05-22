import { notFound, redirect } from "next/navigation";
import { PublicCrewDetailClient } from "@/components/crew/PublicCrewDetailClient";
import { fetchAllCrewMemberships } from "@/lib/data/crew";
import { fetchPublicCrewDetail } from "@/lib/data/publicCrews";
import { createClient } from "@/lib/supabase/server";

export default async function PublicCrewPage({
  params,
}: {
  params: Promise<{ crewId: string }>;
}) {
  const { crewId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const crew = await fetchPublicCrewDetail(supabase, crewId);
  if (!crew) notFound();

  const memberships = await fetchAllCrewMemberships(supabase, user.id);
  const isYourCrew = memberships.some((m) => m.crew.id === crewId);

  return (
    <PublicCrewDetailClient
      crew={crew}
      currentUserId={user.id}
      isYourCrew={isYourCrew}
    />
  );
}
