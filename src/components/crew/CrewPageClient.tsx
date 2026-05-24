"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle, Users } from "lucide-react";
import { CrewBanner } from "@/components/crew/CrewBanner";
import { CrewBattlesPanel } from "@/components/crew/CrewBattlesPanel";
import { CrewBadgesBoard } from "@/components/crew/CrewBadgesBoard";
import { CrewBannerUpload } from "@/components/crew/CrewBannerUpload";
import { CrewLocationForm } from "@/components/crew/CrewLocationForm";
import { CrewOnboarding } from "@/components/crew/CrewOnboarding";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionCountsMap } from "@/lib/data/sessionBadges";
import type { CrewMembership } from "@/types/app";

interface CrewPageClientProps {
  memberships: CrewMembership[];
  currentUserId: string;
  memberCountsMap: SessionCountsMap;
}

export function CrewPageClient({
  memberships,
  currentUserId,
  memberCountsMap,
}: CrewPageClientProps) {
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
          <h1 className="text-xl font-black">Crew settings</h1>
          <p className="text-xs text-muted-foreground">
            Banners, battles, invites — not the social feed
          </p>
        </div>
        <Users className="size-6 text-orange-400" />
      </div>

      <Link
        href="/dashboard#crew-feed"
        className={cn(
          buttonVariants({ size: "default" }),
          "flex w-full items-center justify-center gap-2 bg-orange-600 font-bold text-white hover:bg-orange-500"
        )}
      >
        <MessageCircle className="size-5" />
        Open crew feed (comments & kudos)
      </Link>

      {memberships.map((membership) => (
        <section
          key={membership.crew.id}
          className="space-y-4 rounded-2xl border border-orange-500/25 bg-card/30 p-4"
        >
          <h2 className="text-lg font-black">{membership.crew.name}</h2>

          <CrewBannerUpload
            crewId={membership.crew.id}
            crewName={membership.crew.name}
            bannerUrl={membership.crew.banner_url ?? null}
            isOwner={membership.role === "owner"}
          />

          <Link
            href={`/crews/${membership.crew.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full"
            )}
          >
            Public crew page
          </Link>

          <CrewBanner membership={membership} />

          <CrewLocationForm
            crewId={membership.crew.id}
            location={membership.crew.location}
            isOwner={membership.role === "owner"}
          />

          <CrewBadgesBoard
            members={membership.members}
            countsMap={memberCountsMap}
            crewName={membership.crew.name}
            currentUserId={currentUserId}
          />

          {membership.role === "owner" && (
            <CrewBattlesPanel
              membership={membership}
              isOwner
            />
          )}
        </section>
      ))}

      <section className="space-y-3 rounded-xl border border-dashed border-orange-500/30 p-4">
        <h3 className="font-bold">Join another crew</h3>
        <p className="text-xs text-muted-foreground">
          You can be in multiple crews. Create a new one or use an invite code.
        </p>
        <CrewOnboarding compact />
      </section>

      <Link
        href="/crews"
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Browse all crews on CC
      </Link>

      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Back to home
      </Link>
    </div>
  );
}
