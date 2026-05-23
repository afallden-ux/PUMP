"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INTENSITY_SHORT } from "@/lib/constants/intensityLabels";
import { formatDuration } from "@/lib/utils/dates";
import {
  CHART_CATEGORIES,
  CHART_CATEGORY_META,
  chartCategoryLabel,
  getWorkoutChartCategory,
} from "@/lib/utils/workoutChartCategory";
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
      const category = getWorkoutChartCategory(log);
      const meta = CHART_CATEGORY_META[category];
      return {
        key: log.id,
        label: logs.length > 8 ? `${label}` : `${label} #${index + 1}`,
        points: log.total_points,
        duration: log.duration_minutes,
        intensity: log.intensity_level,
        category,
        typeLabel: chartCategoryLabel(log),
        fill: meta.chartColor,
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
          Bar colour = session type. Climbing splits into gym wall, board, and outdoors.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {CHART_CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
              style={{
                borderColor: `${CHART_CATEGORY_META[cat].chartColor}66`,
                color: CHART_CATEGORY_META[cat].chartColor,
              }}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: CHART_CATEGORY_META[cat].chartColor }}
              />
              {CHART_CATEGORY_META[cat].emoji} {CHART_CATEGORY_META[cat].label}
            </span>
          ))}
        </div>
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
          <div className="h-56 w-full lg:h-64">
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
                  formatter={(value, _name, item) => {
                    const row = item.payload as { typeLabel: string };
                    return [`${value} pts`, row.typeLabel];
                  }}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as {
                      fullDate: string;
                      duration: number;
                      intensity: number;
                      typeLabel: string;
                    };
                    if (!row) return "";
                    return `${row.fullDate} · ${row.typeLabel} · ${formatDuration(row.duration)} · L${row.intensity} ${INTENSITY_SHORT[row.intensity as IntensityLevel]}`;
                  }}
                />
                <Legend content={() => null} />
                <Bar dataKey="points" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
