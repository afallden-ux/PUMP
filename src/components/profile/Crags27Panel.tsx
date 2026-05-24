"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mountain, RefreshCw, Unplug } from "lucide-react";
import { Crags27AscentTree } from "@/components/profile/Crags27AscentTree";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Crags27Summary } from "@/lib/crags27/types";

export function Crags27Panel() {
  const [summary, setSummary] = useState<Crags27Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [profileSlug, setProfileSlug] = useState("");
  const [password, setPassword] = useState("");
  const [schemaMissing, setSchemaMissing] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crags27/summary");
      if (!res.ok) {
        if (res.status === 500) {
          const j = await res.json().catch(() => ({}));
          if (String(j.error ?? "").includes("crags27")) {
            setSchemaMissing(true);
          }
        }
        setSummary(null);
        setLoading(false);
        return;
      }
      setSchemaMissing(false);
      const data = (await res.json()) as Crags27Summary;
      setSummary(data);
      if (data.profileSlug) setProfileSlug(data.profileSlug);
    } catch {
      toast.error("Could not load 27crags status");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    try {
      const res = await fetch("/api/crags27/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password,
          profileSlug,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("27crags connect failed", { description: json.error });
        return;
      }
      toast.success("27crags connected");
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
      const res = await fetch("/api/crags27/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Sync failed", { description: json.error, duration: 8000 });
        await refresh();
        return;
      }
      toast.success(
        `Synced ascent tree — ${json.totalAscents ?? json.imported} total ascents`
      );
      await refresh();
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    const res = await fetch("/api/crags27/disconnect", { method: "POST" });
    if (!res.ok) {
      toast.error("Could not disconnect");
      return;
    }
    toast.success("27crags disconnected");
    setLoginUsername("");
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
        <p className="font-semibold">27crags tables not set up</p>
        <p className="mt-1 text-xs">
          Run <code className="rounded bg-amber-100 px-1">supabase/RUN_CRAGS27.sql</code> in
          Supabase (includes ascent tree). Set{" "}
          <code className="rounded bg-amber-100 px-1">LOGBOOK_SESSION_SECRET</code> on Vercel.
        </p>
      </div>
    );
  }

  const connected = summary?.connected;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-emerald-700 text-white">
          <Mountain className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800">27crags</h3>
          <p className="text-xs text-slate-500">
            Syncs your <strong>ascent tree</strong> (grade × flash / redpoint counts) from
            thetopo.com — not individual ticks. Password is never stored.
          </p>
        </div>
      </div>

      {!connected ? (
        <form
          onSubmit={handleConnect}
          className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="c27-login">27crags login (email or username)</Label>
            <Input
              id="c27-login"
              autoComplete="username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c27-slug">Profile slug</Label>
            <Input
              id="c27-slug"
              value={profileSlug}
              onChange={(e) => setProfileSlug(e.target.value)}
              placeholder="alex or paste https://thetopo.com/climbers/alex"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c27-pass">Password</Label>
            <Input
              id="c27-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700"
            disabled={connecting}
          >
            {connecting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Connecting…
              </>
            ) : (
              "Connect 27crags"
            )}
          </Button>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-600">
              Linked as{" "}
              <strong className="text-slate-800">{summary.profileSlug}</strong>
            </p>
            <Button type="button" size="sm" variant="outline" onClick={handleSync} disabled={syncing}>
              {syncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              <span className="ml-1.5">Sync tree</span>
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
            <p className="text-xs text-red-600">Last sync: {summary.lastSyncError}</p>
          )}
          {summary.lastSyncAt && (
            <p className="text-[10px] text-slate-400">
              Last synced {new Date(summary.lastSyncAt).toLocaleString()}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Total ascents" value={String(summary.totalAscents)} />
            <Stat
              label="Hardest (tree)"
              value={summary.hardestGradeDisplay ?? summary.hardestGrade ?? "—"}
            />
            <Stat label="Grade bands" value={String(summary.tree.filter((r) => r.total > 0).length)} />
          </div>

          <Crags27AscentTree rows={summary.tree} />
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}
