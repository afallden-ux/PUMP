"use client";

import { MessageCircle } from "lucide-react";
import { SessionFeedCard } from "@/components/social/SessionFeedCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
      <SectionHeader
        icon={MessageCircle}
        title={`${crewName} feed`}
        subtitle="Every crew session lives here — tap the heart for kudos, type below to comment. Scroll down for your personal charts."
      />

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading the chaos...
        </p>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 py-10 px-4 text-center">
          <p className="text-sm font-semibold text-foreground">No sessions in the feed yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Log a workout with the orange + button — add a photo and your crew can kudo &
            comment here.
          </p>
        </div>
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
