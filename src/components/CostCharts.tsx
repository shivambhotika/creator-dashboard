"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface Row {
  videoId: string;
  creatorName: string;
  grossCost: number;
  agencyFee: number;
  netCost: number;
  cpi: number;
  cpv: number;
  roas: number;
}

const TOOLTIP_STYLE = {
  contentStyle: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "var(--text-primary)", fontWeight: 600 },
  itemStyle: { color: "var(--text-secondary)" },
};

export function CostCharts({ rows }: { rows: Row[] }) {
  if (!rows.length) return null;

  const validCpi = rows.filter((r) => r.cpi > 0);
  const avgCpi = validCpi.length ? validCpi.reduce((s, r) => s + r.cpi, 0) / validCpi.length : 0;
  const validCpv = rows.filter((r) => r.cpv > 0);
  const avgCpv = validCpv.length ? validCpv.reduce((s, r) => s + r.cpv, 0) / validCpv.length : 0;

  const data = rows.map((r) => ({
    name: r.creatorName?.split(" ")[0] ?? r.videoId,
    net: Math.round(r.netCost / 1000),
    fee: Math.round(r.agencyFee / 1000),
    cpi: Math.round(r.cpi),
    cpv: +r.cpv.toFixed(2),
    roas: +r.roas.toFixed(2),
  }));

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Stacked: net + agency fee */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Spend Breakdown</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Net cost + agency fee (₹K)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={28} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}K`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [`₹${Number(v)}K`, name === "net" ? "Net Cost" : "Agency Fee"]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }} formatter={(v) => v === "net" ? "Net Cost" : "Agency Fee"} />
            <Bar dataKey="net" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} name="net" />
            <Bar dataKey="fee" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="fee" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CPI by creator */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>CPI by Creator</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Cost per install · avg ₹{avgCpi.toFixed(0)} · <span className="text-emerald-500">green = below avg</span>
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.filter((d) => d.cpi > 0)} barSize={28} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v).toFixed(0)}`, "CPI"]} />
            <Bar dataKey="cpi" radius={[4, 4, 0, 0]}>
              {data.filter((d) => d.cpi > 0).map((d, i) => (
                <Cell key={i} fill={d.cpi <= avgCpi ? "#10b981" : "#f59e0b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CPV by creator */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>CPV by Creator</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Cost per view (₹) · avg ₹{avgCpv.toFixed(2)} · <span className="text-emerald-500">green = below avg</span>
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.filter((d) => d.cpv > 0)} barSize={28} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v).toFixed(2)}`, "CPV"]} />
            <Bar dataKey="cpv" radius={[4, 4, 0, 0]}>
              {data.filter((d) => d.cpv > 0).map((d, i) => (
                <Cell key={i} fill={d.cpv <= avgCpv ? "#10b981" : "#f59e0b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ROAS */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>ROAS by Video</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Revenue / net spend · 2x+ = green</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.filter((d) => d.roas > 0)} barSize={28} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}x`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toFixed(2)}x`, "ROAS"]} />
            <Bar dataKey="roas" radius={[4, 4, 0, 0]}>
              {data.filter((d) => d.roas > 0).map((d, i) => (
                <Cell key={i} fill={d.roas >= 2 ? "#10b981" : d.roas >= 1 ? "#f59e0b" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
