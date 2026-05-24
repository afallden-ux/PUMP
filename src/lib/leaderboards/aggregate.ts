import {
  getMockCompareSnapshot,
  isMockCompareAthleteId,
  MOCK_COMPARE_PROFILES,
} from "@/lib/compare/mockAthletes";
import type { AssessmentType } from "@/lib/constants/assessments";
import type { FontGrade } from "@/lib/constants/fontGrades";
import type { LeaderboardAthlete } from "@/lib/leaderboards/types";
import { pctBodyWeight, pctHeight } from "@/lib/assessments/format";
import { statsFromTreeRows } from "@/lib/crags27/ascentTree";
import type { Crags27TreeRow } from "@/lib/crags27/types";
import { maxHardestGrade } from "@/lib/utils/hardestGrade";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/app";

const THIRTY_DAYS_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

function ascentStats(
  rows: { user_id: string; climbed_at: string; grade_display: string | null }[]
) {
  const cutoff = THIRTY_DAYS_AGO();
  const byUser = new Map<
    string,
    { grades: (string | null)[]; total: number; last30: number }
  >();

  for (const row of rows) {
    let entry = byUser.get(row.user_id);
    if (!entry) {
      entry = { grades: [], total: 0, last30: 0 };
      byUser.set(row.user_id, entry);
    }
    entry.total += 1;
    if (row.climbed_at >= cutoff) entry.last30 += 1;
    entry.grades.push(row.grade_display);
  }

  const hardest = new Map<string, FontGrade | null>();
  const total = new Map<string, number>();
  const last30 = new Map<string, number>();

  for (const [userId, data] of byUser) {
    hardest.set(userId, maxHardestGrade(data.grades));
    total.set(userId, data.total);
    last30.set(userId, data.last30);
  }

  return { hardest, total, last30 };
}

function crags27TreeStats(
  rows: {
    user_id: string;
    grade: string;
    total: number;
    onsight: number;
    flash: number;
    redpoint: number;
    toprope: number;
  }[]
) {
  const byUser = new Map<string, Crags27TreeRow[]>();
  for (const row of rows) {
    const list = byUser.get(row.user_id) ?? [];
    list.push({
      grade: row.grade,
      total: row.total,
      onsight: row.onsight,
      flash: row.flash,
      redpoint: row.redpoint,
      toprope: row.toprope,
    });
    byUser.set(row.user_id, list);
  }

  const hardest = new Map<string, FontGrade | null>();
  const total = new Map<string, number>();

  for (const [userId, tree] of byUser) {
    const stats = statsFromTreeRows(tree);
    hardest.set(userId, stats.hardestGrade);
    total.set(userId, stats.totalAscents);
  }

  return { hardest, total };
}

function latestAssessments(
  logs: {
    user_id: string;
    assessment_type: string;
    recorded_at: string;
    body_weight_kg: number | null;
    resistance_kg: number | null;
    time_under_tension_s: number | null;
    distance_cm: number | null;
  }[]
) {
  const map = new Map<string, Map<AssessmentType, (typeof logs)[0]>>();
  for (const log of logs) {
    const type = log.assessment_type as AssessmentType;
    let userMap = map.get(log.user_id);
    if (!userMap) {
      userMap = new Map();
      map.set(log.user_id, userMap);
    }
    if (!userMap.has(type)) {
      userMap.set(type, log);
    }
  }
  return map;
}

