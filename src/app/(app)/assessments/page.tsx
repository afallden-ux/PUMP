import { redirect } from "next/navigation";
import { AssessmentsClient } from "@/components/assessments/AssessmentsClient";
import { appTitle } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/app";

export const metadata = {
  title: appTitle("Assessments"),
  description: "Log and track primary climbing assessments — ClimbCompare",
};

export default async function AssessmentsPage() {
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

  const normalized: Profile = {
    ...(profile as Profile),
    height_cm:
      profile.height_cm != null ? Number(profile.height_cm) : null,
  };

  return <AssessmentsClient profile={normalized} />;
}
