"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface CrewOnboardingProps {
  onLoneWolf?: () => void;
  compact?: boolean;
}

export function CrewOnboarding({ onLoneWolf, compact }: CrewOnboardingProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [crewName, setCrewName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!crewName.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_crew", {
      p_name: crewName.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error("Could not create crew", { description: error.message });
      return;
    }
    toast.success(`Crew "${(data as { name: string }).name}" created!`, {
      description: `Invite code: ${(data as { invite_code: string }).invite_code}`,
    });
    router.refresh();
    window.location.reload();
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("join_crew_by_code", {
      p_code: inviteCode.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error("Could not join crew", { description: error.message });
      return;
    }
    toast.success(`Welcome to ${(data as { name: string }).name}!`);
    router.refresh();
    window.location.reload();
  }

  if (mode === "create") {
    return (
      <Card className="border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-lg font-black">Create private crew</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crew-name">Crew name</Label>
              <Input
                id="crew-name"
                placeholder="Friday Night Crushers"
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                maxLength={40}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("choose")}>
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-orange-600" disabled={loading}>
                {loading ? "Creating..." : "Create & get invite code"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (mode === "join") {
    return (
      <Card className="border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-lg font-black">Join with invite code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite code</Label>
              <Input
                id="invite-code"
                placeholder="AB12CD34"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="font-mono uppercase tracking-widest"
                maxLength={8}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("choose")}>
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-orange-600" disabled={loading}>
                {loading ? "Joining..." : "Join crew"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={
        compact
          ? "border-orange-500/30"
          : "border-orange-500/40 bg-gradient-to-b from-orange-500/10 to-transparent"
      }
    >
      <CardHeader className={compact ? "pb-2" : "text-center"}>
        {!compact && <Shield className="mx-auto size-10 text-orange-400" />}
        <CardTitle className={compact ? "text-lg font-black" : "text-xl font-black"}>
          {compact ? "Join a private crew" : "Optional: private crew"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {compact
            ? "Crew feed, battles, and crew-only boards unlock when you join."
            : "Track sessions solo, or create/join a crew for your gym squad."}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button
          className="w-full bg-orange-600 font-bold"
          onClick={() => setMode("create")}
        >
          <Users className="size-4" />
          Create a crew
        </Button>
        <Button variant="outline" className="w-full font-bold" onClick={() => setMode("join")}>
          I have an invite code
        </Button>
        {onLoneWolf && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onLoneWolf}
          >
            Continue as lone wolf
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
