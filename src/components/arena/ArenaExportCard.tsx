"use client";

import { CloudDownload } from "lucide-react";
import { toast } from "sonner";

export function ArenaExportCard() {
  function handleExport() {
    toast.success("Export ready (mock)", {
      description: "CSV export will connect to workout_logs when wired to Supabase.",
    });
  }

  return (
    <div className="p-5">
      <h2 className="text-base font-semibold text-slate-800">Export log data</h2>
      <p className="mt-1 text-sm text-slate-500">
        Export your training history in a CSV format.
      </p>
      <button
        type="button"
        onClick={handleExport}
        className="mt-4 flex w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
      >
        <span>Download</span>
        <CloudDownload className="size-5 text-slate-400" />
      </button>
    </div>
  );
}
