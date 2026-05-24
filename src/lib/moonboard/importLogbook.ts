import {
  mergeLogbookRows,
  rowTotal,
  statsFromLogbookRows,
  type MoonboardLogbookRow,
} from "@/lib/moonboard/logbook";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface ImportMoonboardLogbookInput {
  rows: MoonboardLogbookRow[];
  totalEntries?: number | null;
  totalProblems?: number | null;
  screenshotUrl?: string | null;
}

export async function importMoonboardLogbook(
  supabase: SupabaseClient,
  userId: string,
  input: ImportMoonboardLogbookInput
): Promise<{ gradeBands: number; totalProblems: number }> {
  const normalized = mergeLogbookRows([], input.rows).filter(
    (r) => rowTotal(r) > 0 || r.total > 0
  );

  if (normalized.length === 0) {
    throw new Error("Enter at least one grade with ascents (Flashed / 2nd / 3rd / 4+).");
  }

  const stats = statsFromLogbookRows(normalized);
  const totalProblems =
    input.totalProblems != null && input.totalProblems > 0
      ? input.totalProblems
      : stats.totalProblems;

  const { error: metaErr } = await supabase.from("moonboard_logbook_meta").upsert({
    user_id: userId,
    total_entries: input.totalEntries ?? null,
    total_problems: totalProblems,
    screenshot_url: input.screenshotUrl ?? null,
    imported_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (metaErr) {
    if (metaErr.message.includes("moonboard_logbook")) {
      throw new Error(
        "MoonBoard logbook tables missing — run supabase/RUN_MOONBOARD.sql in Supabase."
      );
    }
    throw new Error(metaErr.message);
  }

  await supabase.from("moonboard_logbook_stats").delete().eq("user_id", userId);

  const { error: insertErr } = await supabase.from("moonboard_logbook_stats").insert(
    normalized.map((row) => ({
      user_id: userId,
      grade: row.grade,
      flashed: row.flashed,
      second_try: row.secondTry,
      third_try: row.thirdTry,
      more_tries: row.moreTries,
      total: row.total > 0 ? row.total : rowTotal(row),
      updated_at: new Date().toISOString(),
    }))
  );

  if (insertErr) throw new Error(insertErr.message);

  return { gradeBands: stats.gradeBands, totalProblems };
}
