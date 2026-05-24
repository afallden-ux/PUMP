"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AssessmentLog } from "@/lib/assessments/types";
import type { AssessmentType } from "@/lib/constants/assessments";
import { ASSESSMENT_META } from "@/lib/constants/assessments";
import { chartValue, formatDateShort } from "@/lib/assessments/format";

interface AssessmentProgressChartProps {
  type: AssessmentType;
  logs: AssessmentLog[];
}

export function AssessmentProgressChart({ type, logs }: AssessmentProgressChartProps) {
  const meta = ASSESSMENT_META[type];

  const data = [...logs]
    .filter((l) => chartValue(l, type) != null)
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    .map((log) => ({
      label: formatDateShort(log.recorded_at),
      value: chartValue(log, type) as number,
      fullDate: log.recorded_at,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        Log your first assessment to see progress
      </div>
    );
  }

  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="assessmentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
            formatter={(value) => [`${value}`, meta.chartLabel]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullDate
                ? formatDateShort(payload[0].payload.fullDate as string)
                : ""
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0d9488"
            strokeWidth={2}
            fill="url(#assessmentFill)"
            dot={{ r: 4, fill: "#0d9488" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-slate-500">
        <span className="inline-block h-0.5 w-4 bg-teal-600 align-middle" />{" "}
        {meta.chartLabel}
      </p>
    </div>
  );
}
