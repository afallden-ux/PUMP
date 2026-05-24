"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Clock, MessageCircle, TrendingUp } from "lucide-react";
import { AvatarEvolution } from "@/components/avatar/AvatarEvolution";
import { CouchOfShame } from "@/components/dashboard/CouchOfShame";
import { HoursComparisonChart } from "@/components/dashboard/HoursComparisonChart";
import { PlatformWeeklyChart } from "@/components/dashboard/PlatformWeeklyChart";
import { QuickLogFab } from "@/components/dashboard/QuickLogFab";
import { SessionHistoryList } from "@/components/dashboard/SessionHistoryList";
import { SessionTypeBreakdownChart } from "@/components/dashboard/SessionTypeBreakdownChart";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { TrainingHistoryChart } from "@/components/dashboard/TrainingHistoryChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { LogWorkoutModal } from "@/components/workout/LogWorkoutModal";
import { AppCard } from "@/components/ui/AppCard";
import { buttonVariants } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { cn } from "@/lib/utils";
import { APP_SHORT } from "@/lib/brand";
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
    <>
      <PageHeader
        eyebrow={`${APP_SHORT} board`}
        title={currentProfile.username}
        subtitle={`${allClimbers.length} climbers on the board · ${activeCount} active this week`}
        actions={
          <div className="hidden lg:block">
            <LogWorkoutModal userId={currentProfile.id} onLogged={handleLogged} />
          </div>
        }
      />

      <div className="space-y-5">
        <StatsOverview
          profile={currentProfile}
          sessionCounts={sessionCounts}
          weeklyEntries={weeklyEntries}
          recentLogs={logs}
        />

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="hidden lg:col-span-5 lg:block">
            <AvatarEvolution
              profile={currentProfile}
              sessionCounts={sessionCounts}
            />
          </div>

          <AppCard className="space-y-3 p-4 lg:col-span-7 lg:col-start-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-700">Recent feed</p>
              <Link
                href="/feed"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
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
          </AppCard>
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
          subtitle="7-day points snapshot — full boards on Leaderboards"
          icon={TrendingUp}
          defaultOpen={false}
        >
          <PlatformWeeklyChart entries={weeklyEntries} />
          <p className="mt-3 text-center text-sm">
            <Link
              href="/leaderboards"
              className="font-semibold text-teal-700 hover:text-teal-800"
            >
              Open all leaderboards →
            </Link>
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          title="Your training charts"
          subtitle="Points, duration, session mix"
          icon={BarChart3}
          defaultOpen
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <TrainingHistoryChart logs={logs} loading={historyLoading} />
            <SessionTypeBreakdownChart logs={logs} loading={historyLoading} />
          </div>
        </CollapsibleSection>

        <div className="grid gap-5 lg:grid-cols-2">
          <SessionHistoryList
            userId={currentProfile.id}
            refreshKey={refreshKey}
            onDeleted={handleDeleted}
          />
          <div className="space-y-5">
            <AppCard className="p-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Still climbing ({activeCount})
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Logged within the last 96 hours
              </p>
            </AppCard>
            <CouchOfShame slackers={slackers} />
            <div className="lg:hidden">
              <AvatarEvolution profile={currentProfile} sessionCounts={sessionCounts} />
            </div>
          </div>
        </div>
      </div>

      <QuickLogFab userId={currentProfile.id} onLogged={handleLogged} />
    </>
  );
}
