import { crags27Login, fetchCrags27Ascents } from "@/lib/crags27/client";
import type { Crags27Summary } from "@/lib/crags27/types";
import {
  decryptSessionCookies,
  encryptSessionCookies,
} from "@/lib/logbook/sessionCrypto";
import { getLogbookSessionSecret } from "@/lib/logbook/sessionSecret";
import { maxHardestGrade } from "@/lib/utils/hardestGrade";
import type { FontGrade } from "@/lib/constants/fontGrades";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function connectCrags27(
  supabase: SupabaseClient,
  userId: string,
  loginUsername: string,
  password: string,
  profileSlug: string
): Promise<void> {
  const secret = getLogbookSessionSecret();
  if (!secret) {
    throw new Error(
      "27crags integration is not configured (LOGBOOK_SESSION_SECRET or MOONBOARD_SESSION_SECRET missing on server)"
    );
  }

  const slug = profileSlug.trim();
  if (!slug) {
    throw new Error("Profile slug is required (e.g. alex from thetopo.com/climbers/alex)");
  }

  const cookies = await crags27Login(loginUsername.trim(), password);
  const encrypted = encryptSessionCookies(cookies, secret);

  const { error } = await supabase.from("crags27_connections").upsert({
    user_id: userId,
    login_username: loginUsername.trim(),
    profile_slug: slug,
    session_cookies: encrypted,
    last_sync_status: "connected",
    last_sync_error: null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

export async function syncCrags27Logbook(
  supabase: SupabaseClient,
  userId: string
): Promise<{ imported: number }> {
  const secret = getLogbookSessionSecret();
  if (!secret) {
    throw new Error("LOGBOOK_SESSION_SECRET not configured");
  }

  const { data: conn, error: connErr } = await supabase
    .from("crags27_connections")
    .select("session_cookies, profile_slug")
    .eq("user_id", userId)
    .maybeSingle();

  if (connErr || !conn) {
    throw new Error("No 27crags connection. Connect your account first.");
  }

  let cookies;
  try {
    cookies = decryptSessionCookies(conn.session_cookies, secret);
  } catch {
    throw new Error("Session expired — reconnect your 27crags account.");
  }

  await supabase
    .from("crags27_connections")
    .update({ last_sync_status: "syncing", last_sync_error: null })
    .eq("user_id", userId);

  try {
    const ascents = await fetchCrags27Ascents(cookies, conn.profile_slug);

    await supabase.from("crags27_ascents").delete().eq("user_id", userId);

    const batchSize = 100;
    for (let i = 0; i < ascents.length; i += batchSize) {
      const chunk = ascents.slice(i, i + batchSize).map((a) => ({
        user_id: userId,
        external_key: a.externalKey,
        climb_name: a.climbName,
        climbed_at: a.climbedAt,
        grade_display: a.gradeDisplay,
        ascent_style: a.ascentStyle,
        crag_name: a.cragName,
        route_type: a.routeType,
        comment: a.comment,
      }));
      const { error } = await supabase.from("crags27_ascents").insert(chunk);
      if (error) throw new Error(error.message);
    }

    await supabase
      .from("crags27_connections")
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
      .from("crags27_connections")
      .update({
        last_sync_status: "error",
        last_sync_error: msg,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    throw e;
  }
}

export async function getCrags27Summary(
  supabase: SupabaseClient,
  userId: string
): Promise<Crags27Summary> {
  const empty: Crags27Summary = {
    connected: false,
    profileSlug: null,
    loginUsername: null,
    lastSyncAt: null,
    lastSyncStatus: "never",
    lastSyncError: null,
    totalAscents: 0,
    ascentsLast30Days: 0,
    hardestGrade: null,
    latestAscent: null,
  };

  const { data: conn, error: connErr } = await supabase
    .from("crags27_connections")
    .select(
      "profile_slug, login_username, last_sync_at, last_sync_status, last_sync_error"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (connErr?.message.includes("crags27")) return empty;
  if (!conn) return empty;

  const { data: ascents } = await supabase
    .from("crags27_ascents")
    .select("climb_name, climbed_at, grade_display")
    .eq("user_id", userId)
    .order("climbed_at", { ascending: false });

  const rows = ascents ?? [];
  const thirtyAgo = new Date();
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const cutoff = thirtyAgo.toISOString().slice(0, 10);

  const grades = rows.map((r) => r.grade_display as FontGrade | null).filter(Boolean);
  const hardest = maxHardestGrade(grades);
  const latest = rows[0];

  return {
    connected: true,
    profileSlug: conn.profile_slug,
    loginUsername: conn.login_username,
    lastSyncAt: conn.last_sync_at,
    lastSyncStatus: conn.last_sync_status,
    lastSyncError: conn.last_sync_error,
    totalAscents: rows.length,
    ascentsLast30Days: rows.filter((r) => r.climbed_at >= cutoff).length,
    hardestGrade: hardest,
    latestAscent: latest
      ? {
          climbName: latest.climb_name,
          grade: latest.grade_display,
          climbedAt: latest.climbed_at,
        }
      : null,
  };
}
