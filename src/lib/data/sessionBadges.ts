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
  user_id?: string;
  session_type: string;
  is_moonboard: boolean | null;
  is_outdoors: boolean | null;
};

export type SessionCountsMap = Record<string, SessionCounts>;

const EMPTY_COUNTS = (): SessionCounts => ({
  hangboard: 0,
  climbing: 0,
  board: 0,
  outdoors: 0,
  gym: 0,
  stretching: 0,
  total: 0,
});

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

export function combineSessionCounts(countsList: SessionCounts[]): SessionCounts {
  const combined = EMPTY_COUNTS();
  for (const c of countsList) {
    combined.hangboard += c.hangboard;
    combined.climbing += c.climbing;
    combined.board += c.board;
    combined.outdoors += c.outdoors;
    combined.gym += c.gym;
    combined.stretching += c.stretching;
    combined.total += c.total;
  }
  return combined;
}

export async function fetchSessionCounts(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string
): Promise<SessionCounts> {
  const map = await fetchSessionCountsMap(supabase, [userId]);
  return map[userId] ?? EMPTY_COUNTS();
}

export async function fetchSessionCountsMap(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userIds: string[]
): Promise<SessionCountsMap> {
  const map: SessionCountsMap = {};
  for (const id of userIds) {
    map[id] = EMPTY_COUNTS();
  }
  if (userIds.length === 0) return map;

  const { data } = await supabase
    .from("workout_logs")
    .select("user_id, session_type, is_moonboard, is_outdoors")
    .in("user_id", userIds);

  const byUser = new Map<string, LogRow[]>();
  for (const row of (data ?? []) as LogRow[]) {
    const uid = row.user_id;
    if (!uid) continue;
    const list = byUser.get(uid) ?? [];
    list.push(row);
    byUser.set(uid, list);
  }

  for (const id of userIds) {
    map[id] = aggregateSessionCounts(byUser.get(id) ?? []);
  }

  return map;
}
