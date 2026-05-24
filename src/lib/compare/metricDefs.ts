import type { CompareSnapshot } from "@/lib/compare/types";
import type { CompareWinner } from "@/lib/compare/types";
import { formatDuration, formatResistance } from "@/lib/assessments/format";
import { FONT_GRADES, type FontGrade } from "@/lib/constants/fontGrades";
import { gradeCompareWinner } from "@/lib/utils/gradeCompare";
import { winnerHigher } from "@/lib/compare/winners";

export type CompareCategory = "all" | "body" | "strength" | "flex" | "activity";

export interface CompareMetricDef {
  id: string;
  label: string;
  sublabel?: string;
  category: Exclude<CompareCategory, "all">;
  higherIsBetter: boolean;
  getValue: (s: CompareSnapshot) => number | null;
  display: (s: CompareSnapshot) => string;
}

function gradeIndex(g: FontGrade | null): number | null {
  if (!g) return null;
  const i = FONT_GRADES.indexOf(g);
  return i >= 0 ? i : null;
}

export const COMPARE_METRICS: CompareMetricDef[] = [
  {
    id: "height",
    label: "Height",
    category: "body",
    higherIsBetter: true,
    getValue: (s) => s.heightCm,
    display: (s) => (s.heightCm != null ? `${s.heightCm} cm` : "—"),
  },
  {
    id: "weight",
    label: "Body weight",
    sublabel: "Latest logged",
    category: "body",
    higherIsBetter: false,
    getValue: (s) => s.bodyWeightKg,
    display: (s) => (s.bodyWeightKg != null ? `${s.bodyWeightKg} kg` : "—"),
  },
  {
    id: "grade",
    label: "Hardest send",
    category: "body",
    higherIsBetter: true,
    getValue: (s) => gradeIndex(s.hardestGrade),
    display: (s) => s.hardestGrade ?? "—",
  },
  {
    id: "finger_kg",
    label: "Max hang load",
    sublabel: "Added resistance",
    category: "strength",
    higherIsBetter: true,
    getValue: (s) => s.fingerStrengthKg,
    display: (s) => formatResistance(s.fingerStrengthKg),
  },
  {
    id: "finger_pct",
    label: "Max hang",
    sublabel: "% body weight",
    category: "strength",
    higherIsBetter: true,
    getValue: (s) => s.fingerStrengthPctBw,
    display: (s) => (s.fingerStrengthPctBw != null ? `${s.fingerStrengthPctBw}%` : "—"),
  },
  {
    id: "pull_kg",
    label: "Weighted pull-up",
    sublabel: "Added load",
    category: "strength",
    higherIsBetter: true,
    getValue: (s) => s.weightedPullupKg,
    display: (s) => formatResistance(s.weightedPullupKg),
  },
  {
    id: "pull_pct",
    label: "Weighted pull-up",
    sublabel: "% body weight",
    category: "strength",
    higherIsBetter: true,
    getValue: (s) => s.weightedPullupPctBw,
    display: (s) =>
      s.weightedPullupPctBw != null ? `${s.weightedPullupPctBw}%` : "—",
  },
  {
    id: "endurance",
    label: "Power endurance",
    sublabel: "Time under tension",
    category: "flex",
    higherIsBetter: true,
    getValue: (s) => s.powerEnduranceTutS,
    display: (s) => formatDuration(s.powerEnduranceTutS),
  },
  {
    id: "hip_cm",
    label: "Hip flexibility",
    sublabel: "Reach",
    category: "flex",
    higherIsBetter: true,
    getValue: (s) => s.hipFlexibilityCm,
    display: (s) => (s.hipFlexibilityCm != null ? `${s.hipFlexibilityCm} cm` : "—"),
  },
  {
    id: "hip_pct",
    label: "Hip flexibility",
    sublabel: "% of height",
    category: "flex",
    higherIsBetter: true,
    getValue: (s) => s.hipFlexibilityPctHeight,
    display: (s) =>
      s.hipFlexibilityPctHeight != null ? `${s.hipFlexibilityPctHeight}%` : "—",
  },
  {
    id: "lifetime",
    label: "Lifetime CC",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => s.lifetimeScore,
    display: (s) => s.lifetimeScore.toLocaleString(),
  },
  {
    id: "weekly",
    label: "Points this week",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => s.weeklyPoints,
    display: (s) => String(s.weeklyPoints),
  },
  {
    id: "logs",
    label: "Session logs",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => s.totalLogs,
    display: (s) => String(s.totalLogs),
  },
  {
    id: "mb_total",
    label: "MoonBoard ascents",
    sublabel: "Synced logbook",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => s.moonboardTotalAscents,
    display: (s) => String(s.moonboardTotalAscents),
  },
  {
    id: "mb_30d",
    label: "MoonBoard (30d)",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => s.moonboardAscents30d,
    display: (s) => String(s.moonboardAscents30d),
  },
  {
    id: "mb_grade",
    label: "MoonBoard hardest",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => {
      if (!s.moonboardHardestGrade) return null;
      const i = FONT_GRADES.indexOf(s.moonboardHardestGrade);
      return i >= 0 ? i : null;
    },
    display: (s) => s.moonboardHardestGrade ?? "—",
  },
  {
    id: "c27_total",
    label: "27crags ascents",
    sublabel: "Synced tick list",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => s.crags27TotalAscents,
    display: (s) => String(s.crags27TotalAscents),
  },
  {
    id: "c27_30d",
    label: "27crags (30d)",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => s.crags27Ascents30d,
    display: (s) => String(s.crags27Ascents30d),
  },
  {
    id: "c27_grade",
    label: "27crags hardest",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => {
      if (!s.crags27HardestGrade) return null;
      const i = FONT_GRADES.indexOf(s.crags27HardestGrade);
      return i >= 0 ? i : null;
    },
    display: (s) => s.crags27HardestGrade ?? "—",
  },
  {
    id: "8a_total",
    label: "8a.nu ascents",
    sublabel: "Synced logbook",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => s.eightaTotalAscents,
    display: (s) => String(s.eightaTotalAscents),
  },
  {
    id: "8a_30d",
    label: "8a.nu (30d)",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => s.eightaAscents30d,
    display: (s) => String(s.eightaAscents30d),
  },
  {
    id: "8a_grade",
    label: "8a.nu hardest",
    category: "activity",
    higherIsBetter: true,
    getValue: (s) => {
      if (!s.eightaHardestGrade) return null;
      const i = FONT_GRADES.indexOf(s.eightaHardestGrade);
      return i >= 0 ? i : null;
    },
    display: (s) => s.eightaHardestGrade ?? "—",
  },
];

