"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Row {
  videoId: string;
  views: number;
  engagementRate: number;
  clickToInstallRate: number;
  roas: number;
  creatorName: string;
}

const TOOLTIP_STYLE = {
  contentStyle: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "var(--text-primary)", fontWeight: 600 },
  itemStyle: { color: "var(--text-secondary)" },
};

export function PerformanceCharts({ rows }: { rows: Row[] }) {
  if (!rows.length) return null;

  const avgEng = rows.reduce((s, r) => s + r.engagementRate, 0) / rows.length;
  const avgC2I = rows.filter((r) => r.clickToInstallRate > 0).length
    ? rows.filter((r) => r.clickToInstallRate > 0).reduce((s, r) => s + r.clickToInstallRate, 0) / rows.filter((r) => r.clickToInstallRate > 0).length
    : 0;

  const data = rows.map((r) => ({
    name: r.creatorName?.split(" ")[0] ?? r.videoId,
    views: Math.round(r.views / 1000),
    eng: +r.engagementRate.toFixed(2),
    c2i: +r.clickToInstallRate.toFixed(2),
    roas: +r.roas.toFixed(2),
  }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Views per Video</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Thousands</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={28} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}K`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${Number(v)}K`, "Views"]} />
            <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Engagement Rate</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Green = above avg ({avgEng.toFixed(1)}%)
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={28} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toFixed(2)}%`, "Engagement"]} />
            <Bar dataKey="eng" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.eng >= avgEng ? "#10b981" : "#f59e0b"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Click → Install Rate</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Dub clicks → installs · avg {avgC2I.toFixed(1)}%
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.filter((d) => d.c2i > 0)} barSize={28} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toFixed(1)}%`, "Click→Install"]} />
            <Bar dataKey="c2i" radius={[4, 4, 0, 0]}>
              {data.filter((d) => d.c2i > 0).map((d, i) => <Cell key={i} fill={d.c2i >= avgC2I ? "#10b981" : "#f59e0b"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>ROAS by Video</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Revenue / net spend · Green = 2x+
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.filter((d) => d.roas > 0)} barSize={28} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}x`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toFixed(2)}x`, "ROAS"]} />
            <Bar dataKey="roas" radius={[4, 4, 0, 0]}>
              {data.filter((d) => d.roas > 0).map((d, i) => <Cell key={i} fill={d.roas >= 2 ? "#10b981" : d.roas >= 1 ? "#f59e0b" : "#ef4444"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
