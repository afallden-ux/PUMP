"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Moon, RefreshCw, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoonboardLogbookChart } from "@/components/profile/MoonboardLogbookChart";
import { MoonboardLogbookImport } from "@/components/profile/MoonboardLogbookImport";
import { MOONBOARD_BOARDS, type MoonboardSummary } from "@/lib/moonboard/types";
import { createClient } from "@/lib/supabase/client";

interface MoonboardAscentRow {
  id: string;
  climb_name: string;
  climbed_at: string;
  grade_display: string | null;
  grade_logged: string | null;
  board_key: string;
  tries: string | null;
  is_benchmark: boolean;
}

interface MoonboardPanelProps {
  userId: string;
}

export function MoonboardPanel({ userId }: MoonboardPanelProps) {
  const [summary, setSummary] = useState<MoonboardSummary | null>(null);
  const [recent, setRecent] = useState<MoonboardAscentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/moonboard/summary");
      if (!res.ok) {
        if (res.status === 500) {
          const j = await res.json().catch(() => ({}));
          if (String(j.error ?? "").includes("moonboard")) {
            setSchemaMissing(true);
          }
        }
        setSummary(null);
        setRecent([]);
        setLoading(false);
        return;
      }
      setSchemaMissing(false);
      const data = (await res.json()) as MoonboardSummary;
      setSummary(data);

      if (data.connected) {
        const supabase = createClient();
        const { data: rows, error } = await supabase
          .from("moonboard_ascents")
          .select(
            "id, climb_name, climbed_at, grade_display, grade_logged, board_key, tries, is_benchmark"
          )
          .eq("user_id", userId)
          .order("climbed_at", { ascending: false })
          .limit(12);
        if (error?.message.includes("moonboard_ascents")) {
          setSchemaMissing(true);
          setRecent([]);
        } else {
          setRecent((rows ?? []) as MoonboardAscentRow[]);
        }
      } else {
        setRecent([]);
      }
    } catch {
      toast.error("Could not load MoonBoard status");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    try {
      const res = await fetch("/api/moonboard/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("MoonBoard connect failed", { description: json.error, duration: 10000 });
        return;
      }
      toast.success("MoonBoard connected");
      setPassword("");
      await refresh();
      void handleSync();
    } finally {
      setConnecting(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/moonboard/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Sync failed", { description: json.error, duration: 8000 });
        await refresh();
        return;
      }
      toast.success(`Imported ${json.imported} ascents from MoonBoard`);
      await refresh();
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    const res = await fetch("/api/moonboard/disconnect", { method: "POST" });
    if (!res.ok) {
      toast.error("Could not disconnect");
      return;
    }
    toast.success("MoonBoard disconnected");
    setUsername("");
    await refresh();
  }

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="size-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (schemaMissing) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">MoonBoard tables not set up</p>
        <p className="mt-1 text-xs">
          Run <code className="rounded bg-amber-100 px-1">supabase/RUN_MOONBOARD.sql</code> in
          Supabase, then add <code className="rounded bg-amber-100 px-1">MOONBOARD_SESSION_SECRET</code>{" "}
          on Vercel (32+ random characters).
        </p>
      </div>
    );
  }

  const connected = summary?.connected;
  const hasLogbook = summary?.logbookImported && (summary.logbook?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-slate-800 text-white">
          <Moon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800">MoonBoard</h3>
          <p className="text-xs text-slate-500">
            Import your in-app Logbook chart (recommended) or try linking moonboard.com — login
            often fails from our servers due to bot protection.
          </p>
        </div>
      </div>

      <MoonboardLogbookImport summary={summary} onSaved={refresh} />

      {hasLogbook && summary && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            {summary.logbookTotalEntries != null && (
              <span>{summary.logbookTotalEntries} entries · </span>
            )}
            {summary.logbookTotalProblems ?? summary.totalAscents} problems
            {summary.logbookImportedAt && (
              <span>
                {" "}
                · imported {new Date(summary.logbookImportedAt).toLocaleDateString()}
              </span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Problems" value={String(summary.totalAscents)} />
            <Stat label="Hardest send" value={summary.hardestGrade ?? "—"} />
            <Stat label="Grade bands" value={String(summary.logbook.length)} />
          </div>
          <MoonboardLogbookChart rows={summary.logbook} height={240} />
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <button
          type="button"
          className="text-xs font-semibold text-slate-600 hover:text-slate-800"
          onClick={() => setShowLogin((v) => !v)}
        >
          {showLogin ? "Hide" : "Show"} moonboard.com login (often blocked)
        </button>

        {showLogin && !connected && (
          <form onSubmit={handleConnect} className="mt-3 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="mb-user">MoonBoard username / email</Label>
              <Input
                id="mb-user"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Same as moonboard.com login"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-pass">Password</Label>
              <Input
                id="mb-pass"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                "Connect MoonBoard"
              )}
            </Button>
          </form>
        )}

        {showLogin && connected && summary && (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-sm text-slate-600">
                Linked as{" "}
                <strong className="text-slate-800">{summary.moonUsername}</strong>
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                <span className="ml-1.5">Sync now</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-slate-500"
                onClick={handleDisconnect}
              >
                <Unplug className="size-4" />
                <span className="ml-1">Disconnect</span>
              </Button>
            </div>

            {summary.lastSyncError && (
              <p className="mt-2 text-xs text-red-600">Last sync: {summary.lastSyncError}</p>
            )}

            {recent.length > 0 ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <p className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Recent ascents (API sync)
                </p>
                <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto">
                  {recent.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{row.climb_name}</p>
                        <p className="text-[10px] text-slate-400">
                          {MOONBOARD_BOARDS[row.board_key as keyof typeof MOONBOARD_BOARDS]
                            ?.label ?? row.board_key}{" "}
                          · {row.climbed_at}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums text-teal-700">
                        {row.grade_logged ?? row.grade_display ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-2 text-center text-xs text-slate-500">
                No API ascents — use logbook import above.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-slate-800">{value}</p>
      {sub && <p className="truncate text-[10px] text-slate-400">{sub}</p>}
    </div>
  );
}
