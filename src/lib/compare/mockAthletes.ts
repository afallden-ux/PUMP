import type { CompareSnapshot } from "@/lib/compare/types";
import { ASSESSMENT_TYPES, type AssessmentType } from "@/lib/constants/assessments";
import type { AssessmentLog } from "@/lib/assessments/types";
import type { Profile } from "@/types/app";

/** Prefix for demo climbers (client-only, not in Supabase). */
export const MOCK_COMPARE_PREFIX = "cc-mock-";

export const MOCK_COMPARE_IDS = {
  paul: `${MOCK_COMPARE_PREFIX}paul`,
  carl: `${MOCK_COMPARE_PREFIX}carl`,
  maya: `${MOCK_COMPARE_PREFIX}maya`,
  adam: `${MOCK_COMPARE_PREFIX}adam`,
} as const;

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function emptyAssessments(): Record<AssessmentType, AssessmentLog | null> {
  return Object.fromEntries(ASSESSMENT_TYPES.map((t) => [t, null])) as Record<
    AssessmentType,
    AssessmentLog | null
  >;
}

function mockLog(
  userId: string,
  type: AssessmentType,
  recordedAt: string,
  fields: Partial<Omit<AssessmentLog, "id" | "user_id" | "assessment_type" | "recorded_at">>
): AssessmentLog {
  return {
    id: `${userId}-${type}`,
    user_id: userId,
    assessment_type: type,
    recorded_at: recordedAt,
    body_weight_kg: null,
    resistance_kg: null,
    time_under_tension_s: null,
    total_duration_s: null,
    distance_cm: null,
    sets: null,
    reps: null,
    notes: null,
    created_at: recordedAt,
    ...fields,
  };
}

function buildSnapshot(
  profile: Profile,
  metrics: Omit<
    CompareSnapshot,
    "profile" | "lifetimeScore" | "latestByAssessment"
  > & {
    assessments?: Partial<Record<AssessmentType, AssessmentLog | null>>;
  }
): CompareSnapshot {
  const latestByAssessment = emptyAssessments();
  if (metrics.assessments) {
    for (const [k, v] of Object.entries(metrics.assessments)) {
      if (v) latestByAssessment[k as AssessmentType] = v;
    }
  }
  const { assessments: _a, ...rest } = metrics;
  return {
    profile,
    ...rest,
    lifetimeScore: profile.current_pump_score,
    latestByAssessment,
  };
}

const paulProfile: Profile = {
  id: MOCK_COMPARE_IDS.paul,
  username: "Paul",
  avatar_url: null,
  title: "Level 5 board crusher",
  home_crag: "Klättercentret",
  height_cm: 178,
  current_pump_score: 2210,
  last_logged_at: daysAgoIso(1),
};

const carlProfile: Profile = {
  id: MOCK_COMPARE_IDS.carl,
  username: "Carl",
  avatar_url: null,
  title: "Crimp apprentice",
  home_crag: "Gaswerk",
  height_cm: 181,
  current_pump_score: 920,
  last_logged_at: daysAgoIso(3),
};

const mayaProfile: Profile = {
  id: MOCK_COMPARE_IDS.maya,
  username: "Maya",
  avatar_url: null,
  title: "Finger strength specialist",
  home_crag: "Klätterlabbet",
  height_cm: 172,
  current_pump_score: 1840,
  last_logged_at: daysAgoIso(2),
};

const adamProfile: Profile = {
  id: MOCK_COMPARE_IDS.adam,
  username: "Adam",
  avatar_url: null,
  title: "Chalk collector",
  home_crag: "Nordic Rock",
  height_cm: 169,
  current_pump_score: 540,
  last_logged_at: daysAgoIso(12),
};

export const MOCK_COMPARE_PROFILES: Profile[] = [
  paulProfile,
  carlProfile,
  mayaProfile,
  adamProfile,
];

