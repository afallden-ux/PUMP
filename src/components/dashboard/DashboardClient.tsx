"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, MessageCircle, Users } from "lucide-react";
import { AvatarEvolution } from "@/components/avatar/AvatarEvolution";
import { CrewBanner } from "@/components/crew/CrewBanner";
import { CrewOnboarding } from "@/components/crew/CrewOnboarding";
import { CouchOfShame } from "@/components/dashboard/CouchOfShame";
import { LeaderboardsPanel } from "@/components/dashboard/LeaderboardsPanel";
import { QuickLogFab } from "@/components/dashboard/QuickLogFab";
import { HoursComparisonChart } from "@/components/dashboard/HoursComparisonChart";
import { SessionHistoryList } from "@/components/dashboard/SessionHistoryList";
import { TrainingHistoryChart } from "@/components/dashboard/TrainingHistoryChart";
import { CrewFeed } from "@/components/social/CrewFeed";
import { LogWorkoutModal } from "@/components/workout/LogWorkoutModal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isOnCouchOfShame } from "@/lib/utils/couchOfShame";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { useWorkoutHistory } from "@/lib/hooks/useWorkoutHistory";
import type { SessionCounts, SessionCountsMap } from "@/lib/data/sessionBadges";
import type { CrewMembership, LeaderboardEntry, Profile } from "@/types/app";

type DashboardTab = "feed" | "stats";

interface DashboardClientProps {
  currentProfile: Profile;
  memberships: CrewMembership[];
  crewProfiles: Profile[];
  initialWeekly: LeaderboardEntry[];
  initialLifetime: LeaderboardEntry[];
  sessionCounts: SessionCounts;
  memberCountsMap: SessionCountsMap;
}

export function DashboardClient({
  currentProfile,
  memberships,
  crewProfiles,
  initialWeekly,
  initialLifetime,
  sessionCounts,
  memberCountsMap,
}: DashboardClientProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [crewPromptDismissed, setCrewPromptDismissed] = useState(true);
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(
    memberships[0]?.crew.id ?? null
  );
  const [tab, setTab] = useState<DashboardTab>(memberships.length > 0 ? "feed" : "stats");

  const activeMembership = useMemo(
    () => memberships.find((m) => m.crew.id === selectedCrewId) ?? memberships[0] ?? null,
    [memberships, selectedCrewId]
  );

  const leaderboardMemberIds = useMemo(
    () => activeMembership?.members.map((m) => m.id) ?? [],
    [activeMembership]
  );

  const { weeklyEntries, lifetimeEntries, refresh } = useLeaderboard(
    initialWeekly,
    initialLifetime,
    leaderboardMemberIds
  );

  const feedMemberIds = activeMembership?.members.map((m) => m.id) ?? [];

  const { logs, loading: historyLoading, refresh: refreshHistory } = useWorkoutHistory(
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

  function handleDeleted() {
    handleLogged();
    refreshHistory();
  }

  const showCrewPrompt = memberships.length === 0 && !crewPromptDismissed;
  const hasCrews = memberships.length > 0;

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-28 pt-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Welcome back
          </p>
          <h1 className="text-xl font-black">{currentProfile.username}</h1>
        </div>
        <Link
          href="/crew"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
        >
          <Users className="size-4" />
          Crew{memberships.length > 1 ? "s" : ""}
        </Link>
      </header>

      <LeaderboardsPanel
        weeklyEntries={weeklyEntries}
        lifetimeEntries={lifetimeEntries}
        currentUserId={currentProfile.id}
        crewName={activeMembership?.crew.name}
        global={!hasCrews}
      />

      {showCrewPrompt && (
        <CrewOnboarding
          compact
          onLoneWolf={() => setCrewPromptDismissed(true)}
        />
      )}

      {hasCrews && memberships.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {memberships.map((m) => (
            <button
              key={m.crew.id}
              type="button"
              onClick={() => setSelectedCrewId(m.crew.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-bold transition-colors",
                selectedCrewId === m.crew.id
                  ? "border-orange-500 bg-orange-600 text-white"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {m.crew.name}
            </button>
          ))}
        </div>
      )}

      {activeMembership && <CrewBanner membership={activeMembership} />}

      <AvatarEvolution profile={currentProfile} sessionCounts={sessionCounts} />

      <div className="hidden md:block">
        <LogWorkoutModal userId={currentProfile.id} onLogged={handleLogged} />
      </div>

      {hasCrews && (
        <div
          className="flex rounded-xl border border-border/60 bg-muted/30 p-1"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "feed"}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition-colors",
              tab === "feed"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTab("feed")}
          >
            <MessageCircle className="size-4" />
            Feed
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "stats"}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition-colors",
              tab === "stats"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTab("stats")}
          >
            <BarChart3 className="size-4" />
            Stats
          </button>
        </div>
      )}

      {tab === "feed" && activeMembership && (
        <CrewFeed
          currentUserId={currentProfile.id}
          memberIds={feedMemberIds}
          crewName={activeMembership.crew.name}
          memberCountsMap={memberCountsMap}
          refreshKey={refreshKey}
        />
      )}

      {(tab === "stats" || !hasCrews) && (
        <div className="space-y-6">
          {!hasCrews && (
            <section className="rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 p-4 text-center text-sm text-muted-foreground">
              Lone wolf mode — global boards above.{" "}
              <Link href="/crew" className="font-semibold text-orange-400 underline">
                Join a crew
              </Link>{" "}
              for private feed, kudos, and comments.
            </section>
          )}

          <HoursComparisonChart
            currentUser={currentProfile}
            crew={crewProfiles}
            refreshKey={refreshKey}
          />

          <TrainingHistoryChart logs={logs} loading={historyLoading} />
          <SessionHistoryList
            logs={logs}
            userId={currentProfile.id}
            loading={historyLoading}
            onDeleted={handleDeleted}
          />

          <section className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Still climbing ({activeClimbers.length})
            </h3>
          </section>

          <CouchOfShame slackers={slackers} />
        </div>
      )}

      <QuickLogFab userId={currentProfile.id} onLogged={handleLogged} />
    </div>
  );
}
