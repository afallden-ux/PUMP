import {
  decryptSessionCookies,
  encryptSessionCookies,
  getMoonboardSessionSecret,
} from "@/lib/moonboard/sessionCrypto";
import { fetchMoonboardAscents, moonboardLogin } from "@/lib/moonboard/client";
import type { MoonboardSummary } from "@/lib/moonboard/types";
import { maxHardestGrade } from "@/lib/utils/hardestGrade";
import type { FontGrade } from "@/lib/constants/fontGrades";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function connectMoonboard(
  supabase: SupabaseClient,
  userId: string,
  username: string,
  password: string
): Promise<void> {
  const secret = getMoonboardSessionSecret();
  if (!secret) {
    throw new Error(
      "MoonBoard integration is not configured (MOONBOARD_SESSION_SECRET missing on server)"
    );
  }

  const cookies = await moonboardLogin(username.trim(), password);
  const encrypted = encryptSessionCookies(cookies, secret);

  const { error } = await supabase.from("moonboard_connections").upsert({
    user_id: userId,
    moon_username: username.trim(),
    session_cookies: encrypted,
    last_sync_status: "connected",
    last_sync_error: null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

export async function syncMoonboardLogbook(
  supabase: SupabaseClient,
  userId: string
): Promise<{ imported: number }> {
  const secret = getMoonboardSessionSecret();
  if (!secret) {
    throw new Error("MOONBOARD_SESSION_SECRET not configured");
  }

  const { data: conn, error: connErr } = await supabase
    .from("moonboard_connections")
    .select("session_cookies, moon_username")
    .eq("user_id", userId)
    .maybeSingle();

  if (connErr || !conn) {
    throw new Error("No MoonBoard connection. Connect your account first.");
  }

  let cookies;
  try {
    cookies = decryptSessionCookies(conn.session_cookies, secret);
  } catch {
    throw new Error("Session expired — reconnect your MoonBoard account.");
  }

  await supabase
    .from("moonboard_connections")
    .update({ last_sync_status: "syncing", last_sync_error: null })
    .eq("user_id", userId);

  try {
    const ascents = await fetchMoonboardAscents(cookies);

    await supabase.from("moonboard_ascents").delete().eq("user_id", userId);

    const batchSize = 100;
    for (let i = 0; i < ascents.length; i += batchSize) {
      const chunk = ascents.slice(i, i + batchSize).map((a) => ({
        user_id: userId,
        external_key: a.externalKey,
        board_key: a.boardKey,
        angle: a.angle,
        climb_name: a.climbName,
        climbed_at: a.climbedAt,
        grade_display: a.gradeDisplay,
        grade_logged: a.gradeLogged,
        tries: a.tries,
        is_benchmark: a.isBenchmark,
        comment: a.comment,
      }));
      const { error } = await supabase.from("moonboard_ascents").insert(chunk);
      if (error) throw new Error(error.message);
    }

    await supabase
      .from("moonboard_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: "ok",
        last_sync_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return { imported: ascents.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    await supabase
      .from("moonboard_connections")
      .update({
        last_sync_status: "error",
        last_sync_error: msg,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    throw e;
  }
}

export async function getMoonboardSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<MoonboardSummary> {
  const { data: conn, error: connErr } = await supabase
    .from("moonboard_connections")
    .select("moon_username, last_sync_at, last_sync_status, last_sync_error")
    .eq("user_id", userId)
    .maybeSingle();

  if (connErr?.message.includes("moonboard")) {
    return {
      connected: false,
      moonUsername: null,
      lastSyncAt: null,
      lastSyncStatus: "never",
      lastSyncError: null,
      totalAscents: 0,
      ascentsLast30Days: 0,
      hardestGrade: null,
      latestAscent: null,
    };
  }

  if (!conn) {
    return {
      connected: false,
      moonUsername: null,
      lastSyncAt: null,
      lastSyncStatus: "never",
      lastSyncError: null,
      totalAscents: 0,
      ascentsLast30Days: 0,
      hardestGrade: null,
      latestAscent: null,
    };
  }

  const { data: ascents } = await supabase
    .from("moonboard_ascents")
    .select(
      "climb_name, climbed_at, grade_display, grade_logged, board_key"
    )
    .eq("user_id", userId)
    .order("climbed_at", { ascending: false });

  const rows = ascents ?? [];
  const thirtyAgo = new Date();
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const cutoff = thirtyAgo.toISOString().slice(0, 10);

  const grades = rows
    .map((r) => (r.grade_logged || r.grade_display) as FontGrade | null)
    .filter(Boolean);
  const hardest = maxHardestGrade(grades);
  const latest = rows[0];

  return {
    connected: true,
    moonUsername: conn.moon_username,
    lastSyncAt: conn.last_sync_at,
    lastSyncStatus: conn.last_sync_status,
    lastSyncError: conn.last_sync_error,
    totalAscents: rows.length,
    ascentsLast30Days: rows.filter((r) => r.climbed_at >= cutoff).length,
    hardestGrade: hardest,
    latestAscent: latest
      ? {
          climbName: latest.climb_name,
          grade: latest.grade_logged ?? latest.grade_display,
          climbedAt: latest.climbed_at,
          boardKey: latest.board_key,
        }
      : null,
  };
}
