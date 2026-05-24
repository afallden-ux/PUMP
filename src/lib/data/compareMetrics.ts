import { createClient } from "@/lib/supabase/client";
import { getMockCompareSnapshot } from "@/lib/compare/mockAthletes";
import type { CompareSnapshot } from "@/lib/compare/types";
import { ASSESSMENT_TYPES, type AssessmentType } from "@/lib/constants/assessments";
import type { BodyMetricType } from "@/lib/constants/bodyMetrics";
import type { AssessmentLog } from "@/lib/assessments/types";
import {
  pctBodyWeight,
  pctHeight,
} from "@/lib/assessments/format";
import { getCrags27Summary } from "@/lib/crags27/sync";
import { getEightaSummary } from "@/lib/eighta/sync";
import { getMoonboardSummary } from "@/lib/moonboard/sync";
import { maxHardestGrade } from "@/lib/utils/hardestGrade";
import type { FontGrade } from "@/lib/constants/fontGrades";
import type { Profile } from "@/types/app";

function mapAssessmentRow(row: Record<string, unknown>): AssessmentLog {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    assessment_type: row.assessment_type as AssessmentType,
    recorded_at: row.recorded_at as string,
    body_weight_kg: row.body_weight_kg != null ? Number(row.body_weight_kg) : null,
    resistance_kg: row.resistance_kg != null ? Number(row.resistance_kg) : null,
    time_under_tension_s:
      row.time_under_tension_s != null ? Number(row.time_under_tension_s) : null,
    total_duration_s:
      row.total_duration_s != null ? Number(row.total_duration_s) : null,
    distance_cm: row.distance_cm != null ? Number(row.distance_cm) : null,
    sets: row.sets != null ? Number(row.sets) : null,
    reps: row.reps != null ? Number(row.reps) : null,
    notes: (row.notes as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

function latestPerAssessment(logs: AssessmentLog[]): Record<AssessmentType, AssessmentLog | null> {
  const map = Object.fromEntries(
    ASSESSMENT_TYPES.map((t) => [t, null])
  ) as Record<AssessmentType, AssessmentLog | null>;
  for (const log of logs) {
    if (!map[log.assessment_type]) {
      map[log.assessment_type] = log;
    }
  }
  return map;
}

function latestBodyMetric(
  rows: { metric_type: string; value_kg: number }[],
  type: BodyMetricType
): number | null {
  const match = rows.find((r) => r.metric_type === type);
  return match != null ? Number(match.value_kg) : null;
}

/** Load everything needed for side-by-side compare for one climber. */
export async function fetchCompareSnapshot(
  userId: string
): Promise<CompareSnapshot | null> {
  const mock = getMockCompareSnapshot(userId);
  if (mock) return mock;

  const supabase = createClient();

  const [
    profileRes,
    assessmentsRes,
    bodyMetricsRes,
    gradesRes,
    countRes,
    leaderboardRes,
    moonSummary,
    crags27Summary,
    eightaSummary,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, username, avatar_url, title, home_crag, height_cm, current_pump_score, last_logged_at"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("assessment_logs")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false }),
    supabase
      .from("body_metric_logs")
      .select("metric_type, value_kg, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false }),
    supabase
      .from("workout_logs")
      .select("hardest_grade")
      .eq("user_id", userId)
      .not("hardest_grade", "is", null),
    supabase
      .from("workout_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase.from("leaderboard_7d").select("*").order("points_7d", { ascending: false }),
    getMoonboardSummary(supabase, userId),
    getCrags27Summary(supabase, userId),
    getEightaSummary(supabase, userId),
  ]);

  if (profileRes.error || !profileRes.data) return null;

  const profile = profileRes.data as Profile;
  const heightCm = profile.height_cm ?? null;

  const assessmentLogs = (assessmentsRes.data ?? []).map((row) =>
    mapAssessmentRow(row as Record<string, unknown>)
  );
  const latestByAssessment = latestPerAssessment(assessmentLogs);

  const bodyRows = (bodyMetricsRes.data ?? []) as {
    metric_type: string;
    value_kg: number;
  }[];

  const finger = latestByAssessment.finger_strength;
  const pullup = latestByAssessment.weighted_pullup;
  const endurance = latestByAssessment.power_endurance;
  const hip = latestByAssessment.hip_flexibility;

  const bodyWeightFromAssessment =
    pullup?.body_weight_kg ?? finger?.body_weight_kg ?? null;
  const bodyWeightKg =
    bodyWeightFromAssessment ?? latestBodyMetric(bodyRows, "weight");

  const fingerStrengthKg =
    finger?.resistance_kg ?? latestBodyMetric(bodyRows, "max_hang");
  const fingerStrengthPctBw = pctBodyWeight(
    finger?.body_weight_kg ?? bodyWeightKg,
    fingerStrengthKg
  );

  const weightedPullupKg =
    pullup?.resistance_kg ?? latestBodyMetric(bodyRows, "max_pullup");
  const weightedPullupPctBw = pctBodyWeight(
    pullup?.body_weight_kg ?? bodyWeightKg,
    weightedPullupKg
  );

  const hipFlexibilityCm = hip?.distance_cm ?? null;
  const hipFlexibilityPctHeight = pctHeight(hipFlexibilityCm, heightCm);

  const hardestGrade = maxHardestGrade(
    (gradesRes.data ?? []).map((r) => r.hardest_grade as FontGrade | null)
  );

  const leaderboard = leaderboardRes.data ?? [];
  const weeklyIdx = leaderboard.findIndex((r) => r.id === userId);
  const weeklyRow = weeklyIdx >= 0 ? leaderboard[weeklyIdx] : null;

  return {
    profile,
    heightCm,
    bodyWeightKg,
    fingerStrengthKg,
    fingerStrengthPctBw,
    weightedPullupKg,
    weightedPullupPctBw,
    powerEnduranceTutS: endurance?.time_under_tension_s ?? null,
    powerEnduranceTotalS: endurance?.total_duration_s ?? null,
    hipFlexibilityCm,
    hipFlexibilityPctHeight,
    hardestGrade,
    totalLogs: countRes.count ?? 0,
    lifetimeScore: profile.current_pump_score,
    weeklyPoints: weeklyRow?.points_7d ?? 0,
    weeklyRank: weeklyIdx >= 0 ? weeklyIdx + 1 : null,
    latestByAssessment,
    moonboardTotalAscents: moonSummary.totalAscents,
    moonboardAscents30d: moonSummary.ascentsLast30Days,
    moonboardHardestGrade: moonSummary.hardestGrade,
    moonboardLatestClimb: moonSummary.latestAscent?.climbName ?? null,
    crags27TotalAscents: crags27Summary.totalAscents,
    crags27Ascents30d: crags27Summary.ascentsLast30Days,
    crags27HardestGrade: crags27Summary.hardestGrade,
    crags27LatestClimb: crags27Summary.latestAscent?.climbName ?? null,
    eightaTotalAscents: eightaSummary.totalAscents,
    eightaAscents30d: eightaSummary.ascentsLast30Days,
    eightaHardestGrade: eightaSummary.hardestGrade,
    eightaLatestClimb: eightaSummary.latestAscent?.climbName ?? null,
  };
}
