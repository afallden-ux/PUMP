import type { BadgeTier } from "@/lib/constants/badges";
import type { SessionCounts } from "@/lib/data/sessionBadges";

/** Squad-only badge tracks — fed by combined crew session counts. */
export type CrewBadgeTrackId =
  | "crew_total"
  | "crew_hangboard"
  | "crew_climbing"
  | "crew_board"
  | "crew_outdoors"
  | "crew_gym"
  | "crew_stretching";

export interface CrewBadgeTrack {
  id: CrewBadgeTrackId;
  label: string;
  emoji: string;
  description: string;
  tiers: BadgeTier[];
  countFrom: (c: SessionCounts) => number;
}

export const CREW_BADGE_TRACKS: CrewBadgeTrack[] = [
  {
    id: "crew_total",
    label: "Squad sessions",
    emoji: "🔥",
    description: "Total logs by the whole crew",
    countFrom: (c) => c.total,
    tiers: [
      { threshold: 10, id: "ct-10", name: "Warm-up Circle", emoji: "⭕", tagline: "The couch is nervous" },
      { threshold: 25, id: "ct-25", name: "Chalk Syndicate", emoji: "🤝", tagline: "Shared suffering begins" },
      { threshold: 50, id: "ct-50", name: "Pad Mafia", emoji: "🛡️", tagline: "Territory established" },
      { threshold: 100, id: "ct-100", name: "Pump Battalion", emoji: "🎖️", tagline: "Triple-digit crew violence" },
      { threshold: 500, id: "ct-500", name: "Forearm Federation", emoji: "🌐", tagline: "NASA tracks your veins" },
      { threshold: 1000, id: "ct-1000", name: "PUMP Legion", emoji: "⚔️", tagline: "The mountain files a complaint" },
    ],
  },
  {
    id: "crew_hangboard",
    label: "Squad hangboard",
    emoji: "🖐️",
    description: "Collective finger torture",
    countFrom: (c) => c.hangboard,
    tiers: [
      { threshold: 10, id: "ch-10", name: "Tiny Hanger Club", emoji: "🪝", tagline: "Shared crimp trauma" },
      { threshold: 25, id: "ch-25", name: "Grip Cartel", emoji: "🫳", tagline: "Pulleys weep together" },
      { threshold: 50, id: "ch-50", name: "Beastmaker Cult", emoji: "🛐", tagline: "Initiation complete" },
      { threshold: 100, id: "ch-100", name: "Iron Squad Phalanges", emoji: "🦴", tagline: "No one opens jars" },
      { threshold: 500, id: "ch-500", name: "Hangboard Horde", emoji: "👊", tagline: "Campus rungs flee" },
      { threshold: 1000, id: "ch-1000", name: "Fingers of Zeus (Squad)", emoji: "⚡", tagline: "Thunderous crimping" },
    ],
  },
  {
    id: "crew_climbing",
    label: "Squad climbing",
    emoji: "🧗",
    description: "Combined boulder & route sessions",
    countFrom: (c) => c.climbing,
    tiers: [
      { threshold: 10, id: "cc-10", name: "Pebble Gang", emoji: "🪨", tagline: "VB squad goals" },
      { threshold: 25, id: "cc-25", name: "Slab Cartel", emoji: "🐌", tagline: "Friction is a lifestyle" },
      { threshold: 50, id: "cc-50", name: "Crux Committee", emoji: "📋", tagline: "Beta by committee" },
      { threshold: 100, id: "cc-100", name: "Rock Roach Nest", emoji: "🪳", tagline: "Survives any set" },
      { threshold: 500, id: "cc-500", name: "Boulder Battalion", emoji: "🦍", tagline: "Spray wall conquered" },
      { threshold: 1000, id: "cc-1000", name: "Mountain GoAT Herd", emoji: "🐐", tagline: "Summit psyche unlocked" },
    ],
  },
  {
    id: "crew_board",
    label: "Squad board",
    emoji: "🌙",
    description: "Moonboard / board sessions combined",
    countFrom: (c) => c.board,
    tiers: [
      { threshold: 10, id: "cb-10", name: "Panel Puppies", emoji: "🐶", tagline: "Wood holds feel home" },
      { threshold: 25, id: "cb-25", name: "Kilter Kommittee", emoji: "📐", tagline: "Angles are friends" },
      { threshold: 50, id: "cb-50", name: "Moon Cult", emoji: "🌙", tagline: "LED tan squad-wide" },
      { threshold: 100, id: "cb-100", name: "Board Brat Pack", emoji: "😤", tagline: "Spray beta mandatory" },
      { threshold: 500, id: "cb-500", name: "Spray Lords United", emoji: "👑", tagline: "Rules the Kilter cave" },
      { threshold: 1000, id: "cb-1000", name: "Boardlord Collective", emoji: "🏰", tagline: "Owns every wooden kingdom" },
    ],
  },
  {
    id: "crew_outdoors",
    label: "Squad outdoors",
    emoji: "⛰️",
    description: "Real rock — collective downgrading energy",
    countFrom: (c) => c.outdoors,
    tiers: [
      { threshold: 10, id: "co-10", name: "Jug-Hugger Gang", emoji: "🫂", tagline: "Loves the jugs. And the hugs." },
      { threshold: 25, id: "co-25", name: "Boulder Taxi Fleet", emoji: "🚕", tagline: "Drives pads, sends V2" },
      { threshold: 50, id: "co-50", name: "Sandbag Syndicate", emoji: "🎒", tagline: "That 6A felt like 7A+" },
      { threshold: 100, id: "co-100", name: "Topo Tourist Troop", emoji: "🗺️", tagline: "Photos the line, sends warm-up" },
      { threshold: 500, id: "co-500", name: "Spray Geology Dept", emoji: "🪨", tagline: "40 min rock lectures" },
      { threshold: 1000, id: "co-1000", name: "9A Downgrader Squad", emoji: "📉", tagline: "Actually 8b. Optimal conditions." },
    ],
  },
  {
    id: "crew_gym",
    label: "Squad gym",
    emoji: "🏋️",
    description: "Mirrors, machines & collective delusion",
    countFrom: (c) => c.gym,
    tiers: [
      { threshold: 10, id: "cg-10", name: "Mirror Smilers LLC", emoji: "😁", tagline: "12 reps, 47 selfies" },
      { threshold: 25, id: "cg-25", name: "Leg Day Liars Union", emoji: "🦵", tagline: "Upper body only, always" },
      { threshold: 50, id: "cg-50", name: "Whey Ministers", emoji: "🥤", tagline: "Blessed by the shake" },
      { threshold: 100, id: "cg-100", name: "January Warriors Guild", emoji: "📅", tagline: "Still here in March" },
      { threshold: 500, id: "cg-500", name: "Lat Pulldown Think Tank", emoji: "🧠", tagline: "Ponders between sets" },
      { threshold: 1000, id: "cg-1000", name: "Creatine Cloud Collective", emoji: "☁️", tagline: "80% gym bro vapour" },
    ],
  },
  {
    id: "crew_stretching",
    label: "Squad stretching",
    emoji: "🧘",
    description: "Shame scales with crew stretch logs",
    countFrom: (c) => c.stretching,
    tiers: [
      { threshold: 10, id: "cs-10", name: "Almost Responsible Squad", emoji: "🙂", tagline: "Fine. You foam-rolled." },
      { threshold: 25, id: "cs-25", name: "Guilty Mobilizers", emoji: "😬", tagline: "Stretching not trying" },
      { threshold: 50, id: "cs-50", name: "Couch Excuse Engineers", emoji: "🛋️", tagline: "Recovery day #4" },
      { threshold: 100, id: "cs-100", name: "Flexibility Fraud Ring", emoji: "🎭", tagline: "Still can't touch toes" },
      { threshold: 500, id: "cs-500", name: "Recovery Cop-out Kingdom", emoji: "👑", tagline: "Negative points, vibes" },
      { threshold: 1000, id: "cs-1000", name: "Professional Avoiders Inc", emoji: "🏆", tagline: "1000 excuses. Zero sends." },
    ],
  },
];

