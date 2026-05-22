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
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeaderboardEntry } from "@/types/app";

interface PlatformWeeklyChartProps {
  entries: LeaderboardEntry[];
}

export function PlatformWeeklyChart({ entries }: PlatformWeeklyChartProps) {
  const data = entries
    .filter((e) => e.points_7d > 0 || e.sessions_7d > 0)
    .slice(0, 12)
    .map((e) => ({
      name:
        e.username.length > 10 ? `${e.username.slice(0, 9)}…` : e.username,
      points: e.points_7d,
      sessions: e.sessions_7d,
      fullName: e.username,
    }));

  return (
    <Card className="border-amber-500/20 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-black">
          <Users className="size-5 text-amber-400" />
          7-day points — all climbers
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Who&apos;s putting in work this week on PUMP.
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No weekly activity yet.
          </p>
        ) : (
          <div className="h-64 w-full lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, angle: -35, textAnchor: "end" }}
                  height={56}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0 0)",
                    border: "1px solid oklch(0.4 0.1 45)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value, _name, props) => {
                    const p = props.payload as { fullName: string; sessions: number };
                    return [
                      `${value} pts · ${p.sessions} sessions`,
                      p.fullName,
                    ];
                  }}
                />
                <Bar dataKey="points" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
