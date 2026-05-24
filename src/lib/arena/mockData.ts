import type { ArenaAthlete, ArenaCategory, ArenaWorkout } from "@/lib/arena/types";

const CATEGORIES: ArenaCategory[] = [
  "fingerboard",
  "boardClimbing",
  "conditioning",
  "flexibility",
  "endurance",
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + (n % 5), 0, 0, 0);
  return d.toISOString();
}

function genWorkouts(
  userId: string,
  seed: number,
  count: number
): ArenaWorkout[] {
  const out: ArenaWorkout[] = [];
  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[(seed + i * 3) % CATEGORIES.length]!;
    const isMoonboard = category === "boardClimbing" && i % 4 === 0;
    out.push({
      id: `${userId}-w-${i}`,
      userId,
      recordedAt: daysAgo(i * 2 + (seed % 7)),
      category,
      durationMinutes: 45 + ((seed + i) % 6) * 15,
      vPoints: isMoonboard ? 12 + (i % 8) : category === "boardClimbing" ? 4 + (i % 5) : 0,
      isMoonboard,
    });
  }
  return out;
}

export const MOCK_ATHLETES: ArenaAthlete[] = [
  {
    id: "user-alex",
    username: "Alexander",
    avatarUrl: null,
    isMe: true,
    heightCm: 172,
    weightKg: 70,
    climbingAvatarLevel: 4,
    climbingAvatarTitle: "Level 4 Apex Climber",
    lifetimePumpScore: 1840,
    initialBaseline: {
      fingerStrengthPctBw: 168,
      flexibilityScore: 62,
      enduranceMinutes: 18,
      recordedAt: daysAgo(120),
    },
    currentBaseline: {
      fingerStrengthPctBw: 191.5,
      flexibilityScore: 74,
      enduranceMinutes: 24,
      improvementPct: 14,
    },
    workouts: genWorkouts("user-alex", 1, 48),
  },
  {
    id: "user-paul",
    username: "Paul",
    avatarUrl: null,
    isMe: false,
    heightCm: 178,
    weightKg: 74,
    climbingAvatarLevel: 5,
    climbingAvatarTitle: "Level 5 Board Crusher",
    lifetimePumpScore: 2210,
    initialBaseline: {
      fingerStrengthPctBw: 175,
      flexibilityScore: 58,
      enduranceMinutes: 20,
      recordedAt: daysAgo(110),
    },
    currentBaseline: {
      fingerStrengthPctBw: 198,
      flexibilityScore: 65,
      enduranceMinutes: 28,
      improvementPct: 18,
    },
    workouts: genWorkouts("user-paul", 2, 52),
  },
  {
    id: "user-carl",
    username: "Carl",
    avatarUrl: null,
    isMe: false,
    heightCm: 181,
    weightKg: 78,
    climbingAvatarLevel: 3,
    climbingAvatarTitle: "Level 3 Crimp Apprentice",
    lifetimePumpScore: 920,
    initialBaseline: {
      fingerStrengthPctBw: 152,
      flexibilityScore: 70,
      enduranceMinutes: 16,
      recordedAt: daysAgo(100),
    },
    currentBaseline: {
      fingerStrengthPctBw: 165,
      flexibilityScore: 78,
      enduranceMinutes: 19,
      improvementPct: 9,
    },
    workouts: genWorkouts("user-carl", 3, 36),
  },
  {
    id: "user-adam",
    username: "Adam",
    avatarUrl: null,
    isMe: false,
    heightCm: 169,
    weightKg: 66,
    climbingAvatarLevel: 2,
    climbingAvatarTitle: "Level 2 Chalk Collector",
    lifetimePumpScore: 540,
    initialBaseline: {
      fingerStrengthPctBw: 140,
      flexibilityScore: 55,
      enduranceMinutes: 14,
      recordedAt: daysAgo(95),
    },
    currentBaseline: {
      fingerStrengthPctBw: 148,
      flexibilityScore: 61,
      enduranceMinutes: 15,
      improvementPct: 5,
    },
    workouts: genWorkouts("user-adam", 4, 28),
  },
];

export function getCurrentUser(): ArenaAthlete {
  return MOCK_ATHLETES.find((a) => a.isMe)!;
}