function mockAthletesFromSnapshots(): LeaderboardAthlete[] {
  return MOCK_COMPARE_PROFILES.map((profile) => {
    const snap = getMockCompareSnapshot(profile.id);
    if (!snap) {
      return baseAthleteFromProfile(profile);
    }
    return {
      id: profile.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      title: profile.title,
      current_pump_score: snap.lifetimeScore,
      weeklyPoints: snap.weeklyPoints,
      weeklySessions: 0,
      totalLogs: snap.totalLogs,
      fingerStrengthKg: snap.fingerStrengthKg,
      fingerStrengthPctBw: snap.fingerStrengthPctBw,
      weightedPullupKg: snap.weightedPullupKg,
      weightedPullupPctBw: snap.weightedPullupPctBw,
      powerEnduranceTutS: snap.powerEnduranceTutS,
      hipFlexibilityCm: snap.hipFlexibilityCm,
      hipFlexibilityPctHeight: snap.hipFlexibilityPctHeight,
      hardestGradeOutdoor: snap.hardestGrade,
      moonboardHardestGrade: snap.moonboardHardestGrade,
      moonboardTotalAscents: snap.moonboardTotalAscents,
      moonboardAscents30d: snap.moonboardAscents30d,
      crags27HardestGrade: snap.crags27HardestGrade,
      crags27TotalAscents: snap.crags27TotalAscents,
      crags27Ascents30d: snap.crags27Ascents30d,
      eightaHardestGrade: snap.eightaHardestGrade,
      eightaTotalAscents: snap.eightaTotalAscents,
      eightaAscents30d: snap.eightaAscents30d,
    };
  });
}

function baseAthleteFromProfile(profile: Profile): LeaderboardAthlete {
  return {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url,
    title: profile.title,
    current_pump_score: profile.current_pump_score,
    weeklyPoints: 0,
    weeklySessions: 0,
    totalLogs: 0,
    fingerStrengthKg: null,
    fingerStrengthPctBw: null,
    weightedPullupKg: null,
    weightedPullupPctBw: null,
    powerEnduranceTutS: null,
    hipFlexibilityCm: null,
    hipFlexibilityPctHeight: null,
    hardestGradeOutdoor: null,
    moonboardHardestGrade: null,
    moonboardTotalAscents: 0,
    moonboardAscents30d: 0,
    crags27HardestGrade: null,
    crags27TotalAscents: 0,
    crags27Ascents30d: 0,
    eightaHardestGrade: null,
    eightaTotalAscents: 0,
    eightaAscents30d: 0,
  };
}

