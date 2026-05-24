import { eightaLogin, fetchEightaAscents } from "@/lib/eighta/client";
import { parseEightaCsv } from "@/lib/eighta/csv";
import type { EightaAscent, EightaSummary } from "@/lib/eighta/types";
import {
  decryptSessionCookies,
  encryptSessionCookies,
} from "@/lib/logbook/sessionCrypto";
import { getLogbookSessionSecret } from "@/lib/logbook/sessionSecret";
import { maxHardestGrade } from "@/lib/utils/hardestGrade";
import type { FontGrade } from "@/lib/constants/fontGrades";
import type { SupabaseClient } from "@supabase/supabase-js";

async function persistAscents(
  supabase: SupabaseClient,
  userId: string,
  ascents: EightaAscent[]
): Promise<void> {
  await supabase.from("eighta_ascents").delete().eq("user_id", userId);

  const batchSize = 100;
  for (let i = 0; i < ascents.length; i += batchSize) {
    const chunk = ascents.slice(i, i + batchSize).map((a) => ({
      user_id: userId,
      external_key: a.externalKey,
      category: a.category,
      climb_name: a.climbName,
      climbed_at: a.climbedAt,
      grade_display: a.gradeDisplay,
      ascent_style: a.ascentStyle,
      crag_name: a.cragName,
      area_name: a.areaName,
      comment: a.comment,
      rating: a.rating,
    }));
    const { error } = await supabase.from("eighta_ascents").insert(chunk);
    if (error) throw new Error(error.message);
  }
}

export async function connectEighta(
  supabase: SupabaseClient,
  userId: string,
  loginUsername: string,
  password: string,
  profileSlug: string
): Promise<void> {
  const secret = getLogbookSessionSecret();
  if (!secret) {
    throw new Error(
      "8a.nu integration is not configured (LOGBOOK_SESSION_SECRET or MOONBOARD_SESSION_SECRET missing on server)"
    );
  }

  const slug = profileSlug.trim();
  if (!slug) {
    throw new Error(
      "Profile slug is required (e.g. adam-ondra from 8a.nu/user/adam-ondra)"
    );
  }

  const cookies = await eightaLogin(loginUsername.trim(), password);
  const encrypted = encryptSessionCookies(cookies, secret);

  const { error } = await supabase.from("eighta_connections").upsert({
    user_id: userId,
    profile_slug: slug,
    login_username: loginUsername.trim(),
    session_cookies: encrypted,
    last_sync_status: "connected",
    last_sync_error: null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

export async function syncEightaLogbook(
  supabase: SupabaseClient,
  userId: string
): Promise<{ imported: number }> {
  const secret = getLogbookSessionSecret();
  if (!secret) {
    throw new Error("LOGBOOK_SESSION_SECRET not configured");
  }

  const { data: conn, error: connErr } = await supabase
    .from("eighta_connections")
    .select("session_cookies, profile_slug")
    .eq("user_id", userId)
    .maybeSingle();

  if (connErr || !conn) {
    throw new Error("No 8a.nu connection. Connect your account first.");
  }

  if (!conn.session_cookies) {
    throw new Error(
      "Imported from CSV only — connect with password to sync live, or import CSV again."
    );
  }

  let cookies;
  try {
    cookies = decryptSessionCookies(conn.session_cookies, secret);
  } catch {
    throw new Error("Session expired — reconnect your 8a.nu account.");
  }

  await supabase
    .from("eighta_connections")
    .update({ last_sync_status: "syncing", last_sync_error: null })
    .eq("user_id", userId);

  try {
    const ascents = await fetchEightaAscents(cookies, conn.profile_slug);
    await persistAscents(supabase, userId, ascents);

    await supabase
      .from("eighta_connections")
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
      .from("eighta_connections")
      .update({
        last_sync_status: "error",
        last_sync_error: msg,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    throw e;
  }
}

export async function importEightaCsv(
  supabase: SupabaseClient,
  userId: string,
  profileSlug: string,
  csvText: string
): Promise<{ imported: number }> {
  const slug = profileSlug.trim();
  if (!slug) {
    throw new Error("Profile slug is required");
  }
  if (!csvText.trim()) {
    throw new Error("CSV file is empty");
  }

  const ascents = parseEightaCsv(csvText);
  if (ascents.length === 0) {
    throw new Error("No ascents found in CSV — use the official 8a.nu logbook export");
  }

  await supabase.from("eighta_connections").upsert({
    user_id: userId,
    profile_slug: slug,
    login_username: slug,
    session_cookies: "",
    last_sync_status: "csv",
    last_sync_error: null,
    updated_at: new Date().toISOString(),
  });

  await persistAscents(supabase, userId, ascents);

  await supabase
    .from("eighta_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: "ok",
      last_sync_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return { imported: ascents.length };
}

export async function getEightaSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<EightaSummary> {
  const empty: EightaSummary = {
    connected: false,
    profileSlug: null,
    lastSyncAt: null,
    lastSyncStatus: "never",
    lastSyncError: null,
    totalAscents: 0,
    ascentsLast30Days: 0,
    hardestGrade: null,
    latestAscent: null,
  };

  const { data: conn, error: connErr } = await supabase
    .from("eighta_connections")
    .select("profile_slug, last_sync_at, last_sync_status, last_sync_error")
    .eq("user_id", userId)
    .maybeSingle();

  if (connErr?.message.includes("eighta")) return empty;
  if (!conn) return empty;

  const { data: ascents } = await supabase
    .from("eighta_ascents")
    .select("climb_name, climbed_at, grade_display, category")
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
          category: latest.category,
        }
      : null,
  };
}
