import { redirect } from "next/navigation";
import { isAssessmentType } from "@/lib/constants/assessments";

interface PageProps {
  params: Promise<{ type: string }>;
}

/** Legacy URL — assessments moved to /assessments */
export default async function ProfileAssessmentRedirect({ params }: PageProps) {
  const { type } = await params;
  if (!isAssessmentType(type)) {
    redirect("/assessments");
  }
  redirect(`/assessments/${type}`);
}
