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
import { SESSION_TYPE_META, SESSION_TYPES } from "@/lib/constants/sessionTypes";
import type { WorkoutLog } from "@/types/app";
import type { SessionType } from "@/lib/constants/sessionTypes";

interface SessionTypeBreakdownChartProps {
  logs: WorkoutLog[];
  loading?: boolean;
}

function breakdown(logs: WorkoutLog[]) {
  const counts: Record<string, number> = {};
  for (const t of SESSION_TYPES) counts[t] = 0;
  for (const log of logs) {
    const t = (log.session_type ?? "climbing") as SessionType;
    if (counts[t] !== undefined) counts[t]++;
    else counts[t] = 1;
  }
  return SESSION_TYPES.map((type) => ({
    type,
    label: SESSION_TYPE_META[type].label,
    count: counts[type] ?? 0,
    fill: SESSION_TYPE_META[type].chartColor,
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
          Your logged session types (all time in history list).
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
          <div className="h-56 w-full lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  width={72}
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
                    <Cell key={entry.type} fill={entry.fill} />
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
