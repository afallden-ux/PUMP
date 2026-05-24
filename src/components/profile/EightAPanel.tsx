"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BarChart3, Loader2, RefreshCw, Unplug, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EightaSummary } from "@/lib/eighta/types";
import { createClient } from "@/lib/supabase/client";

interface EightaAscentRow {
  id: string;
  climb_name: string;
  climbed_at: string;
  grade_display: string | null;
  category: string;
  crag_name: string | null;
}

interface EightAPanelProps {
  userId: string;
}

export function EightAPanel({ userId }: EightAPanelProps) {
  const [summary, setSummary] = useState<EightaSummary | null>(null);
  const [recent, setRecent] = useState<EightaAscentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [profileSlug, setProfileSlug] = useState("");
  const [password, setPassword] = useState("");
  const [schemaMissing, setSchemaMissing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/eighta/summary");
      if (!res.ok) {
        if (res.status === 500) {
          const j = await res.json().catch(() => ({}));
          if (String(j.error ?? "").includes("eighta")) {
            setSchemaMissing(true);
          }
        }
        setSummary(null);
        setRecent([]);
        setLoading(false);
        return;
      }
      setSchemaMissing(false);
      const data = (await res.json()) as EightaSummary;
      setSummary(data);
      if (data.profileSlug) setProfileSlug(data.profileSlug);

      if (data.connected) {
        const supabase = createClient();
        const { data: rows, error } = await supabase
          .from("eighta_ascents")
          .select("id, climb_name, climbed_at, grade_display, category, crag_name")
          .eq("user_id", userId)
          .order("climbed_at", { ascending: false })
          .limit(12);
        if (error?.message.includes("eighta_ascents")) {
          setSchemaMissing(true);
          setRecent([]);
        } else {
          setRecent((rows ?? []) as EightaAscentRow[]);
        }
      } else {
        setRecent([]);
      }
    } catch {
      toast.error("Could not load 8a.nu status");
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
      const res = await fetch("/api/eighta/connect", {
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
        toast.error("8a.nu connect failed", { description: json.error });
        return;
      }
      toast.success("8a.nu connected");
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
      const res = await fetch("/api/eighta/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Sync failed", { description: json.error, duration: 8000 });
        await refresh();
        return;
      }
      toast.success(`Imported ${json.imported} ascents from 8a.nu`);
      await refresh();
    } finally {
      setSyncing(false);
    }
  }

  async function handleCsvFile(file: File) {
    if (!profileSlug.trim()) {
      toast.error("Enter your 8a.nu profile slug first");
      return;
    }
    setImporting(true);
    try {
      const csv = await file.text();
      const res = await fetch("/api/eighta/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileSlug, csv }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("CSV import failed", { description: json.error });
        return;
      }
      toast.success(`Imported ${json.imported} ascents from CSV`);
      await refresh();
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDisconnect() {
    const res = await fetch("/api/eighta/disconnect", { method: "POST" });
    if (!res.ok) {
      toast.error("Could not disconnect");
      return;
    }
    toast.success("8a.nu disconnected");
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
        <p className="font-semibold">8a.nu tables not set up</p>
        <p className="mt-1 text-xs">
          Run <code className="rounded bg-amber-100 px-1">supabase/RUN_EIGHTA.sql</code> in
          Supabase. Reuse <code className="rounded bg-amber-100 px-1">MOONBOARD_SESSION_SECRET</code>{" "}
          or set <code className="rounded bg-amber-100 px-1">LOGBOOK_SESSION_SECRET</code> on Vercel.
        </p>
      </div>
    );
  }

  const connected = summary?.connected;
  const csvOnly = summary?.lastSyncStatus === "csv";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-violet-700 text-white">
          <BarChart3 className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800">8a.nu</h3>
          <p className="text-xs text-slate-500">
            Connect with login to sync sport &amp; boulder logbooks, or import the official CSV
            export from your profile.
          </p>
        </div>
      </div>

      {!connected ? (
        <div className="space-y-3">
          <form
            onSubmit={handleConnect}
            className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4"
          >
            <div className="space-y-2">
              <Label htmlFor="8a-login">8a.nu login (email)</Label>
              <Input
                id="8a-login"
                autoComplete="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="8a-slug">Profile slug</Label>
              <Input
                id="8a-slug"
                value={profileSlug}
                onChange={(e) => setProfileSlug(e.target.value)}
                placeholder="adam-ondra — from 8a.nu/user/adam-ondra"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="8a-pass">Password</Label>
              <Input
                id="8a-pass"
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
                "Connect 8a.nu"
              )}
            </Button>
          </form>

          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
            <p className="text-xs font-medium text-slate-600">Or import CSV export</p>
            <div className="mt-2 space-y-2">
              <Input
                value={profileSlug}
                onChange={(e) => setProfileSlug(e.target.value)}
                placeholder="Profile slug (required)"
              />
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleCsvFile(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={importing}
                onClick={() => fileRef.current?.click()}
              >
                {importing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                <span className="ml-1.5">Upload 8a.nu logbook CSV</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-600">
              Linked as{" "}
              <strong className="text-slate-800">{summary.profileSlug}</strong>
              {csvOnly && (
                <span className="ml-1 text-xs text-amber-600">(CSV import)</span>
              )}
            </p>
            {!csvOnly && (
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
            )}
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

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Total ascents" value={String(summary.totalAscents)} />
            <Stat label="Last 30 days" value={String(summary.ascentsLast30Days)} />
            <Stat label="Hardest send" value={summary.hardestGrade ?? "—"} />
            <Stat
              label="Latest"
              value={summary.latestAscent?.grade ?? "—"}
              sub={summary.latestAscent?.climbName.slice(0, 18)}
            />
          </div>

          {recent.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <p className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Recent ascents
              </p>
              <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
                {recent.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">{row.climb_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {row.category} · {row.crag_name ?? "—"} · {row.climbed_at}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-teal-700">
                      {row.grade_display ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">
              No ascents yet — sync or import your logbook.
            </p>
          )}
        </>
      )}
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
