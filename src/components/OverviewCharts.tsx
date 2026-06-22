"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from "recharts";
import type { Cost, Creator, VideoPerformance, Video, InstallRecord } from "@/types";

const TOOLTIP_STYLE = {
  contentStyle: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "var(--text-primary)", fontWeight: 600 },
  itemStyle: { color: "var(--text-secondary)" },
};

interface Props {
  costs: Cost[];
  creators: Creator[];
  performances: VideoPerformance[];
  installs: InstallRecord[];
  videos: Video[];
}

export function OverviewCharts({ costs, creators, performances, installs, videos }: Props) {
  // Spend + CPI per creator
  const creatorData = creators
    .map((c) => {
      const creatorCosts = costs.filter((x) => x.creatorId === c.id);
      if (!creatorCosts.length) return null;
      const spend = creatorCosts.reduce((s, x) => s + x.netCost, 0);
      const creatorInstalls = installs.filter((i) => i.creatorId === c.id).reduce((s, i) => s + i.installs, 0);
      const cpi = creatorInstalls > 0 && spend > 0 ? spend / creatorInstalls : 0;
      return {
        name: c.name.split(" ")[0] ?? c.id,
        spend: Math.round(spend / 1000),
        cpi: Math.round(cpi),
        installs: creatorInstalls,
      };
    })
    .filter(Boolean) as { name: string; spend: number; cpi: number; installs: number }[];

  const avgCpi = creatorData.filter((d) => d.cpi > 0).length
    ? creatorData.filter((d) => d.cpi > 0).reduce((s, d) => s + d.cpi, 0) / creatorData.filter((d) => d.cpi > 0).length
    : 0;

  // Platform breakdown
  const platformMap: Record<string, { views: number; spend: number; installs: number }> = {};
  videos.forEach((v) => {
    const perf = performances.find((p) => p.videoId === v.id);
    const cost = costs.find((c) => c.videoId === v.id);
    const installRec = installs.find((i) => i.videoId === v.id);
    if (!platformMap[v.platform]) platformMap[v.platform] = { views: 0, spend: 0, installs: 0 };
    if (perf) platformMap[v.platform].views += perf.views;
    if (cost) platformMap[v.platform].spend += cost.netCost;
    if (installRec) platformMap[v.platform].installs += installRec.installs;
  });
  const platformData = Object.entries(platformMap).map(([name, d]) => ({
    name,
    views: Math.round(d.views / 1000),
    cpi: d.installs > 0 && d.spend > 0 ? Math.round(d.spend / d.installs) : 0,
    installs: d.installs,
  }));

  const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8"];

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Spend per creator */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>Net Spend per Creator</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>In ₹ thousands</p>
        {creatorData.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>No spend data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={creatorData} barSize={28} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}K`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v)}K`, "Net Spend"]} />
              <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                {creatorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* CPI by creator */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>CPI by Creator</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Cost per install (₹) · avg ₹{avgCpi.toFixed(0)} — <span className="text-emerald-500">green = below avg</span>
        </p>
        {creatorData.filter((d) => d.cpi > 0).length === 0 ? (
          <div className="h-44 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>No install data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={creatorData.filter((d) => d.cpi > 0)} barSize={28} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v).toFixed(0)}`, "CPI"]} />
              <Bar dataKey="cpi" radius={[4, 4, 0, 0]}>
                {creatorData.filter((d) => d.cpi > 0).map((d, i) => (
                  <Cell key={i} fill={d.cpi <= avgCpi ? "#10b981" : "#f59e0b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Platform comparison: installs + CPI */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>Platform Comparison</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Installs vs CPI (₹) by platform</p>
        {platformData.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>No platform data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={platformData} barSize={28} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [name === "installs" ? `${Number(v)} installs` : `₹${Number(v).toFixed(0)} CPI`, ""]} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }} />
              <Bar yAxisId="left" dataKey="installs" fill="#6366f1" radius={[4, 4, 0, 0]} name="Installs" />
              <Bar yAxisId="right" dataKey="cpi" fill="#f59e0b" radius={[4, 4, 0, 0]} name="CPI (₹)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Click→Install funnel per creator */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>Install Funnel</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Views (K) → Clicks → Installs per creator</p>
        {performances.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>No performance data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={performances.map((p) => {
                const v = videos.find((x) => x.id === p.videoId);
                const installRec = installs.find((i) => i.videoId === p.videoId);
                const creator = v?.creatorName?.split(" ")[0] ?? p.videoId;
                return {
                  name: creator,
                  views: Math.round(p.views / 1000),
                  clicks: p.clickThroughs,
                  installs: installRec?.installs ?? 0,
                };
              })}
              barSize={18}
              margin={{ left: -10 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }} />
              <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} name="Views (K)" />
              <Bar dataKey="clicks" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Dub Clicks" />
              <Bar dataKey="installs" fill="#10b981" radius={[4, 4, 0, 0]} name="Installs" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
