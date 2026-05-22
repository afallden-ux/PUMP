"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, MessageCircle, Users } from "lucide-react";
import { AvatarEvolution } from "@/components/avatar/AvatarEvolution";
import { CrewBanner } from "@/components/crew/CrewBanner";
import { CrewOnboarding } from "@/components/crew/CrewOnboarding";
import { CouchOfShame } from "@/components/dashboard/CouchOfShame";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
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
import type { CrewMembership, LeaderboardEntry, Profile } from "@/types/app";

type DashboardTab = "feed" | "stats";

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
  const [crewPromptDismissed, setCrewPromptDismissed] = useState(true);
  const [tab, setTab] = useState<DashboardTab>(membership ? "feed" : "stats");
  const memberIds = crewProfiles.map((p) => p.id);

  const { entries, refresh } = useLeaderboard(initialLeaderboard, memberIds);
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

  const showCrewPrompt = !membership && !crewPromptDismissed;

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-28 pt-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Welcome back
          </p>
          <h1 className="text-xl font-black">{currentProfile.username}</h1>
        </div>
        {membership && (
          <Link
            href="/crew"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
          >
            <Users className="size-4" />
            Crew
          </Link>
        )}
      </header>

      {showCrewPrompt && (
        <CrewOnboarding
          compact
          onLoneWolf={() => setCrewPromptDismissed(true)}
        />
      )}

      {membership && <CrewBanner membership={membership} />}

      <AvatarEvolution profile={currentProfile} />

      <div className="hidden md:block">
        <LogWorkoutModal userId={currentProfile.id} onLogged={handleLogged} />
      </div>

      <div
        className="flex rounded-xl border border-border/60 bg-muted/30 p-1"
        role="tablist"
      >
        {membership && (
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
        )}
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

      {tab === "feed" && membership && (
        <CrewFeed
          currentUserId={currentProfile.id}
          memberIds={memberIds}
          crewName={membership.crew.name}
          refreshKey={refreshKey}
        />
      )}

      {tab === "stats" && (
        <div className="space-y-6">
          {!membership && (
            <section className="rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 p-4 text-center text-sm text-muted-foreground">
              Lone wolf mode — global leaderboard.{" "}
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

          <Leaderboard
            entries={entries}
            currentUserId={currentProfile.id}
            crewName={membership?.crew.name}
            global={!membership}
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
            <p className="text-xs text-muted-foreground">
              {membership
                ? `Crew-only boards above · see all members on the Crew page.`
                : "Everyone on PUMP — log a session to leave the couch."}
            </p>
          </section>

          <CouchOfShame slackers={slackers} />
        </div>
      )}

      <QuickLogFab userId={currentProfile.id} onLogged={handleLogged} />
    </div>
  );
}
