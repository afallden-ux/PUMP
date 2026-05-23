"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { QuickLogFab } from "@/components/dashboard/QuickLogFab";
import { LogWorkoutModal } from "@/components/workout/LogWorkoutModal";
import type { SessionCountsMap } from "@/lib/data/sessionBadges";
import type { Profile } from "@/types/app";

interface FeedPageClientProps {
  currentProfile: Profile;
  memberCountsMap: SessionCountsMap;
}

export function FeedPageClient({
  currentProfile,
  memberCountsMap,
}: FeedPageClientProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  function handleLogged() {
    setRefreshKey((k) => k + 1);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 lg:px-8 lg:pb-8 lg:pt-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Social
          </p>
          <h1 className="text-2xl font-black lg:text-3xl">Feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See what everyone&apos;s sending — like and comment on sessions.
          </p>
        </div>
        <div className="hidden shrink-0 lg:block">
          <LogWorkoutModal
            userId={currentProfile.id}
            onLogged={handleLogged}
          />
        </div>
      </header>

      <ActivityFeed
        currentUserId={currentProfile.id}
        memberCountsMap={memberCountsMap}
        refreshKey={refreshKey}
        variant="page"
      />

      <QuickLogFab userId={currentProfile.id} onLogged={handleLogged} />
    </div>
  );
}
