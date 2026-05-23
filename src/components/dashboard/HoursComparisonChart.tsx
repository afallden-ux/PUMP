"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useComparisonHours } from "@/lib/hooks/useComparisonHours";
import {
  buildHoursComparisonSeries,
  COMPARISON_COLORS,
  type HoursRange,
} from "@/lib/utils/aggregateHours";
import type { Profile } from "@/types/app";
import { cn } from "@/lib/utils";

interface HoursComparisonChartProps {
  currentUser: Profile;
  climbers: Profile[];
  refreshKey?: number;
}

const RANGES: { id: HoursRange; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export function HoursComparisonChart({
  currentUser,
  climbers,
  refreshKey = 0,
}: HoursComparisonChartProps) {
  const [range, setRange] = useState<HoursRange>("week");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set([currentUser.id])
  );

  const others = climbers.filter((p) => p.id !== currentUser.id);
  const userIds = [...selected];

  const { logsByUser, loading } = useComparisonHours(userIds, range, refreshKey);

  const usernames = useMemo(() => {
    const map: Record<string, string> = { [currentUser.id]: currentUser.username };
    for (const p of climbers) map[p.id] = p.username;
    return map;
  }, [currentUser, climbers]);

  const { data } = useMemo(
    () => buildHoursComparisonSeries(logsByUser, usernames, range),
    [logsByUser, usernames, range]
  );

  function toggleUser(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev;
        next.delete(id);
      } else if (next.size < 6) {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <Card className="border-orange-500/20 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-black">
          <BarChart3 className="size-5 text-orange-400" />
          Training hours vs climbers
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Compare anyone on PUMP — tap names to add/remove lines (max 6).
        </p>
        <div className="flex gap-1 pt-2">
          {RANGES.map((r) => (
            <Button
              key={r.id}
              type="button"
              size="xs"
              variant={range === r.id ? "default" : "outline"}
              className={range === r.id ? "bg-orange-600" : ""}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          <button
            type="button"
            onClick={() => toggleUser(currentUser.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
              selected.has(currentUser.id)
                ? "border-orange-500 bg-orange-500/20 text-orange-300"
                : "border-border text-muted-foreground"
            )}
          >
            You
          </button>
          {others.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleUser(p.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                selected.has(p.id)
                  ? "border-orange-500 bg-orange-500/20 text-orange-300"
                  : "border-border text-muted-foreground"
              )}
            >
              {p.username}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Crunching hours...
          </p>
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No hours in this range. Log sessions or widen the time window.
          </p>
        ) : (
          <div className="h-64 min-h-64 w-full min-w-0 lg:h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
              <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "Hours",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10 },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0 0)",
                    border: "1px solid oklch(0.4 0.1 45)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                {userIds.map((id, i) => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    name={usernames[id] ?? "Climber"}
                    stroke={COMPARISON_COLORS[i % COMPARISON_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