export async function fetchLeaderboardAthletes(
  supabase: SupabaseClient
): Promise<LeaderboardAthlete[]> {
  const [
    profilesRes,
    assessmentsRes,
    workoutGradesRes,
    logCountsRes,
    leaderboardRes,
    moonRes,
    crags27Res,
    eightaRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, username, avatar_url, title, height_cm, current_pump_score, last_logged_at"
      )
      .order("username"),
    supabase
      .from("assessment_logs")
      .select(
        "user_id, assessment_type, recorded_at, body_weight_kg, resistance_kg, time_under_tension_s, distance_cm"
      )
      .order("recorded_at", { ascending: false }),
    supabase
      .from("workout_logs")
      .select("user_id, hardest_grade")
      .not("hardest_grade", "is", null),
    supabase.from("workout_logs").select("user_id"),
    supabase.from("leaderboard_7d").select("*"),
    supabase
      .from("moonboard_ascents")
      .select("user_id, climbed_at, grade_display, grade_logged"),
    supabase
      .from("crags27_ascent_tree")
      .select("user_id, grade, total, onsight, flash, redpoint, toprope"),
    supabase.from("eighta_ascents").select("user_id, climbed_at, grade_display"),
  ]);

  const profiles = (profilesRes.data ?? []) as Profile[];
  const assessmentMap = latestAssessments(
    (assessmentsRes.data ?? []) as {
      user_id: string;
      assessment_type: string;
      recorded_at: string;
      body_weight_kg: number | null;
      resistance_kg: number | null;
      time_under_tension_s: number | null;
      distance_cm: number | null;
    }[]
  );

  const outdoorGrades = new Map<string, FontGrade[]>();
  for (const row of workoutGradesRes.data ?? []) {
    const uid = row.user_id as string;
    const g = row.hardest_grade as FontGrade;
    if (!outdoorGrades.has(uid)) outdoorGrades.set(uid, []);
    outdoorGrades.get(uid)!.push(g);
  }

  const logCount = new Map<string, number>();
  for (const row of logCountsRes.data ?? []) {
    const uid = row.user_id as string;
    logCount.set(uid, (logCount.get(uid) ?? 0) + 1);
  }

  const weeklyMap = new Map<
    string,
    { points: number; sessions: number }
  >();
  for (const row of leaderboardRes.data ?? []) {
    weeklyMap.set(row.id, {
      points: row.points_7d,
      sessions: row.sessions_7d,
    });
  }

  const moonRows =
    moonRes.error?.message?.includes("moonboard") || !moonRes.data
      ? []
      : moonRes.data.map((r) => ({
          user_id: r.user_id as string,
          climbed_at: r.climbed_at as string,
          grade_display: (r.grade_logged ?? r.grade_display) as string | null,
        }));

  const crags27TreeRows =
    crags27Res.error?.message?.includes("crags27") || !crags27Res.data
      ? []
      : (crags27Res.data as {
          user_id: string;
          grade: string;
          total: number;
          onsight: number;
          flash: number;
          redpoint: number;
          toprope: number;
        }[]);

  const eightaRows =
    eightaRes.error?.message?.includes("eighta") || !eightaRes.data
      ? []
      : (eightaRes.data as {
          user_id: string;
          climbed_at: string;
          grade_display: string | null;
        }[]);

  const moonStats = ascentStats(moonRows);
  const crags27Stats = crags27TreeStats(crags27TreeRows);
  const eightaStats = ascentStats(eightaRows);

  const realAthletes: LeaderboardAthlete[] = profiles
    .filter((p) => !isMockCompareAthleteId(p.id))
    .map((profile) => {
      const heightCm = profile.height_cm ?? null;
      const assessments = assessmentMap.get(profile.id);
      const finger = assessments?.get("finger_strength");
      const pullup = assessments?.get("weighted_pullup");
      const endurance = assessments?.get("power_endurance");
      const hip = assessments?.get("hip_flexibility");

      const bodyWeight =
        pullup?.body_weight_kg ?? finger?.body_weight_kg ?? null;
      const fingerKg = finger?.resistance_kg ?? null;
      const pullKg = pullup?.resistance_kg ?? null;
      const hipCm = hip?.distance_cm ?? null;

      const weekly = weeklyMap.get(profile.id);

      return {
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        title: profile.title,
        current_pump_score: profile.current_pump_score,
        weeklyPoints: weekly?.points ?? 0,
        weeklySessions: weekly?.sessions ?? 0,
        totalLogs: logCount.get(profile.id) ?? 0,
        fingerStrengthKg: fingerKg,
        fingerStrengthPctBw: pctBodyWeight(bodyWeight, fingerKg),
        weightedPullupKg: pullKg,
        weightedPullupPctBw: pctBodyWeight(bodyWeight, pullKg),
        powerEnduranceTutS: endurance?.time_under_tension_s ?? null,
        hipFlexibilityCm: hipCm,
        hipFlexibilityPctHeight: pctHeight(hipCm, heightCm),
        hardestGradeOutdoor: maxHardestGrade(outdoorGrades.get(profile.id) ?? []),
        moonboardHardestGrade: moonStats.hardest.get(profile.id) ?? null,
        moonboardTotalAscents: moonStats.total.get(profile.id) ?? 0,
        moonboardAscents30d: moonStats.last30.get(profile.id) ?? 0,
        crags27HardestGrade: crags27Stats.hardest.get(profile.id) ?? null,
        crags27TotalAscents: crags27Stats.total.get(profile.id) ?? 0,
        crags27Ascents30d: 0,
        eightaHardestGrade: eightaStats.hardest.get(profile.id) ?? null,
        eightaTotalAscents: eightaStats.total.get(profile.id) ?? 0,
        eightaAscents30d: eightaStats.last30.get(profile.id) ?? 0,
      };
    });

  const mockAthletes = mockAthletesFromSnapshots();
  const realIds = new Set(realAthletes.map((a) => a.id));
  const extras = mockAthletes.filter((m) => !realIds.has(m.id));

  return [...realAthletes, ...extras].sort((a, b) =>
    a.username.localeCompare(b.username)
  );
}
