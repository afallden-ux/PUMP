"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoonboardLogbookChart } from "@/components/profile/MoonboardLogbookChart";
import {
  emptyLogbookTemplate,
  MOONBOARD_LOG_GRADES,
  rowTotal,
  type MoonboardLogbookRow,
} from "@/lib/moonboard/logbook";
import type { MoonboardSummary } from "@/lib/moonboard/types";
import { cn } from "@/lib/utils";

interface MoonboardLogbookImportProps {
  summary: MoonboardSummary | null;
  onSaved: () => void;
}

export function MoonboardLogbookImport({ summary, onSaved }: MoonboardLogbookImportProps) {
  const [rows, setRows] = useState<MoonboardLogbookRow[]>(() => emptyLogbookTemplate());
  const [totalEntries, setTotalEntries] = useState("");
  const [totalProblems, setTotalProblems] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (summary?.logbookImported && summary.logbook.length > 0) {
      const map = new Map(summary.logbook.map((r) => [r.grade, r]));
      setRows(
        MOONBOARD_LOG_GRADES.map((grade) => {
          const hit = map.get(grade);
          return (
            hit ?? {
              grade,
              flashed: 0,
              secondTry: 0,
              thirdTry: 0,
              moreTries: 0,
              total: 0,
            }
          );
        })
      );
      setTotalEntries(
        summary.logbookTotalEntries != null ? String(summary.logbookTotalEntries) : ""
      );
      setTotalProblems(
        summary.logbookTotalProblems != null ? String(summary.logbookTotalProblems) : ""
      );
      setScreenshotUrl(summary.logbookScreenshotUrl);
    }
  }, [summary?.logbookImported, summary?.logbook, summary?.logbookTotalEntries, summary?.logbookTotalProblems, summary?.logbookScreenshotUrl]);

  const updateRow = useCallback(
    (grade: string, field: keyof Omit<MoonboardLogbookRow, "grade" | "total">, raw: string) => {
      const n = Math.max(0, parseInt(raw, 10) || 0);
      setRows((prev) =>
        prev.map((r) => {
          if (r.grade !== grade) return r;
          const next = { ...r, [field]: n };
          return { ...next, total: rowTotal(next) };
        })
      );
    },
    []
  );

  async function handleScreenshot(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/moonboard/logbook-screenshot", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Screenshot upload failed", { description: json.error });
        return;
      }
      setScreenshotUrl(json.url as string);
      toast.success("Screenshot saved — enter counts from the chart below");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const payload = rows.filter((r) => rowTotal(r) > 0);
    if (payload.length === 0) {
      toast.error("Add at least one grade with ascents");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/moonboard/import-logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: payload,
          totalEntries: totalEntries ? parseInt(totalEntries, 10) : null,
          totalProblems: totalProblems ? parseInt(totalProblems, 10) : null,
          screenshotUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Import failed", { description: json.error });
        return;
      }
      toast.success(`Logbook saved (${json.totalProblems} problems)`);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const previewRows = rows.filter((r) => rowTotal(r) > 0);

  return (
    <div className="space-y-4 rounded-lg border border-teal-200 bg-teal-50/40 p-4">
      <div>
        <h4 className="font-semibold text-slate-800">Logbook import (recommended)</h4>
        <p className="mt-1 text-xs text-slate-600">
          MoonBoard blocks server login. Open the app → Logbook → screenshot the stacked bar
          chart, upload it here, then type the orange / green / yellow / red counts per grade
          (same as the legend: Flashed, 2nd try, 3rd try, more than 3 tries).
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Screenshot (optional)</Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleScreenshot(f);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            <span className="ml-1.5">{screenshotUrl ? "Replace image" : "Upload image"}</span>
          </Button>
        </div>
        <div className="space-y-1">
          <Label htmlFor="mb-entries" className="text-xs">
            Entries (header)
          </Label>
          <Input
            id="mb-entries"
            className="h-8 w-24"
            inputMode="numeric"
            placeholder="24"
            value={totalEntries}
            onChange={(e) => setTotalEntries(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mb-problems" className="text-xs">
            Problems (header)
          </Label>
          <Input
            id="mb-problems"
            className="h-8 w-24"
            inputMode="numeric"
            placeholder="198"
            value={totalProblems}
            onChange={(e) => setTotalProblems(e.target.value)}
          />
        </div>
      </div>

      {screenshotUrl && (
        <a
          href={screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-md border border-slate-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl}
            alt="MoonBoard logbook screenshot"
            className="max-h-40 w-full object-contain bg-slate-900"
          />
        </a>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[28rem] text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-2 py-2 text-left">Grade</th>
              <th className="px-2 py-2 text-center text-orange-600">Flash</th>
              <th className="px-2 py-2 text-center text-green-600">2nd</th>
              <th className="px-2 py-2 text-center text-yellow-600">3rd</th>
              <th className="px-2 py-2 text-center text-red-600">4+</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const active = rowTotal(row) > 0;
              return (
                <tr
                  key={row.grade}
                  className={cn("border-b border-slate-50", !active && "opacity-50")}
                >
                  <td className="px-2 py-1 font-semibold tabular-nums text-slate-800">
                    {row.grade}
                  </td>
                  {(["flashed", "secondTry", "thirdTry", "moreTries"] as const).map((field) => (
                    <td key={field} className="px-1 py-0.5">
                      <Input
                        className="h-7 text-center tabular-nums"
                        inputMode="numeric"
                        value={row[field] || ""}
                        onChange={(e) => updateRow(row.grade, field, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <MoonboardLogbookChart rows={previewRows} />

      <Button
        type="button"
        className="w-full bg-teal-600 hover:bg-teal-700"
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        <span className="ml-1.5">Save logbook to ClimbCompare</span>
      </Button>
    </div>
  );
}
