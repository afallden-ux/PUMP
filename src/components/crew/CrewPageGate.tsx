"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CrewMembershipDiagnostic } from "@/components/crew/CrewMembershipDiagnostic";
import { CrewOnboarding } from "@/components/crew/CrewOnboarding";
import { CrewPageClient } from "@/components/crew/CrewPageClient";
import { useMyCrewMemberships } from "@/lib/hooks/useMyCrewMemberships";
import type { SessionCountsMap } from "@/lib/data/sessionBadges";
import type { CrewMembership } from "@/types/app";

interface CrewPageGateProps {
  userId: string;
  initialMemberships: CrewMembership[];
  memberCountsMap: SessionCountsMap;
}

export function CrewPageGate({
  userId,
  initialMemberships,
  memberCountsMap,
}: CrewPageGateProps) {
  const router = useRouter();
  const { memberships, loading, refresh } = useMyCrewMemberships(initialMemberships);

  function handleCrewSuccess() {
    refresh();
    router.refresh();
    router.push("/crew");
    window.location.assign("/crew");
  }

  if (loading && memberships.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-16 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-teal-600" />
        <p className="text-sm font-semibold">Loading your crews…</p>
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-black text-teal-600">Your crews</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join multiple crews — create one or use invite codes.
          </p>
        </div>
        <CrewMembershipDiagnostic userId={userId} loadedCrewCount={0} />
        <CrewOnboarding onSuccess={handleCrewSuccess} />
        <p className="text-center text-sm">
          <Link href="/crews" className="font-semibold text-teal-600 underline">
            Browse all crews
          </Link>
        </p>
      </div>
    );
  }

  return (
    <CrewPageClient
      memberships={memberships}
      currentUserId={userId}
      memberCountsMap={memberCountsMap}
    />
  );
}
