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
import { ARENA_CATEGORY_META, ARENA_CATEGORY_ORDER } from "@/lib/arena/categories";
import type { WeeklyStackRow } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

interface LatticeStackedBarChartProps {
  data: WeeklyStackRow[];
  height?: number;
  highlightLast?: boolean;
  className?: string;
}

export function LatticeStackedBarChart({
  data,
  height = 140,
  highlightLast = true,
  className,
}: LatticeStackedBarChartProps) {
  const lastKey = data[data.length - 1]?.weekKey;

  return (
    <div className={cn("w-full min-w-0", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="#e2e8f0"
          />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 11,
              boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
            }}
            labelFormatter={(label) => `Week of ${label}`}
          />
          {ARENA_CATEGORY_ORDER.map((cat) => (
            <Bar
              key={cat}
              dataKey={cat}
              stackId="week"
              fill={ARENA_CATEGORY_META[cat].color}
              radius={cat === "endurance" ? [2, 2, 0, 0] : [0, 0, 0, 0]}
              className={
                highlightLast ? "[&_:last-child]:opacity-100" : undefined
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {highlightLast && lastKey && (
        <p className="sr-only">Latest week highlighted in chart</p>
      )}
    </div>
  );
}
