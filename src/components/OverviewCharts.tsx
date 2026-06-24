"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis,
  BarChart, Bar,
} from "recharts";
import type { Cost, Creator, VideoPerformance, Video, InstallRecord } from "@/types";

const TT = {
  contentStyle: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 11,
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  },
  labelStyle: { color: "var(--text-primary)", fontWeight: 700, marginBottom: 2 },
  itemStyle: { color: "var(--text-secondary)" },
  cursor: { fill: "transparent" },
};

const PALETTE = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#4f46e5", "#7c3aed", "#9333ea", "#a855f7", "#d8b4fe"];

interface Props {
  costs: Cost[];
  creators: Creator[];
  performances: VideoPerformance[];
  installs: InstallRecord[];
  videos: Video[];
}

function ChartCard({ title, sub, children, fullWidth }: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 flex flex-col gap-4 ${fullWidth ? "col-span-2" : ""}`}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="h-44 flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
      No data yet
    </div>
  );
}

export function OverviewCharts({ costs, creators, performances, installs, videos }: Props) {
  // ── Per-creator aggregates ──────────────────────────────────────────────────
  const creatorRows = creators
    .map((c) => {
      const cc = costs.filter((x) => x.creatorId === c.id);
      if (!cc.length) return null;
      const spend = cc.reduce((s, x) => s + x.netCost, 0);
      const totalInstalls = installs.filter((i) => i.creatorId === c.id).reduce((s, i) => s + i.installs, 0);
      const cpi = totalInstalls > 0 && spend > 0 ? spend / totalInstalls : 0;
      return { name: c.name.split(" ")[0] ?? c.id, fullName: c.name, spend, cpi, installs: totalInstalls };
    })
    .filter(Boolean) as { name: string; fullName: string; spend: number; cpi: number; installs: number }[];

  const avgCpi = creatorRows.filter((d) => d.cpi > 0).length
    ? creatorRows.filter((d) => d.cpi > 0).reduce((s, d) => s + d.cpi, 0) / creatorRows.filter((d) => d.cpi > 0).length
    : 0;

  // Top 10 by spend for efficiency chart
  const top10Efficiency = [...creatorRows]
    .filter((d) => d.cpi > 0)
    .sort((a, b) => a.cpi - b.cpi)
    .slice(0, 10)
    .map((d) => ({
      ...d,
      cpiRounded: Math.round(d.cpi),
      belowAvg: d.cpi <= avgCpi,
    }));

  // ── Installs-over-time trend (area chart) ───────────────────────────────────
  // Build a month-bucketed time series from installs
  const monthMap: Record<string, number> = {};
  installs.forEach((i) => {
    if (!i.date) return;
    const d = new Date(i.date);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = (monthMap[key] ?? 0) + i.installs;
  });
  const trendData = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, installs]) => ({
      month: month.slice(5), // "MM"
      installs,
    }));

  // ── Platform donut ──────────────────────────────────────────────────────────
  const platformMap: Record<string, { installs: number; spend: number }> = {};
  videos.forEach((v) => {
    const cost = costs.find((c) => c.videoId === v.id);
    const inst = installs.find((i) => i.videoId === v.id);
    if (!platformMap[v.platform]) platformMap[v.platform] = { installs: 0, spend: 0 };
    if (cost) platformMap[v.platform].spend += cost.netCost;
    if (inst) platformMap[v.platform].installs += inst.installs;
  });
  const platformData = Object.entries(platformMap)
    .map(([name, d]) => ({ name, installs: d.installs, spend: Math.round(d.spend / 1000) }))
    .filter((d) => d.installs > 0)
    .sort((a, b) => b.installs - a.installs);

  const totalInstalls = platformData.reduce((s, d) => s + d.installs, 0);

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* 1. Installs over time — area chart */}
      <ChartCard
        title="Installs Over Time"
        sub="Monthly install volume"
      >
        {trendData.length < 2 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trendData} margin={{ left: -16, right: 4, top: 4 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
              />
              <Tooltip
                {...TT}
                formatter={(v) => [`${Number(v).toLocaleString()} installs`, ""]}
                labelFormatter={(l) => `Month ${l}`}
              />
              <Area
                type="monotone"
                dataKey="installs"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* 2. Platform breakdown — donut */}
      <ChartCard
        title="Platform Breakdown"
        sub="Share of total installs"
      >
        {platformData.length === 0 ? <Empty /> : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={platformData}
                  dataKey="installs"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {platformData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TT.contentStyle}
                  itemStyle={TT.itemStyle}
                  formatter={(v) => [`${Number(v).toLocaleString()} installs`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {platformData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: "var(--text-primary)" }}>
                    {totalInstalls > 0 ? Math.round((d.installs / totalInstalls) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ChartCard>

      {/* 3. Top 10 creators by CPI efficiency — horizontal bar */}
      <ChartCard
        title="Creator Efficiency"
        sub={`CPI (₹) — lower is better · avg ₹${avgCpi.toFixed(0)}`}
        fullWidth
      >
        {top10Efficiency.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={top10Efficiency.length * 34 + 8}>
            <BarChart
              data={top10Efficiency}
              layout="vertical"
              barSize={14}
              margin={{ left: 0, right: 48, top: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={68}
                tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...TT}
                formatter={(v) => [`₹${Number(v).toLocaleString()} / install`, "CPI"]}
              />
              <Bar dataKey="cpiRounded" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, fill: "var(--text-muted)", formatter: (v: unknown) => `₹${v}` }}>
                {top10Efficiency.map((d, i) => (
                  <Cell key={i} fill={d.belowAvg ? "#10b981" : "#6366f1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

    </div>
  );
}
