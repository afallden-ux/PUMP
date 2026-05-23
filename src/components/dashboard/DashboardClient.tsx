"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarEvolution } from "@/components/avatar/AvatarEvolution";
import { CouchOfShame } from "@/components/dashboard/CouchOfShame";
import { HoursComparisonChart } from "@/components/dashboard/HoursComparisonChart";
import { LeaderboardsPanel } from "@/components/dashboard/LeaderboardsPanel";
import { PlatformWeeklyChart } from "@/components/dashboard/PlatformWeeklyChart";
import { QuickLogFab } from "@/components/dashboard/QuickLogFab";
import { SessionHistoryList } from "@/components/dashboard/SessionHistoryList";
import { SessionTypeBreakdownChart } from "@/components/dashboard/SessionTypeBreakdownChart";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { TrainingHistoryChart } from "@/components/dashboard/TrainingHistoryChart";
import Link from "next/link";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { LogWorkoutModal } from "@/components/workout/LogWorkoutModal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, Clock, MessageCircle, TrendingUp } from "lucide-react";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { isOnCouchOfShame } from "@/lib/utils/couchOfShame";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { useWorkoutHistory } from "@/lib/hooks/useWorkoutHistory";
import type { SessionCounts, SessionCountsMap } from "@/lib/data/sessionBadges";
import type { LeaderboardEntry, Profile } from "@/types/app";

interface DashboardClientProps {
  currentProfile: Profile;
  allClimbers: Profile[];
  initialWeekly: LeaderboardEntry[];
  initialLifetime: LeaderboardEntry[];
  sessionCounts: SessionCounts;
  memberCountsMap: SessionCountsMap;
}

export function DashboardClient({
  currentProfile,
  allClimbers,
  initialWeekly,
  initialLifetime,
  sessionCounts,
  memberCountsMap,
}: DashboardClientProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const { weeklyEntries, lifetimeEntries, refresh } = useLeaderboard(
    initialWeekly,
    initialLifetime
  );

  const { logs, loading: historyLoading, refresh: refreshHistory } = useWorkoutHistory(
    currentProfile.id,
    refreshKey
  );

  const slackers = allClimbers.filter(isOnCouchOfShame);
  const activeCount = allClimbers.length - slackers.length;

  function handleLogged() {
    refresh();
    setRefreshKey((k) => k + 1);
    router.refresh();
  }

  function handleDeleted() {
    handleLogged();
    refreshHistory();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 lg:px-8 lg:pb-8 lg:pt-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            PUMP board
          </p>
          <h1 className="text-2xl font-black lg:text-3xl">{currentProfile.username}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {allClimbers.length} registered climbers · {activeCount} active this week
          </p>
        </div>
        <div className="hidden shrink-0 lg:block">
          <LogWorkoutModal userId={currentProfile.id} onLogged={handleLogged} />
        </div>
      </header>

      <div className="space-y-6">
        <StatsOverview
          profile={currentProfile}
          sessionCounts={sessionCounts}
          weeklyEntries={weeklyEntries}
          recentLogs={logs}
        />

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-5">
            <LeaderboardsPanel
              weeklyEntries={weeklyEntries}
              lifetimeEntries={lifetimeEntries}
              currentUserId={currentProfile.id}
            />
            <div className="hidden lg:block">
              <AvatarEvolution
                profile={currentProfile}
                sessionCounts={sessionCounts}
              />
            </div>
          </div>

          <div className="space-y-3 lg:col-span-7">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-muted-foreground">Recent feed</p>
              <Link
                href="/feed"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5"
                )}
              >
                <MessageCircle className="size-4" />
                Open feed
              </Link>
            </div>
            <ActivityFeed
              currentUserId={currentProfile.id}
              memberCountsMap={memberCountsMap}
              refreshKey={refreshKey}
              previewCount={2}
            />
          </div>
        </div>

        <CollapsibleSection
          title="Compare hours"
          subtitle="You vs everyone on the board"
          icon={Clock}
          defaultOpen={false}
          className="scroll-mt-20"
        >
          <div id="compare">
            <HoursComparisonChart
              currentUser={currentProfile}
              climbers={allClimbers}
              refreshKey={refreshKey}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Platform weekly"
          subtitle="7-day leaderboard snapshot"
          icon={TrendingUp}
          defaultOpen={false}
        >
          <PlatformWeeklyChart entries={weeklyEntries} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Your training charts"
          subtitle="Points, duration, session mix"
          icon={BarChart3}
          defaultOpen
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <TrainingHistoryChart logs={logs} loading={historyLoading} />
            <SessionTypeBreakdownChart logs={logs} loading={historyLoading} />
          </div>
        </CollapsibleSection>

        <div className="grid gap-6 lg:grid-cols-2">
          <SessionHistoryList
            userId={currentProfile.id}
            refreshKey={refreshKey}
            onDeleted={handleDeleted}
          />
          <div className="space-y-6">
            <section className="rounded-xl border border-border/60 bg-card/50 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Still climbing ({activeCount})
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Logged within the last 96 hours
              </p>
            </section>
            <CouchOfShame slackers={slackers} />
            <div className="lg:hidden">
              <AvatarEvolution
                profile={currentProfile}
                sessionCounts={sessionCounts}
              />
            </div>
          </div>
        </div>
      </div>

      <QuickLogFab userId={currentProfile.id} onLogged={handleLogged} />
    </div>
  );
}
