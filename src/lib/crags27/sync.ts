import { statsFromTreeRows } from "@/lib/crags27/ascentTree";
import {
  crags27Login,
  fetchCrags27AscentTree,
  normalizeProfileSlug,
} from "@/lib/crags27/client";
import type { Crags27Summary, Crags27TreeRow } from "@/lib/crags27/types";
import {
  decryptSessionCookies,
  encryptSessionCookies,
} from "@/lib/logbook/sessionCrypto";
import { getLogbookSessionSecret } from "@/lib/logbook/sessionSecret";
import type { SupabaseClient } from "@supabase/supabase-js";

function mapDbTreeRow(row: {
  grade: string;
  total: number;
  onsight: number;
  flash: number;
  redpoint: number;
  toprope: number;
}): Crags27TreeRow {
  return {
    grade: row.grade,
    total: row.total,
    onsight: row.onsight,
    flash: row.flash,
    redpoint: row.redpoint,
    toprope: row.toprope,
  };
}

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

  let slug = normalizeProfileSlug(profileSlug);
  const login = await crags27Login(loginUsername.trim(), password);

  if (!slug && login.detectedSlug) {
    slug = login.detectedSlug;
  }
  if (!slug) {
    throw new Error(
      "Profile slug is required — paste your profile URL or slug (e.g. alex from thetopo.com/climbers/alex)"
    );
  }

  const tree = await fetchCrags27AscentTree(login.cookies, slug);
  const { totalAscents } = statsFromTreeRows(tree);
  if (totalAscents === 0) {
    throw new Error(
      `Connected to 27crags but the ascent tree for "${slug}" is empty. Check your profile slug.`
    );
  }

  const encrypted = encryptSessionCookies(login.cookies, secret);

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
): Promise<{ imported: number; totalAscents: number }> {
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
    const tree = await fetchCrags27AscentTree(cookies, conn.profile_slug);
    const { totalAscents } = statsFromTreeRows(tree);

    if (totalAscents === 0) {
      throw new Error(
        "Ascent tree is empty. Check your profile slug (thetopo.com/climbers/YOUR-SLUG)."
      );
    }

    await supabase.from("crags27_ascent_tree").delete().eq("user_id", userId);
    await supabase.from("crags27_ascents").delete().eq("user_id", userId);

    const { error } = await supabase.from("crags27_ascent_tree").insert(
      tree.map((row) => ({
        user_id: userId,
        grade: row.grade,
        total: row.total,
        onsight: row.onsight,
        flash: row.flash,
        redpoint: row.redpoint,
        toprope: row.toprope,
        updated_at: new Date().toISOString(),
      }))
    );
    if (error) {
      if (error.message.includes("crags27_ascent_tree")) {
        throw new Error(
          "27crags ascent tree table missing — run supabase/RUN_CRAGS27.sql (includes ascent tree migration)."
        );
      }
      throw new Error(error.message);
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

    return { imported: tree.length, totalAscents };
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
    hardestGrade: null,
    hardestGradeDisplay: null,
    tree: [],
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

  const { data: treeRows, error: treeErr } = await supabase
    .from("crags27_ascent_tree")
    .select("grade, total, onsight, flash, redpoint, toprope")
    .eq("user_id", userId);

  if (treeErr?.message.includes("crags27_ascent_tree")) {
    return { ...empty, connected: true, profileSlug: conn.profile_slug };
  }

  const tree = (treeRows ?? []).map(mapDbTreeRow);
  const stats = statsFromTreeRows(tree);

  return {
    connected: true,
    profileSlug: conn.profile_slug,
    loginUsername: conn.login_username,
    lastSyncAt: conn.last_sync_at,
    lastSyncStatus: conn.last_sync_status,
    lastSyncError: conn.last_sync_error,
    totalAscents: stats.totalAscents,
    hardestGrade: stats.hardestGrade,
    hardestGradeDisplay: stats.hardestGradeDisplay,
    tree,
  };
}
