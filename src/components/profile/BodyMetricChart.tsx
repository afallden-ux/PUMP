"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyMetricType } from "@/lib/constants/bodyMetrics";
import { BODY_METRIC_META } from "@/lib/constants/bodyMetrics";
import type { BodyMetricLog } from "@/lib/hooks/useBodyMetrics";

interface BodyMetricChartProps {
  metricType: BodyMetricType;
  logs: BodyMetricLog[];
}

function chartPoints(logs: BodyMetricLog[], metricType: BodyMetricType) {
  return logs
    .filter((l) => l.metric_type === metricType)
    .map((l) => {
      const date = new Date(l.recorded_at);
      return {
        key: l.id,
        label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        kg: l.value_kg,
        fullDate: date.toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };
    });
}

export function BodyMetricChart({ metricType, logs }: BodyMetricChartProps) {
  const meta = BODY_METRIC_META[metricType];
  const data = chartPoints(logs, metricType);

  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No {meta.shortLabel.toLowerCase()} entries yet — log your first value above.
      </p>
    );
  }

  return (
    <div className="h-52 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis
            tick={{ fontSize: 10 }}
            domain={["auto", "auto"]}
            unit=" kg"
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value ?? "—"} kg`, meta.label]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullDate ?? ""
            }
          />
          <Line
            type="monotone"
            dataKey="kg"
            stroke="hsl(24 95% 53%)"
            strokeWidth={2}
            dot={{ r: 3, fill: "hsl(24 95% 53%)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
