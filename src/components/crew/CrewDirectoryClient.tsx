"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { PublicCrewListItem } from "@/lib/data/publicCrews";

interface CrewDirectoryClientProps {
  crews: PublicCrewListItem[];
}

export function CrewDirectoryClient({ crews }: CrewDirectoryClientProps) {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-black text-orange-400">All crews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse every squad on PUMP — members, squad badges & banners. Invite codes stay private.
        </p>
      </div>

      <SectionHeader
        icon={Users}
        title={`${crews.length} crew${crews.length === 1 ? "" : "s"}`}
        subtitle="Tap a crew to see combined squad badges and each climber."
      />

      {crews.length === 0 ? (
        <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          No crews yet. Be the first to create one from your crew page.
        </p>
      ) : (
        <ul className="space-y-3">
          {crews.map((crew) => (
            <li key={crew.id}>
              <Link href={`/crews/${crew.id}`}>
                <Card className="overflow-hidden border-border/60 bg-card/80 transition-colors hover:border-orange-500/40">
                  <div className="relative aspect-[3/1] bg-muted">
                    {crew.banner_url ? (
                      <Image
                        src={crew.banner_url}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        No banner
                      </div>
                    )}
                  </div>
                  <CardContent className="py-3">
                    <p className="font-black text-lg">{crew.name}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {crew.member_count} member{crew.member_count === 1 ? "" : "s"}
                      </span>
                      {crew.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {crew.location}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
