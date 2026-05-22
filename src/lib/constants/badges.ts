export const BADGE_THRESHOLDS = [10, 25, 50, 100, 500, 1000] as const;

export type BadgeTrackId =
  | "hangboard"
  | "climbing"
  | "board"
  | "outdoors"
  | "gym"
  | "stretching"
  | "total";

export interface BadgeTier {
  threshold: number;
  id: string;
  name: string;
  emoji: string;
  tagline: string;
}

export interface BadgeTrack {
  id: BadgeTrackId;
  label: string;
  emoji: string;
  description: string;
  tiers: BadgeTier[];
}

export const BADGE_TRACKS: BadgeTrack[] = [
  {
    id: "hangboard",
    label: "Hangboard",
    emoji: "🖐️",
    description: "Hangboard sessions logged",
    tiers: [
      { threshold: 10, id: "hb-10", name: "Tiny Hanger", emoji: "🪝", tagline: "First crimp casualties" },
      { threshold: 25, id: "hb-25", name: "Grip Gremlin", emoji: "👹", tagline: "Skin is optional" },
      { threshold: 50, id: "hb-50", name: "Crimp Apprentice", emoji: "🧲", tagline: "Half-pad warrior" },
      { threshold: 100, id: "hb-100", name: "Iron Phalanges", emoji: "🦴", tagline: "Pulleys trembling" },
      { threshold: 500, id: "hb-500", name: "Hangboard Hero", emoji: "🦸", tagline: "Beastmaker owns you" },
      { threshold: 1000, id: "hb-1000", name: "Fingers of Zeus", emoji: "⚡", tagline: "Mortals snap off the campus rung" },
    ],
  },
  {
    id: "climbing",
    label: "Climbing",
    emoji: "🧗",
    description: "Bouldering & route sessions",
    tiers: [
      { threshold: 10, id: "cl-10", name: "Pebble Wrestler", emoji: "🪨", tagline: "VB is a lifestyle" },
      { threshold: 25, id: "cl-25", name: "Slab Snail", emoji: "🐌", tagline: "Friction enthusiast" },
      { threshold: 50, id: "cl-50", name: "Crux Cartographer", emoji: "🗺️", tagline: "Maps every heel hook" },
      { threshold: 100, id: "cl-100", name: "Rock Cockroach", emoji: "🪳", tagline: "Survives any set" },
      { threshold: 500, id: "cl-500", name: "Boulder Beast", emoji: "🦍", tagline: "Carnage on the spray wall" },
      { threshold: 1000, id: "cl-1000", name: "Mountain GoAT", emoji: "🐐", tagline: "Summit psyche unlocked" },
    ],
  },
  {
    id: "board",
    label: "Board climbing",
    emoji: "🌙",
    description: "Moonboard / board sessions",
    tiers: [
      { threshold: 10, id: "bd-10", name: "Panel Pup", emoji: "🐶", tagline: "Wooden holds feel home" },
      { threshold: 25, id: "bd-25", name: "Kilter Kid", emoji: "📐", tagline: "Angles are friends" },
      { threshold: 50, id: "bd-50", name: "Moon Child", emoji: "🌙", tagline: "LED tan acquired" },
      { threshold: 100, id: "bd-100", name: "Board Brat", emoji: "😤", tagline: "Spray beta mandatory" },
      { threshold: 500, id: "bd-500", name: "Spray Lord", emoji: "👑", tagline: "Rules the Kilter cave" },
      { threshold: 1000, id: "bd-1000", name: "Boardlord", emoji: "🏰", tagline: "Owns every wooden kingdom" },
    ],
  },
  {
    id: "outdoors",
    label: "Outdoors",
    emoji: "⛰️",
    description: "Real rock — prestige decreases with every log",
    tiers: [
      { threshold: 10, id: "od-10", name: "Jug-Hugger", emoji: "🫂", tagline: "Loves the jugs. And the hugs." },
      { threshold: 25, id: "od-25", name: "Boulder Taxi", emoji: "🚕", tagline: "Drives pads, climbs V2" },
      { threshold: 50, id: "od-50", name: "Sandbag Suspect", emoji: "🎒", tagline: "That 6A felt like 7A+ (trust me)" },
      { threshold: 100, id: "od-100", name: "Topo Tourist", emoji: "🗺️", tagline: "Photos the line, sends the warm-up" },
      { threshold: 500, id: "od-500", name: "Spray Geologist", emoji: "🪨", tagline: "Explains rock quality for 40 minutes" },
      { threshold: 1000, id: "od-1000", name: "9A Downgrader", emoji: "📉", tagline: "Actually 8b. Maybe. In optimal conditions." },
    ],
  },
  {
    id: "gym",
    label: "Gym",
    emoji: "🏋️",
    description: "General gym — mirrors, machines & delusion",
    tiers: [
      { threshold: 10, id: "gy-10", name: "Mirror Smiler", emoji: "😁", tagline: "12 reps, 47 selfies" },
      { threshold: 25, id: "gy-25", name: "Leg Day Liar", emoji: "🦵", tagline: "Upper body only, always" },
      { threshold: 50, id: "gy-50", name: "Protein Shake Priest", emoji: "🥤", tagline: "Blessed by the whey" },
      { threshold: 100, id: "gy-100", name: "January Warrior", emoji: "📅", tagline: "Still here in March. Respect." },
      { threshold: 500, id: "gy-500", name: "Lat Pulldown Philosopher", emoji: "🧠", tagline: "Ponders reps between sets" },
      { threshold: 1000, id: "gy-1000", name: "Creatine Cloud Entity", emoji: "☁️", tagline: "Legally 80% gym bro vapour" },
    ],
  },
  {
    id: "stretching",
    label: "Stretching",
    emoji: "🧘",
    description: "Shame tax — the more you stretch, the worse it looks",
    tiers: [
      { threshold: 10, id: "st-10", name: "Almost Responsible", emoji: "🙂", tagline: "Fine. You foam-rolled once." },
      { threshold: 25, id: "st-25", name: "Guilty Mobilizer", emoji: "😬", tagline: "Stretching instead of trying hard" },
      { threshold: 50, id: "st-50", name: "Couch Excuse Engineer", emoji: "🛋️", tagline: "Recovery day #4 this week" },
      { threshold: 100, id: "st-100", name: "Flexibility Fraud", emoji: "🎭", tagline: "Still can't touch toes" },
      { threshold: 500, id: "st-500", name: "Recovery Cop-out King", emoji: "👑", tagline: "Negative points, positive vibes" },
      { threshold: 1000, id: "st-1000", name: "Professional Avoider", emoji: "🏆", tagline: "1000 excuses. Zero sends." },
    ],
  },
  {
    id: "total",
    label: "All sessions",
    emoji: "🔥",
    description: "Every log counts",
    tiers: [
      { threshold: 10, id: "tt-10", name: "Log Rookie", emoji: "📝", tagline: "The pump begins" },
      { threshold: 25, id: "tt-25", name: "Session Gremlin", emoji: "👺", tagline: "Can't stop won't stop" },
      { threshold: 50, id: "tt-50", name: "Consistency Gremlin", emoji: "📈", tagline: "Charts fear you" },
      { threshold: 100, id: "tt-100", name: "Pump Centurion", emoji: "🛡️", tagline: "Triple digits of suffering" },
      { threshold: 500, id: "tt-500", name: "Forearm Legend", emoji: "🌟", tagline: "Vascularity visible from space" },
      { threshold: 1000, id: "tt-1000", name: "PUMP Immortal", emoji: "♾️", tagline: "The couch fears your name" },
    ],
  },
];

export const BADGE_TRACK_MAP = Object.fromEntries(
  BADGE_TRACKS.map((t) => [t.id, t])
) as Record<BadgeTrackId, BadgeTrack>;
