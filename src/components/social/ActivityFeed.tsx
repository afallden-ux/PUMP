"use client";

import { MessageCircle } from "lucide-react";
import { SessionFeedCard } from "@/components/social/SessionFeedCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useActivityFeed } from "@/lib/hooks/useActivityFeed";
import type { SessionCountsMap } from "@/lib/data/sessionBadges";

interface ActivityFeedProps {
  currentUserId: string;
  memberCountsMap?: SessionCountsMap;
  refreshKey?: number;
}

export function ActivityFeed({
  currentUserId,
  memberCountsMap,
  refreshKey = 0,
}: ActivityFeedProps) {
  const { sessions, loading } = useActivityFeed(refreshKey);

  return (
    <section className="space-y-3 rounded-2xl border border-orange-500/25 bg-card/50 p-4 lg:p-5">
      <SectionHeader
        icon={MessageCircle}
        title="Activity feed"
        subtitle="Latest sessions from everyone on PUMP — kudos and comments."
      />

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading sessions…
        </p>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 py-10 px-4 text-center">
          <p className="text-sm font-semibold text-foreground">No sessions yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Log a workout — you&apos;ll show up here for everyone to see.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <SessionFeedCard
                session={session}
                currentUserId={currentUserId}
                authorBadgeCounts={memberCountsMap?.[session.user_id]}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
