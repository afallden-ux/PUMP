"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ARENA_CATEGORY_META } from "@/lib/arena/categories";
import type { ArenaCategory, CategorySlice } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

interface LatticeDonutChartProps {
  breakdown: CategorySlice[];
  dominantCategory: ArenaCategory;
  dominantPct: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: { height: 88, inner: 28, outer: 40, font: "text-lg" },
  md: { height: 160, inner: 52, outer: 72, font: "text-2xl" },
  lg: { height: 200, inner: 64, outer: 88, font: "text-3xl" },
};

export function LatticeDonutChart({
  breakdown,
  dominantCategory,
  dominantPct,
  size = "md",
  className,
}: LatticeDonutChartProps) {
  const dims = SIZE[size];
  const data =
    breakdown.length > 0
      ? breakdown.map((b) => ({
          name: b.label,
          value: b.count,
          fill: b.color,
        }))
      : [
          {
            name: "None",
            value: 1,
            fill: "#3f3f46",
          },
        ];

  const centerLabel = ARENA_CATEGORY_META[dominantCategory].shortLabel;

  return (
    <div className={cn("relative w-full", className)} style={{ height: dims.height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={dims.inner}
            outerRadius={dims.outer}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold tabular-nums text-slate-800", dims.font)}>
          {dominantPct}%
        </span>
        <span className="text-[10px] font-medium text-slate-500">{centerLabel}</span>
      </div>
    </div>
  );
}
