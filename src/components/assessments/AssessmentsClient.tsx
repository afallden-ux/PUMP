"use client";

import { useState } from "react";
import { PrimaryAssessmentsSection } from "@/components/profile/assessments/PrimaryAssessmentsSection";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppCard } from "@/components/ui/AppCard";
import type { Profile } from "@/types/app";

interface AssessmentsClientProps {
  profile: Profile;
}

export function AssessmentsClient({ profile: initial }: AssessmentsClientProps) {
  const [profile, setProfile] = useState(initial);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-8">
      <PageHeader
        eyebrow="Benchmarks"
        title="Primary assessments"
        subtitle="Log finger strength, pull-ups, endurance, and flexibility — your compare and leaderboard stats pull from these tests."
      />

      <AppCard className="p-5">
        <PrimaryAssessmentsSection
          profile={profile}
          onHeightSaved={(height_cm) => setProfile((p) => ({ ...p, height_cm }))}
        />
      </AppCard>
    </div>
  );
}
