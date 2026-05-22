import { redirect } from "next/navigation";
import { CrewDirectoryClient } from "@/components/crew/CrewDirectoryClient";
import { fetchPublicCrewList } from "@/lib/data/publicCrews";
import { createClient } from "@/lib/supabase/server";

export default async function CrewsDirectoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const crews = await fetchPublicCrewList(supabase);

  return <CrewDirectoryClient crews={crews} />;
}
