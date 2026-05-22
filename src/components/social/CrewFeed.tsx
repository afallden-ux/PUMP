"use client";

import { Users } from "lucide-react";
import { SessionFeedCard } from "@/components/social/SessionFeedCard";
import { useCrewFeed } from "@/lib/hooks/useCrewFeed";

interface CrewFeedProps {
  currentUserId: string;
  memberIds: string[];
  crewName: string;
  refreshKey?: number;
}

export function CrewFeed({
  currentUserId,
  memberIds,
  crewName,
  refreshKey = 0,
}: CrewFeedProps) {
  const { sessions, loading, refresh } = useCrewFeed(memberIds, refreshKey);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-orange-400" />
        <h3 className="text-lg font-black">{crewName} feed</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Only your crew sees this — flex pics, kudos, and comments.
      </p>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading the chaos...
        </p>
      ) : sessions.length === 0 ? (
        <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          No crew sessions yet. Log one and drop a flex pic.
        </p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionFeedCard
              key={session.id}
              session={session}
              currentUserId={currentUserId}
              onUpdated={refresh}
            />
          ))}
        </div>
      )}
    </section>
  );
}
