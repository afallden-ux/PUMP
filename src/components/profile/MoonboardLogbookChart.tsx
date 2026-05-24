"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { gradeSortIndex, type MoonboardLogbookRow } from "@/lib/moonboard/logbook";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  { key: "flashed", label: "Flashed", fill: "#f97316" },
  { key: "secondTry", label: "2nd try", fill: "#22c55e" },
  { key: "thirdTry", label: "3rd try", fill: "#eab308" },
  { key: "moreTries", label: "4+ tries", fill: "#ef4444" },
] as const;

interface MoonboardLogbookChartProps {
  rows: MoonboardLogbookRow[];
  className?: string;
  height?: number;
}

export function MoonboardLogbookChart({
  rows,
  className,
  height = 220,
}: MoonboardLogbookChartProps) {
  const data = [...rows]
    .filter((r) => (r.total > 0 ? r.total : r.flashed + r.secondTry + r.thirdTry + r.moreTries) > 0)
    .sort((a, b) => gradeSortIndex(a.grade) - gradeSortIndex(b.grade));

  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No logbook data yet — import from your MoonBoard app screenshot.
      </p>
    );
  }

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="grade"
              tick={{ fontSize: 9, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={48}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10 }}
              formatter={(value) =>
                SEGMENTS.find((s) => s.key === value)?.label ?? value
              }
            />
            {SEGMENTS.map((seg) => (
              <Bar
                key={seg.key}
                dataKey={seg.key}
                stackId="grade"
                fill={seg.fill}
                name={seg.key}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
