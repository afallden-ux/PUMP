import {
  BADGE_TRACK_MAP,
  BADGE_TRACKS,
  type BadgeTier,
  type BadgeTrack,
  type BadgeTrackId,
} from "@/lib/constants/badges";
import type { SessionType } from "@/lib/constants/sessionTypes";

export interface SessionCounts {
  hangboard: number;
  climbing: number;
  board: number;
  outdoors: number;
  gym: number;
  stretching: number;
  total: number;
}

export interface EarnedBadge {
  track: BadgeTrack;
  tier: BadgeTier;
  count: number;
}

export interface TrackBadgeProgress {
  track: BadgeTrack;
  count: number;
  earned: EarnedBadge[];
  highest: EarnedBadge | null;
  next: BadgeTier | null;
  progressToNext: number;
}

type LogRow = {
  session_type: string;
  is_moonboard: boolean | null;
  is_outdoors: boolean | null;
};

export function aggregateSessionCounts(rows: LogRow[]): SessionCounts {
  const counts: SessionCounts = {
    hangboard: 0,
    climbing: 0,
    board: 0,
    outdoors: 0,
    gym: 0,
    stretching: 0,
    total: rows.length,
  };

  for (const row of rows) {
    const type = (row.session_type ?? "climbing") as SessionType;
    if (type === "hangboard") counts.hangboard += 1;
    else if (type === "gym") counts.gym += 1;
    else if (type === "stretching") counts.stretching += 1;
    else if (type === "climbing") {
      counts.climbing += 1;
      if (row.is_moonboard) counts.board += 1;
      if (row.is_outdoors) counts.outdoors += 1;
    }
  }

  return counts;
}

export function getCountForTrack(counts: SessionCounts, trackId: BadgeTrackId): number {
  return counts[trackId];
}

export function getEarnedBadgesForTrack(
  track: BadgeTrack,
  count: number
): EarnedBadge[] {
  return track.tiers
    .filter((tier) => count >= tier.threshold)
    .map((tier) => ({ track, tier, count }));
}

export function getHighestBadgeForTrack(
  track: BadgeTrack,
  count: number
): EarnedBadge | null {
  const earned = getEarnedBadgesForTrack(track, count);
  return earned.length > 0 ? earned[earned.length - 1]! : null;
}

export function getNextBadgeTier(track: BadgeTrack, count: number): BadgeTier | null {
  return track.tiers.find((tier) => count < tier.threshold) ?? null;
}

export function getTrackProgress(
  trackId: BadgeTrackId,
  counts: SessionCounts
): TrackBadgeProgress {
  const track = BADGE_TRACK_MAP[trackId];
  const count = getCountForTrack(counts, trackId);
  const earned = getEarnedBadgesForTrack(track, count);
  const highest = earned.length > 0 ? earned[earned.length - 1]! : null;
  const next = getNextBadgeTier(track, count);

  let progressToNext = 1;
  if (next) {
    const prevThreshold = highest?.tier.threshold ?? 0;
    const span = next.threshold - prevThreshold;
    progressToNext = span > 0 ? (count - prevThreshold) / span : 0;
  }

  return {
    track,
    count,
    earned,
    highest,
    next,
    progressToNext: Math.min(1, Math.max(0, progressToNext)),
  };
}

export function getAllTrackProgress(counts: SessionCounts): TrackBadgeProgress[] {
  return BADGE_TRACKS.map((t) => getTrackProgress(t.id, counts));
}

/** Top badges to show on avatar / compact UI (highest tier per track, then sort by threshold). */
export function getShowcaseBadges(counts: SessionCounts, limit = 6): EarnedBadge[] {
  const badges: EarnedBadge[] = [];
  for (const track of BADGE_TRACKS) {
    const highest = getHighestBadgeForTrack(track, getCountForTrack(counts, track.id));
    if (highest) badges.push(highest);
  }
  return badges
    .sort((a, b) => b.tier.threshold - a.tier.threshold)
    .slice(0, limit);
}

export async function fetchSessionCounts(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string
): Promise<SessionCounts> {
  const { data } = await supabase
    .from("workout_logs")
    .select("session_type, is_moonboard, is_outdoors")
    .eq("user_id", userId);

  return aggregateSessionCounts((data ?? []) as LogRow[]);
}
