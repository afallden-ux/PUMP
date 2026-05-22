"use client";

import { useRouter } from "next/navigation";
import { AvatarEvolution } from "@/components/avatar/AvatarEvolution";
import { CouchOfShame } from "@/components/dashboard/CouchOfShame";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { QuickLogFab } from "@/components/dashboard/QuickLogFab";
import { LogWorkoutModal } from "@/components/workout/LogWorkoutModal";
import { isOnCouchOfShame } from "@/lib/utils/couchOfShame";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import type { LeaderboardEntry, Profile } from "@/types/app";

interface DashboardClientProps {
  currentProfile: Profile;
  allProfiles: Profile[];
  initialLeaderboard: LeaderboardEntry[];
}

export function DashboardClient({
  currentProfile,
  allProfiles,
  initialLeaderboard,
}: DashboardClientProps) {
  const router = useRouter();
  const { entries, refresh } = useLeaderboard(initialLeaderboard);

  const slackers = allProfiles.filter(isOnCouchOfShame);
  const activeClimbers = allProfiles.filter((p) => !isOnCouchOfShame(p));

  function handleLogged() {
    refresh();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-28 pt-4">
      <AvatarEvolution profile={currentProfile} />

      <div className="hidden md:block">
        <LogWorkoutModal userId={currentProfile.id} onLogged={handleLogged} />
      </div>

      <Leaderboard entries={entries} currentUserId={currentProfile.id} />

      <section className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Still climbing ({activeClimbers.length})
        </h3>
        <p className="text-xs text-muted-foreground">
          Lifetime pump scores keep your avatar jacked forever.
        </p>
      </section>

      <CouchOfShame slackers={slackers} />

      <QuickLogFab userId={currentProfile.id} onLogged={handleLogged} />
    </div>
  );
}
