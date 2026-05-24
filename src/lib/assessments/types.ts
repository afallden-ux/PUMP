import type { AssessmentType } from "@/lib/constants/assessments";

export interface AssessmentLog {
  id: string;
  user_id: string;
  assessment_type: AssessmentType;
  recorded_at: string;
  body_weight_kg: number | null;
  resistance_kg: number | null;
  time_under_tension_s: number | null;
  total_duration_s: number | null;
  distance_cm: number | null;
  sets: number | null;
  reps: number | null;
  notes: string | null;
  created_at: string;
}