const MOCK_SNAPSHOTS: Record<string, CompareSnapshot> = {
  [MOCK_COMPARE_IDS.paul]: buildSnapshot(paulProfile, {
    heightCm: 178,
    bodyWeightKg: 74,
    fingerStrengthKg: 52,
    fingerStrengthPctBw: 170.3,
    weightedPullupKg: 50,
    weightedPullupPctBw: 167.6,
    powerEnduranceTutS: 420,
    powerEnduranceTotalS: 900,
    hipFlexibilityCm: 72,
    hipFlexibilityPctHeight: 39.8,
    hardestGrade: "8A",
    totalLogs: 186,
    weeklyPoints: 412,
    weeklyRank: 2,
    assessments: {
      finger_strength: mockLog(MOCK_COMPARE_IDS.paul, "finger_strength", daysAgoIso(45), {
        body_weight_kg: 74,
        resistance_kg: 52,
      }),
      weighted_pullup: mockLog(MOCK_COMPARE_IDS.paul, "weighted_pullup", daysAgoIso(14), {
        body_weight_kg: 71,
        resistance_kg: 50,
        sets: 8,
        reps: 2,
        notes: "48 x 2, 50 x 2 — solid 2RM day",
      }),
      power_endurance: mockLog(MOCK_COMPARE_IDS.paul, "power_endurance", daysAgoIso(30), {
        time_under_tension_s: 420,
        total_duration_s: 900,
      }),
      hip_flexibility: mockLog(MOCK_COMPARE_IDS.paul, "hip_flexibility", daysAgoIso(60), {
        distance_cm: 72,
      }),
    },
  }),
  [MOCK_COMPARE_IDS.carl]: buildSnapshot(carlProfile, {
    heightCm: 181,
    bodyWeightKg: 78,
    fingerStrengthKg: 38,
    fingerStrengthPctBw: 148.7,
    weightedPullupKg: 32,
    weightedPullupPctBw: 141,
    powerEnduranceTutS: 280,
    powerEnduranceTotalS: 720,
    hipFlexibilityCm: 95,
    hipFlexibilityPctHeight: 52.5,
    hardestGrade: "7C+",
    totalLogs: 94,
    weeklyPoints: 198,
    weeklyRank: 5,
    assessments: {
      finger_strength: mockLog(MOCK_COMPARE_IDS.carl, "finger_strength", daysAgoIso(20), {
        body_weight_kg: 78,
        resistance_kg: 38,
      }),
      weighted_pullup: mockLog(MOCK_COMPARE_IDS.carl, "weighted_pullup", daysAgoIso(40), {
        body_weight_kg: 78,
        resistance_kg: 32,
      }),
      power_endurance: mockLog(MOCK_COMPARE_IDS.carl, "power_endurance", daysAgoIso(25), {
        time_under_tension_s: 280,
        total_duration_s: 720,
      }),
      hip_flexibility: mockLog(MOCK_COMPARE_IDS.carl, "hip_flexibility", daysAgoIso(8), {
        distance_cm: 95,
      }),
    },
  }),
  [MOCK_COMPARE_IDS.maya]: buildSnapshot(mayaProfile, {
    heightCm: 172,
    bodyWeightKg: 68,
    fingerStrengthKg: 65,
    fingerStrengthPctBw: 191.5,
    weightedPullupKg: 28,
    weightedPullupPctBw: 141.2,
    powerEnduranceTutS: 360,
    powerEnduranceTotalS: 840,
    hipFlexibilityCm: 68,
    hipFlexibilityPctHeight: 39.5,
    hardestGrade: "7B+",
    totalLogs: 142,
    weeklyPoints: 356,
    weeklyRank: 3,
    assessments: {
      finger_strength: mockLog(MOCK_COMPARE_IDS.maya, "finger_strength", daysAgoIso(120), {
        body_weight_kg: 68,
        resistance_kg: 65,
        notes: "Max hang — Lattice-style benchmark",
      }),
      weighted_pullup: mockLog(MOCK_COMPARE_IDS.maya, "weighted_pullup", daysAgoIso(50), {
        body_weight_kg: 68,
        resistance_kg: 28,
      }),
      power_endurance: mockLog(MOCK_COMPARE_IDS.maya, "power_endurance", daysAgoIso(18), {
        time_under_tension_s: 360,
        total_duration_s: 840,
      }),
      hip_flexibility: mockLog(MOCK_COMPARE_IDS.maya, "hip_flexibility", daysAgoIso(90), {
        distance_cm: 68,
      }),
    },
  }),
  [MOCK_COMPARE_IDS.adam]: buildSnapshot(adamProfile, {
    heightCm: 169,
    bodyWeightKg: 66,
    fingerStrengthKg: 18,
    fingerStrengthPctBw: 127.3,
    weightedPullupKg: 12,
    weightedPullupPctBw: 118.2,
    powerEnduranceTutS: 0,
    powerEnduranceTotalS: 0,
    hipFlexibilityCm: null,
    hipFlexibilityPctHeight: null,
    hardestGrade: "7A",
    totalLogs: 28,
    weeklyPoints: 42,
    weeklyRank: 12,
    assessments: {
      finger_strength: mockLog(MOCK_COMPARE_IDS.adam, "finger_strength", daysAgoIso(55), {
        body_weight_kg: 66,
        resistance_kg: 18,
      }),
      weighted_pullup: mockLog(MOCK_COMPARE_IDS.adam, "weighted_pullup", daysAgoIso(70), {
        body_weight_kg: 66,
        resistance_kg: 12,
      }),
    },
  }),
};

export function isMockCompareAthleteId(id: string): boolean {
  return id.startsWith(MOCK_COMPARE_PREFIX);
}

export function getMockCompareSnapshot(userId: string): CompareSnapshot | null {
  return MOCK_SNAPSHOTS[userId] ?? null;
}

export function getMockCompareProfiles(): Profile[] {
  return MOCK_COMPARE_PROFILES;
}

/** Real profiles + demo climbers (demo only if id not already taken). */
export function mergeClimbersWithMocks(real: Profile[]): Profile[] {
  const ids = new Set(real.map((p) => p.id));
  const extras = MOCK_COMPARE_PROFILES.filter((p) => !ids.has(p.id));
  return [...real, ...extras].sort((a, b) => a.username.localeCompare(b.username));
}