export function metricWinner(
  def: CompareMetricDef,
  left: CompareSnapshot,
  right: CompareSnapshot
): CompareWinner {
  if (
    def.id === "grade" ||
    def.id === "mb_grade" ||
    def.id === "c27_grade" ||
    def.id === "8a_grade"
  ) {
    const gradeFor = (side: CompareSnapshot) => {
      switch (def.id) {
        case "mb_grade":
          return side.moonboardHardestGrade;
        case "c27_grade":
          return side.crags27HardestGrade;
        case "8a_grade":
          return side.eightaHardestGrade;
        default:
          return side.hardestGrade;
      }
    };
    return gradeCompareWinner(gradeFor(left), gradeFor(right));
  }
  const lv = def.getValue(left);
  const rv = def.getValue(right);
  if (!def.higherIsBetter) {
    if (lv == null && rv == null) return "none";
    if (lv == null) return "right";
    if (rv == null) return "left";
    if (lv === rv) return "tie";
    return lv < rv ? "left" : "right";
  }
  return winnerHigher(lv, rv);
}

export function countWins(
  left: CompareSnapshot,
  right: CompareSnapshot
): { left: number; right: number; ties: number } {
  let leftWins = 0;
  let rightWins = 0;
  let ties = 0;
  for (const def of COMPARE_METRICS) {
    const w = metricWinner(def, left, right);
    if (w === "left") leftWins++;
    else if (w === "right") rightWins++;
    else if (w === "tie") ties++;
  }
  return { left: leftWins, right: rightWins, ties };
}

/** 0–100 normalized scores for radar chart */
export function radarScores(s: CompareSnapshot): Record<string, number> {
  const clamp = (v: number, max: number) =>
    Math.min(100, Math.round((v / max) * 100));

  return {
    Hang: s.fingerStrengthPctBw != null ? clamp(s.fingerStrengthPctBw, 200) : 0,
    Pull: s.weightedPullupPctBw != null ? clamp(s.weightedPullupPctBw, 200) : 0,
    Endurance:
      s.powerEnduranceTutS != null ? clamp(s.powerEnduranceTutS, 600) : 0,
    Flex:
      s.hipFlexibilityPctHeight != null
        ? clamp(s.hipFlexibilityPctHeight, 55)
        : 0,
    Activity: clamp(s.weeklyPoints, 450),
  };
}