export const CREW_BADGE_TRACK_MAP = Object.fromEntries(
  CREW_BADGE_TRACKS.map((t) => [t.id, t])
) as Record<CrewBadgeTrackId, CrewBadgeTrack>;

export function getCrewTrackProgress(
  track: CrewBadgeTrack,
  combined: SessionCounts
) {
  const count = track.countFrom(combined);
  const earned = track.tiers
    .filter((tier) => count >= tier.threshold)
    .map((tier) => ({ track, tier, count }));
  const highest = earned.length > 0 ? earned[earned.length - 1]! : null;
  const next = track.tiers.find((tier) => count < tier.threshold) ?? null;
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

export function getAllCrewTrackProgress(combined: SessionCounts) {
  return CREW_BADGE_TRACKS.map((t) => getCrewTrackProgress(t, combined));
}

export function getCrewShowcaseBadges(combined: SessionCounts, limit = 8) {
  const badges: { track: CrewBadgeTrack; tier: BadgeTier; count: number }[] = [];
  for (const track of CREW_BADGE_TRACKS) {
    const progress = getCrewTrackProgress(track, combined);
    if (progress.highest) badges.push(progress.highest);
  }
  return badges
    .sort((a, b) => b.tier.threshold - a.tier.threshold)
    .slice(0, limit);
}
