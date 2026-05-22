"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Swords, Users } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { CrewBanner } from "@/components/crew/CrewBanner";
import { CrewBattlesPanel } from "@/components/crew/CrewBattlesPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeShowcase } from "@/components/profile/BadgeShowcase";
import type { SessionCounts } from "@/lib/data/sessionBadges";
import { isOnCouchOfShame } from "@/lib/utils/couchOfShame";
import { formatRelativeTime } from "@/lib/utils/dates";
import type { CrewMembership } from "@/types/app";

interface CrewPageClientProps {
  membership: CrewMembership;
  currentUserId: string;
  sessionCounts: SessionCounts;
}

export function CrewPageClient({
  membership,
  currentUserId,
  sessionCounts,
}: CrewPageClientProps) {
  const sortedMembers = [...membership.members].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return b.current_pump_score - a.current_pump_score;
  });

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-10 pt-4">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          aria-label="Back to board"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black">{membership.crew.name}</h1>
          <p className="text-xs text-muted-foreground">Crew HQ</p>
        </div>
        <Shield className="size-6 text-orange-400" />
      </div>

      <CrewBanner membership={membership} />

      <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 p-3 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Your badges
        </p>
        <BadgeShowcase counts={sessionCounts} max={6} size="md" />
      </div>

      <section className="space-y-3">
        <SectionHeader
          icon={Users}
          title={`Members (${membership.members.length})`}
          subtitle="Lifetime pump score and last session — tap Board for the weekly race."
        />
        <ul className="space-y-2">
          {sortedMembers.map((member) => {
            const isYou = member.id === currentUserId;
            const onCouch = isOnCouchOfShame(member);
            return (
              <li key={member.id}>
                <Card
                  className={
                    isYou
                      ? "border-orange-500/50 bg-orange-500/5"
                      : "border-border/60 bg-card/80"
                  }
                >
                  <CardContent className="flex items-center gap-3 py-3">
                    <AvatarFrame
                      username={member.username}
                      avatarUrl={member.avatar_url}
                      lifetimeScore={member.current_pump_score}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-bold">{member.username}</p>
                        {isYou && (
                          <Badge variant="secondary" className="text-[10px]">
                            You
                          </Badge>
                        )}
                        {membership.crew.created_by === member.id && (
                          <Badge className="bg-orange-600/80 text-[10px]">Owner</Badge>
                        )}
                        {onCouch && (
                          <Badge variant="outline" className="text-[10px] text-zinc-400">
                            Couch
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-orange-400/90">
                        {member.current_pump_score.toLocaleString()} lifetime pts
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.last_logged_at
                          ? `Last log ${formatRelativeTime(member.last_logged_at)}`
                          : "Never logged — drag them to the wall"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <SectionHeader
          icon={Swords}
          title="Crew battles"
          subtitle="Challenge another crew by their invite code."
        />
        <CrewBattlesPanel
          membership={membership}
          isOwner={membership.role === "owner"}
        />
      </section>

      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ size: "default" }),
          "w-full bg-orange-600 font-bold text-white"
        )}
      >
        Back to board & feed
      </Link>
    </div>
  );
}
