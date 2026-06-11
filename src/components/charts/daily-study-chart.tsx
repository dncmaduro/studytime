"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = {
  day: string;
  total_seconds: number;
};

export function DailyStudyChart({ rows }: { rows: Row[] }) {
  const data = rows.map((row) => ({
    day: row.day.slice(5),
    hours: Number((row.total_seconds / 3600).toFixed(2)),
  }));

  return (
    <div className="glass-panel h-80 rounded-3xl border border-white/10 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
          <Bar dataKey="hours" fill="url(#dailyBar)" radius={[10, 10, 0, 0]} />
          <defs>
            <linearGradient id="dailyBar" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
