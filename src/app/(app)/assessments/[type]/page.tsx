import { notFound, redirect } from "next/navigation";
import { AssessmentDetailClient } from "@/components/profile/assessments/AssessmentDetailClient";
import { isAssessmentType } from "@/lib/constants/assessments";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/app";

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const { type } = await params;
  if (!isAssessmentType(type)) notFound();

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

  return <AssessmentDetailClient profile={normalized} type={type} />;
}
