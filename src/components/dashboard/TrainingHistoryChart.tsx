"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INTENSITY_SHORT } from "@/lib/constants/intensityLabels";
import { formatDuration } from "@/lib/utils/dates";
import type { WorkoutLog } from "@/types/app";
import type { IntensityLevel } from "@/types/app";

interface TrainingHistoryChartProps {
  logs: WorkoutLog[];
  loading?: boolean;
}

function chartData(logs: WorkoutLog[]) {
  return [...logs]
    .reverse()
    .map((log, index) => {
      const date = new Date(log.created_at);
      const label = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
      return {
        key: log.id,
        label: logs.length > 8 ? `${label}` : `${label} #${index + 1}`,
        points: log.total_points,
        duration: log.duration_minutes,
        intensity: log.intensity_level,
        fullDate: date.toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };
    });
}

export function TrainingHistoryChart({ logs, loading }: TrainingHistoryChartProps) {
  const data = chartData(logs);

  return (
    <Card className="border-orange-500/20 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-black">
          <TrendingUp className="size-5 text-orange-400" />
          Your pump history
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Points per session (most recent on the right)
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading forearm data...
          </p>
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No sessions yet. Log one and watch this chart get aggressive.
          </p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0 0)",
                    border: "1px solid oklch(0.4 0.1 45)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value} pts`, "Pump"]}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as {
                      fullDate: string;
                      duration: number;
                      intensity: number;
                    };
                    if (!row) return "";
                    return `${row.fullDate} · ${formatDuration(row.duration)} · L${row.intensity} ${INTENSITY_SHORT[row.intensity as IntensityLevel]}`;
                  }}
                />
                <Bar
                  dataKey="points"
                  fill="oklch(0.7 0.18 45)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
