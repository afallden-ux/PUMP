"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarEvolution } from "@/components/avatar/AvatarEvolution";
import { CrewBanner } from "@/components/crew/CrewBanner";
import { CrewBattlesPanel } from "@/components/crew/CrewBattlesPanel";
import { CrewOnboarding } from "@/components/crew/CrewOnboarding";
import { CouchOfShame } from "@/components/dashboard/CouchOfShame";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { QuickLogFab } from "@/components/dashboard/QuickLogFab";
import { HoursComparisonChart } from "@/components/dashboard/HoursComparisonChart";
import { SessionHistoryList } from "@/components/dashboard/SessionHistoryList";
import { TrainingHistoryChart } from "@/components/dashboard/TrainingHistoryChart";
import { CrewFeed } from "@/components/social/CrewFeed";
import { LogWorkoutModal } from "@/components/workout/LogWorkoutModal";
import { isOnCouchOfShame } from "@/lib/utils/couchOfShame";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { useWorkoutHistory } from "@/lib/hooks/useWorkoutHistory";
import type { CrewMembership, LeaderboardEntry, Profile } from "@/types/app";

interface DashboardClientProps {
  currentProfile: Profile;
  membership: CrewMembership | null;
  crewProfiles: Profile[];
  initialLeaderboard: LeaderboardEntry[];
}

export function DashboardClient({
  currentProfile,
  membership,
  crewProfiles,
  initialLeaderboard,
}: DashboardClientProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const memberIds = crewProfiles.map((p) => p.id);

  const { entries, refresh } = useLeaderboard(initialLeaderboard, memberIds);
  const { logs, loading: historyLoading } = useWorkoutHistory(
    currentProfile.id,
    refreshKey
  );

  const slackers = crewProfiles.filter(isOnCouchOfShame);
  const activeClimbers = crewProfiles.filter((p) => !isOnCouchOfShame(p));

  function handleLogged() {
    refresh();
    setRefreshKey((k) => k + 1);
    router.refresh();
  }

  if (!membership) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-black text-orange-400">PUMP</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Private bouldering accountability
          </p>
        </div>
        <CrewOnboarding />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-28 pt-4">
      <CrewBanner membership={membership} />

      <CrewBattlesPanel
        membership={membership}
        isOwner={membership.role === "owner"}
        refreshKey={refreshKey}
      />

      <AvatarEvolution profile={currentProfile} />

      <div className="hidden md:block">
        <LogWorkoutModal userId={currentProfile.id} onLogged={handleLogged} />
      </div>

      <CrewFeed
        currentUserId={currentProfile.id}
        memberIds={memberIds}
        crewName={membership.crew.name}
        refreshKey={refreshKey}
      />

      <HoursComparisonChart
        currentUser={currentProfile}
        crew={crewProfiles}
        refreshKey={refreshKey}
      />

      <Leaderboard
        entries={entries}
        currentUserId={currentProfile.id}
        crewName={membership.crew.name}
      />

      <TrainingHistoryChart logs={logs} loading={historyLoading} />
      <SessionHistoryList logs={logs} loading={historyLoading} />

      <section className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Still climbing ({activeClimbers.length})
        </h3>
        <p className="text-xs text-muted-foreground">
          Lifetime pump scores — {membership.crew.name} only on the boards above.
        </p>
      </section>

      <CouchOfShame slackers={slackers} />

      <QuickLogFab userId={currentProfile.id} onLogged={handleLogged} />
    </div>
  );
}
