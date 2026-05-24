"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CompareSnapshot } from "@/lib/compare/types";
import { radarScores } from "@/lib/compare/metricDefs";

interface CompareRadarDuelProps {
  left: CompareSnapshot;
  right: CompareSnapshot;
}

export function CompareRadarDuel({ left, right }: CompareRadarDuelProps) {
  const leftScores = radarScores(left);
  const rightScores = radarScores(right);
  const axes = Object.keys(leftScores);

  const data = axes.map((axis) => ({
    axis,
    [left.profile.username]: leftScores[axis],
    [right.profile.username]: rightScores[axis],
  }));

  const hasData =
    Object.values(leftScores).some((v) => v > 0) ||
    Object.values(rightScores).some((v) => v > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        Log assessments to see strength profile
      </div>
    );
  }

  return (
    <div className="h-72 w-full min-w-0">
      <p className="mb-2 text-center text-xs text-slate-500">
        Normalized profile (0–100 per axis)
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Radar
            name={left.profile.username}
            dataKey={left.profile.username}
            stroke="#0d9488"
            fill="#14b8a6"
            fillOpacity={0.35}
          />
          <Radar
            name={right.profile.username}
            dataKey={right.profile.username}
            stroke="#64748b"
            fill="#94a3b8"
            fillOpacity={0.25}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
