"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { QuickLogFab } from "@/components/dashboard/QuickLogFab";
import { PageHeader } from "@/components/layout/PageHeader";
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
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Social"
        title="Feed"
        subtitle="See what everyone's sending — like and comment on sessions."
        actions={
          <div className="hidden lg:block">
            <LogWorkoutModal userId={currentProfile.id} onLogged={handleLogged} />
          </div>
        }
      />

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
