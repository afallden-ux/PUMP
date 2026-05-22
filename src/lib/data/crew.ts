import { getWeeklyRankTitle } from "@/lib/constants/rankTitles";
import type { Crew, CrewMembership, LeaderboardEntry, Profile } from "@/types/app";
import type { Database } from "@/types/database";

export type SupabaseAppClient = Awaited<
  ReturnType<typeof import("@/lib/supabase/server").createClient>
>;

type LeaderboardRow = Database["public"]["Views"]["leaderboard_7d"]["Row"];

function parseRpcMemberships(data: unknown): CrewMembership[] | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  return data as unknown as CrewMembership[];
}

export function filterLeaderboardToCrew(
  rows: LeaderboardRow[],
  memberIds: string[]
): LeaderboardEntry[] {
  const idSet = new Set(memberIds);
  const filtered = rows
    .filter((row) => idSet.has(row.id))
    .sort((a, b) => b.points_7d - a.points_7d || b.sessions_7d - a.sessions_7d);
  const total = filtered.length;
  return filtered.map((row, index) => {
    const rank = index + 1;
    return {
      id: row.id,
      username: row.username,
      avatar_url: row.avatar_url,
      title: row.title,
      current_pump_score: row.current_pump_score,
      last_logged_at: row.last_logged_at,
      points_7d: row.points_7d,
      sessions_7d: row.sessions_7d,
      rank,
      rank_title: getWeeklyRankTitle(rank, total),
    };
  });
}

async function buildMembershipFromPublic(
  supabase: SupabaseAppClient,
  crewId: string,
  role: "owner" | "member"
): Promise<CrewMembership | null> {
  const { data, error } = await supabase.rpc("get_public_crew_detail", {
    p_crew_id: crewId,
  });
  if (error || !data || typeof data !== "object") return null;

  const raw = data as unknown as {
    id: string;
    name: string;
    location: string | null;
    banner_url: string | null;
    created_at: string;
    members: Array<Profile & { role?: "owner" | "member" }>;
  };

  const members = (raw.members ?? []).map(({ role: _r, ...p }) => p as Profile);

  return {
    crew: {
      id: raw.id,
      name: raw.name,
      invite_code: "",
      location: raw.location,
      banner_url: raw.banner_url,
      created_by: "",
      created_at: raw.created_at,
    },
    role,
    members: members.sort((a, b) => a.username.localeCompare(b.username)),
  };
}

async function buildMembership(
  supabase: SupabaseAppClient,
  crewId: string,
  role: "owner" | "member"
): Promise<CrewMembership | null> {
  const { data: crew } = await supabase
    .from("crews")
    .select("*")
    .eq("id", crewId)
    .single();

  if (!crew) return null;

  const { data: memberRows } = await supabase
    .from("crew_members")
    .select("user_id")
    .eq("crew_id", crewId);

  const memberIds = (memberRows ?? []).map((r) => r.user_id);
  let members: Profile[] = [];
  if (memberIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", memberIds);
    members = ((profiles ?? []) as Profile[]).sort((a, b) =>
      a.username.localeCompare(b.username)
    );
  }

  return {
    crew: crew as Crew,
    role,
    members,
  };
}

/** Load all crews for a user — RPC first, then RLS fallbacks. */
export async function fetchMyCrewMemberships(
  supabase: SupabaseAppClient,
  userId: string
): Promise<CrewMembership[]> {
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_my_crew_memberships"
  );
  const fromRpc = !rpcError ? parseRpcMemberships(rpcData) : null;
  if (fromRpc?.length) return fromRpc;

  const { data: rows, error: rowsError } = await supabase
    .from("crew_members")
    .select("crew_id, role")
    .eq("user_id", userId);

  if (rowsError || !rows?.length) return [];

  const memberships: CrewMembership[] = [];
  for (const row of rows) {
    const role = row.role as "owner" | "member";
    const m =
      (await buildMembership(supabase, row.crew_id, role)) ??
      (await buildMembershipFromPublic(supabase, row.crew_id, role));
    if (m) memberships.push(m);
  }

  return memberships.sort((a, b) => a.crew.name.localeCompare(b.crew.name));
}

export async function fetchAllCrewMemberships(
  supabase: SupabaseAppClient,
  userId: string
): Promise<CrewMembership[]> {
  return fetchMyCrewMemberships(supabase, userId);
}

/** True if user has crew_members rows but full crew payload could not be loaded. */
export async function hasHiddenCrewMembership(
  supabase: SupabaseAppClient,
  userId: string,
  loadedCount: number
): Promise<boolean> {
  if (loadedCount > 0) return false;
  const { data: rows } = await supabase
    .from("crew_members")
    .select("crew_id")
    .eq("user_id", userId)
    .limit(1);
  return (rows?.length ?? 0) > 0;
}

/** First crew membership, if any (legacy helper). */
export async function fetchCrewMembership(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string
): Promise<CrewMembership | null> {
  const all = await fetchAllCrewMemberships(supabase, userId);
  return all[0] ?? null;
}

/** Unique profiles across all crews the user belongs to. */
export function unionCrewMembers(memberships: CrewMembership[]): Profile[] {
  const byId = new Map<string, Profile>();
  for (const m of memberships) {
    for (const p of m.members) {
      byId.set(p.id, p);
    }
  }
  return [...byId.values()].sort((a, b) => a.username.localeCompare(b.username));
}

export function memberIdsFromMembership(
  membership: CrewMembership | null
): string[] {
  return membership?.members.map((m) => m.id) ?? [];
}
