"use client";

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

const palette = ["#22d3ee", "#8b5cf6", "#f472b6", "#60a5fa", "#34d399", "#fb7185"];

export function GroupComparisonChart({
  rows,
}: {
  rows: Array<Record<string, string | number>>;
}) {
  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row)
        .filter((key) => key !== "day")
        .forEach((key) => set.add(key));
      return set;
    }, new Set<string>()),
  );

  return (
    <div className="glass-panel h-96 rounded-3xl border border-white/10 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            }}
          />
          <Legend />
          {keys.map((key, index) => (
            <Line
              key={key}
              dataKey={key}
              stroke={palette[index % palette.length]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
