"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CHART_CATEGORIES,
  CHART_CATEGORY_META,
  getWorkoutChartCategory,
} from "@/lib/utils/workoutChartCategory";
import type { WorkoutLog } from "@/types/app";

interface SessionTypeBreakdownChartProps {
  logs: WorkoutLog[];
  loading?: boolean;
}

function breakdown(logs: WorkoutLog[]) {
  const counts: Record<string, number> = {};
  for (const cat of CHART_CATEGORIES) counts[cat] = 0;
  for (const log of logs) {
    const cat = getWorkoutChartCategory(log);
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return CHART_CATEGORIES.map((cat) => ({
    category: cat,
    label: CHART_CATEGORY_META[cat].label,
    count: counts[cat] ?? 0,
    fill: CHART_CATEGORY_META[cat].chartColor,
  })).filter((d) => d.count > 0);
}

export function SessionTypeBreakdownChart({
  logs,
  loading,
}: SessionTypeBreakdownChartProps) {
  const data = breakdown(logs);

  return (
    <Card className="h-full border-orange-500/20 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-black">
          <PieChart className="size-5 text-orange-400" />
          Session mix
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Count by type — climbing split into gym, board, and outdoors.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>
        ) : data.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Log workouts to see your mix.
          </p>
        ) : (
          <div className="h-56 min-h-56 w-full min-w-0 lg:h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={224}>
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  width={88}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0 0)",
                    border: "1px solid oklch(0.4 0.1 45)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.map((entry) => (
                    <Cell key={entry.category} fill={entry.fill} />
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
