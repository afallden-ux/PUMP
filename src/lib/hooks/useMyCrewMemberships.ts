"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchMyCrewMemberships } from "@/lib/data/crew";
import type { CrewMembership } from "@/types/app";

export function useMyCrewMemberships(initial: CrewMembership[]) {
  const [memberships, setMemberships] = useState(initial);
  const [loading, setLoading] = useState(initial.length === 0);

  const refresh = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const next = await fetchMyCrewMemberships(supabase, user.id);
    setMemberships(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    setMemberships(initial);
  }, [initial]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { memberships, loading, refresh };
}
