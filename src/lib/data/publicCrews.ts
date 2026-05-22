import {
  combineSessionCounts,
  fetchSessionCountsMap,
  type SessionCounts,
  type SessionCountsMap,
} from "@/lib/data/sessionBadges";
import type { Profile } from "@/types/app";

export interface PublicCrewListItem {
  id: string;
  name: string;
  location: string | null;
  banner_url: string | null;
  member_count: number;
  created_at: string;
}

export interface PublicCrewMember extends Profile {
  role: "owner" | "member";
}

export interface PublicCrewDetail {
  id: string;
  name: string;
  location: string | null;
  banner_url: string | null;
  created_at: string;
  member_count: number;
  members: PublicCrewMember[];
  combinedCounts: SessionCounts;
  memberCountsMap: SessionCountsMap;
}

export async function fetchPublicCrewList(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
): Promise<PublicCrewListItem[]> {
  const { data, error } = await supabase.rpc("list_public_crews");
  if (error || !data) return [];
  return (data as PublicCrewListItem[]).map((row) => ({
    id: row.id,
    name: row.name,
    location: row.location,
    banner_url: row.banner_url,
    member_count: Number(row.member_count),
    created_at: row.created_at,
  }));
}

export async function fetchPublicCrewDetail(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  crewId: string
): Promise<PublicCrewDetail | null> {
  const { data, error } = await supabase.rpc("get_public_crew_detail", {
    p_crew_id: crewId,
  });

  if (error || !data) return null;

  const raw = data as unknown as {
    id: string;
    name: string;
    location: string | null;
    banner_url: string | null;
    created_at: string;
    member_count: number;
    members: PublicCrewMember[];
  };

  const members = (raw.members ?? []).map((m) => ({
    ...m,
    home_crag: m.home_crag ?? null,
    role: m.role as "owner" | "member",
  }));

  const memberIds = members.map((m) => m.id);
  const memberCountsMap = await fetchSessionCountsMap(supabase, memberIds);
  const empty = {
    hangboard: 0,
    climbing: 0,
    board: 0,
    outdoors: 0,
    gym: 0,
    stretching: 0,
    total: 0,
  };
  const combinedCounts = combineSessionCounts(
    memberIds.map((id) => memberCountsMap[id] ?? empty)
  );

  return {
    id: raw.id,
    name: raw.name,
    location: raw.location,
    banner_url: raw.banner_url,
    created_at: raw.created_at,
    member_count: raw.member_count,
    members,
    combinedCounts,
    memberCountsMap,
  };
}
