"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, RefreshCw, Shield, LogOut, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { CrewMembership } from "@/types/app";

interface CrewBannerProps {
  membership: CrewMembership;
}

export function CrewBanner({ membership }: CrewBannerProps) {
  const router = useRouter();
  const [code, setCode] = useState(membership.crew.invite_code);
  const [busy, setBusy] = useState(false);
  const isOwner = membership.role === "owner";

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  }

  async function regenerateCode() {
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("regenerate_invite_code", {
      p_crew_id: membership.crew.id,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not refresh code", { description: error.message });
      return;
    }
    setCode(data as string);
    toast.success("New invite code generated");
  }

  async function leaveCrew() {
    if (
      !confirm(
        `Leave "${membership.crew.name}"? If you're the last member, the crew will be removed.`
      )
    )
      return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("leave_crew", {
      p_crew_id: membership.crew.id,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not leave", { description: error.message });
      return;
    }
    toast.message(`Left ${membership.crew.name}`);
    router.refresh();
  }

  async function deleteCrew() {
    if (
      !confirm(
        `Delete "${membership.crew.name}" for everyone? This cannot be undone.`
      )
    )
      return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_crew", {
      p_crew_id: membership.crew.id,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not delete crew", { description: error.message });
      return;
    }
    toast.message("Crew deleted");
    router.refresh();
  }

  return (
    <Card className="border-orange-500/30 bg-orange-500/5">
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="size-5 shrink-0 text-orange-400" />
            <div>
              <p className="font-black text-foreground">{membership.crew.name}</p>
              <p className="text-xs text-muted-foreground">
                {membership.members.length} member
                {membership.members.length === 1 ? "" : "s"}
                {membership.crew.location
                  ? ` · 📍 ${membership.crew.location}`
                  : " · private crew"}
              </p>
            </div>
          </div>
          {isOwner && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              Owner
            </Badge>
          )}
        </div>

        <div className="rounded-lg border border-dashed border-orange-500/40 bg-background/50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Invite code — share with your squad
          </p>
          <p className="mt-1 font-mono text-2xl font-black tracking-[0.2em] text-orange-400">
            {code}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href="/crew"
              className={cn(buttonVariants({ size: "sm" }), "bg-orange-600 text-white")}
            >
              <Users className="size-3.5" />
              Crew page
            </Link>
            <Button type="button" size="sm" variant="outline" onClick={copyCode}>
              <Copy className="size-3.5" />
              Copy
            </Button>
            {isOwner && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={regenerateCode}
                disabled={busy}
              >
                <RefreshCw className="size-3.5" />
                New code
              </Button>
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          Squad: {membership.members.map((m) => m.username).join(", ")}
        </p>

        <div className="flex gap-2 border-t border-border/60 pt-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={leaveCrew}
            disabled={busy}
          >
            <LogOut className="size-3.5" />
            Leave
          </Button>
          {isOwner && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={deleteCrew}
              disabled={busy}
            >
              <Trash2 className="size-3.5" />
              Delete crew
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
