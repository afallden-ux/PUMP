"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { FeedPagination } from "@/components/social/FeedPagination";
import { SessionFeedCard } from "@/components/social/SessionFeedCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FEED_PAGE_SIZE, useActivityFeed } from "@/lib/hooks/useActivityFeed";
import type { SessionCountsMap } from "@/lib/data/sessionBadges";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  currentUserId: string;
  memberCountsMap?: SessionCountsMap;
  refreshKey?: number;
  variant?: "page" | "embedded";
  /** Dashboard preview: N items, no pagination */
  previewCount?: number;
}

export function ActivityFeed({
  currentUserId,
  memberCountsMap,
  refreshKey = 0,
  variant = "embedded",
  previewCount,
}: ActivityFeedProps) {
  const paginated = previewCount === undefined;
  const [page, setPage] = useState(0);
  const pageSize = previewCount ?? FEED_PAGE_SIZE;

  useEffect(() => {
    setPage(0);
  }, [refreshKey]);

  const { sessions, total, totalPages, loading, refresh } = useActivityFeed({
    page: paginated ? page : 0,
    pageSize,
    refreshKey,
  });

  const isPage = variant === "page";

  return (
    <section
      className={cn(
        "space-y-3",
        isPage
          ? "space-y-4"
          : "rounded-2xl border border-orange-500/25 bg-card/50 p-4 lg:p-5"
      )}
    >
      <SectionHeader
        icon={MessageCircle}
        title={isPage ? "Feed" : "Latest activity"}
        subtitle="Recent sessions with photos, notes, likes and comments."
      />

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading sessions…
        </p>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 py-10 px-4 text-center">
          <p className="text-sm font-semibold text-foreground">No sessions yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Log a workout with a photo or note — it shows up here for everyone.
          </p>
        </div>
      ) : (
        <>
          <ul className={cn("space-y-4", isPage && "mx-auto w-full max-w-2xl")}>
            {sessions.map((session) => (
              <li key={session.id}>
                <SessionFeedCard
                  session={session}
                  currentUserId={currentUserId}
                  authorBadgeCounts={memberCountsMap?.[session.user_id]}
                  onUpdated={refresh}
                />
              </li>
            ))}
          </ul>

          {paginated && (
            <FeedPagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}

          {previewCount !== undefined && total > previewCount && (
            <p className="text-center text-sm text-muted-foreground">
              +{total - previewCount} more on the Feed tab
            </p>
          )}
        </>
      )}
    </section>
  );
}
