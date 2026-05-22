"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Swords, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCrewBattles } from "@/lib/hooks/useCrewBattles";
import { createClient } from "@/lib/supabase/client";
import type { Crew, CrewBattle, CrewMembership } from "@/types/app";

interface CrewBattlesPanelProps {
  membership: CrewMembership;
  isOwner: boolean;
  refreshKey?: number;
}

function battleLabel(
  battle: CrewBattle,
  myCrewId: string
): { us: string; them: string; usPts: number; themPts: number } {
  const weAreChallenger = battle.challenger_crew_id === myCrewId;
  const us = weAreChallenger
    ? battle.challenger_crew?.name ?? "Us"
    : battle.opponent_crew?.name ?? "Us";
  const them = weAreChallenger
    ? battle.opponent_crew?.name ?? "Them"
    : battle.challenger_crew?.name ?? "Them";
  const usPts = weAreChallenger
    ? (battle.challenger_points ?? 0)
    : (battle.opponent_points ?? 0);
  const themPts = weAreChallenger
    ? (battle.opponent_points ?? 0)
    : (battle.challenger_points ?? 0);
  return { us, them, usPts, themPts };
}

export function CrewBattlesPanel({
  membership,
  isOwner,
  refreshKey = 0,
}: CrewBattlesPanelProps) {
  const router = useRouter();
  const [opponentCode, setOpponentCode] = useState("");
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const { battles, loading, refresh } = useCrewBattles(
    membership.crew.id,
    refreshKey
  );

  const myCrewId = membership.crew.id;
  const pendingIncoming = battles.filter(
    (b) => b.status === "pending" && b.opponent_crew_id === myCrewId
  );
  const active = battles.filter((b) => b.status === "active");

  async function challenge() {
    if (!opponentCode.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("challenge_crew_battle", {
      p_opponent_code: opponentCode.trim(),
      p_duration_days: days,
    });
    setBusy(false);
    if (error) {
      toast.error("Battle failed", { description: error.message });
      return;
    }
    const d = data as { opponent_name: string };
    toast.success(`Challenge sent to ${d.opponent_name}!`);
    setOpponentCode("");
    refresh();
    router.refresh();
  }

  async function acceptBattle(battleId: string) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("accept_crew_battle", {
      p_battle_id: battleId,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not accept", { description: error.message });
      return;
    }
    toast.success("Battle is ON! Log sessions to stack points.");
    refresh();
  }

  async function declineBattle(battleId: string) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("decline_crew_battle", {
      p_battle_id: battleId,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not decline", { description: error.message });
      return;
    }
    refresh();
  }

  return (
    <Card className="border-red-500/30 bg-gradient-to-b from-red-950/20 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-black">
          <Swords className="size-5 text-red-400" />
          Crew battles
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Challenge another crew by their invite code. Most points when time&apos;s up wins.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && (
          <div className="space-y-2 rounded-lg border border-dashed border-red-500/30 p-3">
            <Label className="text-xs font-bold uppercase">Declare war</Label>
            <Input
              placeholder="Opponent crew code"
              value={opponentCode}
              onChange={(e) => setOpponentCode(e.target.value.toUpperCase())}
              className="font-mono uppercase tracking-widest"
              maxLength={8}
            />
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">Days:</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value) || 7)}
                className="w-20"
              />
              <Button
                size="sm"
                className="ml-auto bg-red-600 hover:bg-red-500"
                onClick={challenge}
                disabled={busy}
              >
                Challenge
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Loading battles...</p>
        ) : (
          <>
            {pendingIncoming.map((battle) => (
              <motion.div
                key={battle.id}
                className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <p className="text-sm font-bold">
                  {(battle.challenger_crew as Crew)?.name ?? "A crew"} wants to battle!
                </p>
                <p className="text-xs text-muted-foreground">
                  {battle.duration_days} days · all session points count
                </p>
                {isOwner && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-orange-600"
                      onClick={() => acceptBattle(battle.id)}
                      disabled={busy}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineBattle(battle.id)}
                      disabled={busy}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}

            {active.map((battle) => {
              const { us, them, usPts, themPts } = battleLabel(battle, myCrewId);
              const winning = usPts > themPts;
              const ends = battle.ends_at
                ? new Date(battle.ends_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={battle.id}
                  className="rounded-xl border border-red-500/40 bg-red-950/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE BATTLE
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      Ends {ends}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    <div
                      className={`rounded-lg p-2 ${winning ? "bg-orange-500/20 ring-1 ring-orange-500" : "bg-muted/30"}`}
                    >
                      <p className="text-[10px] uppercase text-muted-foreground">{us}</p>
                      <p className="text-2xl font-black text-orange-400">{usPts}</p>
                      <Shield className="mx-auto mt-1 size-4 text-orange-400/60" />
                    </div>
                    <div
                      className={`rounded-lg p-2 ${!winning && themPts !== usPts ? "bg-orange-500/20 ring-1 ring-orange-500" : "bg-muted/30"}`}
                    >
                      <p className="text-[10px] uppercase text-muted-foreground">{them}</p>
                      <p className="text-2xl font-black">{themPts}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[10px] italic text-muted-foreground">
                    Log everything — even stretching hurts them if you&apos;re ahead
                  </p>
                </div>
              );
            })}

            {battles.filter((b) => b.status === "completed").slice(0, 2).map((battle) => {
              const { us, them, usPts, themPts } = battleLabel(battle, myCrewId);
              const won = battle.winner_crew_id === myCrewId;
              return (
                <div
                  key={battle.id}
                  className="rounded-lg border border-border/50 p-2 text-sm opacity-80"
                >
                  <span className="font-semibold">{won ? "Victory" : "Defeat"}</span> vs{" "}
                  {us === membership.crew.name ? them : us}: {usPts}–{themPts}
                </div>
              );
            })}

            {battles.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-2">
                No battles yet. Grab another crew&apos;s invite code and declare war.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
