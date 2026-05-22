"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CrewMembershipDiagnosticProps {
  userId: string;
  loadedCrewCount: number;
}

export function CrewMembershipDiagnostic({
  userId,
  loadedCrewCount,
}: CrewMembershipDiagnosticProps) {
  const [hiddenCount, setHiddenCount] = useState(0);

  useEffect(() => {
    if (loadedCrewCount > 0) {
      setHiddenCount(0);
      return;
    }
    const supabase = createClient();
    supabase
      .from("crew_members")
      .select("crew_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .then(({ count }) => setHiddenCount(count ?? 0));
  }, [userId, loadedCrewCount]);

  if (hiddenCount === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-sm"
    >
      <div className="flex gap-2">
        <AlertTriangle className="size-5 shrink-0 text-amber-400" />
        <div>
          <p className="font-bold text-foreground">
            You&apos;re in {hiddenCount} crew{hiddenCount === 1 ? "" : "s"}, but the app
            can&apos;t load them
          </p>
          <p className="mt-1 text-muted-foreground">
            Run{" "}
            <code className="rounded bg-muted px-1 text-xs">
              supabase/RUN_CREW_COMPLETE_FIX.sql
            </code>{" "}
            in the Supabase SQL Editor, then hard-refresh this page.
          </p>
        </div>
      </div>
    </div>
  );
}
