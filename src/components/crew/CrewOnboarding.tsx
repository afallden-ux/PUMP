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
  onSuccess?: () => void;
  compact?: boolean;
}

export function CrewOnboarding({ onLoneWolf, onSuccess, compact }: CrewOnboardingProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [crewName, setCrewName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function finishSuccess(message: string, description?: string) {
    toast.success(message, description ? { description } : undefined);
    setFormError(null);
    onSuccess?.();
    router.refresh();
    router.push("/crew");
    window.location.assign("/crew");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!crewName.trim()) return;
    setLoading(true);
    setFormError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_crew", {
      p_name: crewName.trim(),
    });
    setLoading(false);
    if (error) {
      const msg = error.message;
      setFormError(msg);
      toast.error("Could not create crew", { description: msg });
      return;
    }
    const crew = data as { name: string; invite_code: string };
    await finishSuccess(`Crew "${crew.name}" created!`, `Invite code: ${crew.invite_code}`);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setFormError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("join_crew_by_code", {
      p_code: inviteCode.trim(),
    });
    setLoading(false);
    if (error) {
      const msg = error.message;
      setFormError(msg);
      toast.error("Could not join crew", { description: msg });
      return;
    }
    const crew = data as { name: string };
    await finishSuccess(`Welcome to ${crew.name}!`);
  }

  if (mode === "create") {
    return (
      <Card className="border-teal-500/30">
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
            {formError && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {formError}
                {formError.includes("already in a crew") && (
                  <span className="mt-1 block text-xs">
                    Run RUN_CREW_COMPLETE_FIX.sql in Supabase, then try again.
                  </span>
                )}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("choose")}>
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-teal-600" disabled={loading}>
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
      <Card className="border-teal-500/30">
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
            {formError && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {formError}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("choose")}>
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-teal-600" disabled={loading}>
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
          ? "border-teal-500/30"
          : "border-teal-500/40 bg-gradient-to-b from-teal-500/10 to-transparent"
      }
    >
      <CardHeader className={compact ? "pb-2" : "text-center"}>
        {!compact && <Shield className="mx-auto size-10 text-teal-600" />}
        <CardTitle className={compact ? "text-lg font-black" : "text-xl font-black"}>
          {compact ? "Join a private crew" : "Optional: private crew"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {compact
            ? "Join as many crews as you want — feed & battles per crew."
            : "Track sessions solo, or create/join one or more gym squads."}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button
          type="button"
          className="w-full bg-teal-600 font-bold"
          onClick={() => {
            setFormError(null);
            setMode("create");
          }}
        >
          <Users className="size-4" />
          Create a crew
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full font-bold"
          onClick={() => {
            setFormError(null);
            setMode("join");
          }}
        >
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
