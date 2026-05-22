"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { CrewBadgesBoard } from "@/components/crew/CrewBadgesBoard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicCrewDetail } from "@/lib/data/publicCrews";

interface PublicCrewDetailClientProps {
  crew: PublicCrewDetail;
  currentUserId: string | null;
  isYourCrew: boolean;
}

export function PublicCrewDetailClient({
  crew,
  currentUserId,
  isYourCrew,
}: PublicCrewDetailClientProps) {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-10 pt-4">
      <div className="flex items-center gap-2">
        <Link
          href="/crews"
          aria-label="Back to all crews"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black">{crew.name}</h1>
          {crew.location && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {crew.location}
            </p>
          )}
        </div>
        {isYourCrew && (
          <Link
            href="/crew"
            className={cn(
              buttonVariants({ size: "sm" }),
              "shrink-0 bg-orange-600 text-white"
            )}
          >
            Manage
          </Link>
        )}
      </div>

      <div className="relative aspect-[3/1] overflow-hidden rounded-xl border border-orange-500/30 bg-muted">
        {crew.banner_url ? (
          <Image
            src={crew.banner_url}
            alt={`${crew.name} banner`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            No crew banner uploaded
          </div>
        )}
      </div>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="size-4 text-orange-400" />
        {crew.member_count} member{crew.member_count === 1 ? "" : "s"}
      </p>

      <CrewBadgesBoard
        members={crew.members}
        countsMap={crew.memberCountsMap}
        crewName={crew.name}
        currentUserId={currentUserId ?? ""}
      />
    </div>
  );
}
