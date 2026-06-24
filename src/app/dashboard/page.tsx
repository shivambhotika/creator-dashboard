import React from "react";
import { videos, performances, costs, installs, creators } from "@/lib/mock-data";
import { getDubStats } from "@/lib/dub-server";

const USD_INR = 84;

// Format large numbers as 1.2M / 45.3K etc.
function fmt(n: number, decimals = 1): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(decimals)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(decimals)}K`;
  return n.toFixed(0);
}

function usd(inr: number, digits = 2): string {
  return `$${(inr / USD_INR).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

// ── Sub-components ─────────────────────────────────────────────

function FunnelCard({
  label, value, tag, tagColor = "#6366f1",
  sub, subLabel, border = false,
}: {
  label: string; value: string; tag?: string; tagColor?: string;
  sub?: string; subLabel?: string; border?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-1.5"
      style={{
        background: "var(--bg-card)",
        border: border ? `2px solid ${tagColor}30` : "1px solid var(--border)",
      }}
    >
      <p className="label-caps">{label}</p>
      <p className="stat-number">{value}</p>
      {tag && (
        <p className="text-xs font-semibold" style={{ color: tagColor }}>
          {tag}
        </p>
      )}
      {sub && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {subLabel && <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{subLabel} · </span>}
          {sub}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      {sub && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default async function DashboardPage() {
  const dub = await getDubStats();

  // ── Aggregate totals ──────────────────────────────────────────
  const totalImpressions = performances.reduce((s, p) => s + p.views, 0);
  const totalClicks      = dub.totalClicks > 0
    ? dub.totalClicks
    : performances.reduce((s, p) => s + p.clickThroughs, 0);
  const totalInstalls    = installs.reduce((s, i) => s + i.installs, 0);
  const totalSpendINR    = costs.reduce((s, c) => s + c.netCost, 0);
  const totalSpendUSD    = totalSpendINR / USD_INR;
  const totalRevenue     = installs.reduce((s, i) => s + (i.revenue ?? 0), 0);
  const totalCreators    = creators.length;
  const liveVideos       = videos.filter((v) => v.status === "Live").length;

  const cpm   = totalImpressions > 0 ? (totalSpendUSD / totalImpressions) * 1000 : 0;
  const ctr   = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpc   = totalClicks > 0 ? totalSpendUSD / totalClicks : 0;
  const cpi   = totalInstalls > 0 ? totalSpendUSD / totalInstalls : 0;
  const c2i   = totalClicks > 0 ? (totalInstalls / totalClicks) * 100 : 0;

  // ── Platform breakdown ────────────────────────────────────────
  const PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "Twitter"] as const;

  const platformStats = PLATFORMS.map((platform) => {
    const pvids  = videos.filter((v) => v.platform === platform).map((v) => v.id);
    const perfs  = performances.filter((p) => pvids.includes(p.videoId));
    const pcosts = costs.filter((c) => pvids.includes(c.videoId));
    const pinst  = installs.filter((i) => pvids.includes(i.videoId));

    const imp  = perfs.reduce((s, p) => s + p.views, 0);
    const clk  = perfs.reduce((s, p) => s + p.clickThroughs, 0);
    const inst = pinst.reduce((s, i) => s + i.installs, 0);
    const spd  = pcosts.reduce((s, c) => s + c.netCost, 0) / USD_INR;

    return {
      platform,
      imp,
      clk,
      inst,
      spd,
      cpm:  imp  > 0 ? (spd / imp) * 1000 : 0,
      ctr:  imp  > 0 ? (clk / imp) * 100  : 0,
      cpc:  clk  > 0 ? spd / clk           : 0,
      c2i:  clk  > 0 ? (inst / clk) * 100  : 0,
      cpi:  inst > 0 ? spd / inst           : 0,
    };
  });

  // ── Monthly breakdown ─────────────────────────────────────────
  // Build map: "2026-03" → { imp, clk, inst, spd }
  type MonthBucket = { imp: number; clk: number; inst: number; spdINR: number };
  const monthMap = new Map<string, MonthBucket>();

  for (const video of videos) {
    const ym = video.goLiveDate?.slice(0, 7);
    if (!ym) continue;
    if (!monthMap.has(ym)) monthMap.set(ym, { imp: 0, clk: 0, inst: 0, spdINR: 0 });
    const bucket = monthMap.get(ym)!;
    const perf = performances.find((p) => p.videoId === video.id);
    const cost = costs.find((c) => c.videoId === video.id);
    const inst = installs.find((i) => i.videoId === video.id);
    bucket.imp   += perf?.views          ?? 0;
    bucket.clk   += perf?.clickThroughs  ?? 0;
    bucket.inst  += inst?.installs        ?? 0;
    bucket.spdINR+= cost?.netCost         ?? 0;
  }

  const months = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, b]) => ({
      ym,
      label: new Date(ym + "-15").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      ...b,
      spdUSD: b.spdINR / USD_INR,
    }));

  const maxImp = Math.max(...months.map((m) => m.imp), 1);

  const PLATFORM_COLOR: Record<string, string> = {
    YouTube:   "#ff0000",
    Instagram: "#e1306c",
    LinkedIn:  "#0a66c2",
    Twitter:   "#1da1f2",
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Overview</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {liveVideos} videos live across {totalCreators} creators · Dub attribution
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!dub.partial && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", color: "#6366f1" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Dub live
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            All costs in USD · ₹84/$ rate
          </div>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <FunnelCard
          label="Total Impressions"
          value={fmt(totalImpressions)}
          sub="Views across all platforms"
        />
        <FunnelCard
          label="CPM"
          value={usd(cpm, 2)}
          sub="Cost per 1,000 impressions"
          tagColor="#6366f1"
        />
        <FunnelCard
          label="Clicks"
          value={fmt(totalClicks)}
          sub="Link clicks via Dub tracking"
        />
        <FunnelCard
          label="CPC"
          value={usd(cpc, 2)}
          sub="Cost per click"
          tagColor="#0ea5e9"
        />
        <FunnelCard
          label="CTR"
          value={pct(ctr, 2)}
          sub="Click-through rate"
          tagColor="#8b5cf6"
        />
        <FunnelCard
          label="Cost per Install"
          value={usd(cpi, 2)}
          sub={`${fmt(totalInstalls, 0)} installs · C→I ${pct(c2i, 1)}`}
          tagColor="#10b981"
        />
      </div>

      {/* ── Platform breakdown ─────────────────────────────────── */}
      <SectionHeader
        title="Platform Breakdown"
        sub="Same funnel split by channel — all costs in USD"
      />
      <div className="rounded-xl overflow-hidden mb-10" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
              {["Platform", "Impressions", "CPM", "Clicks", "CTR", "CPC", "Installs", "C→I", "CPI", "Spend"].map((h) => (
                <th key={h} className="text-left px-4 py-3 label-caps whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {platformStats.map((ps, i) => (
              <tr key={ps.platform} style={{ borderBottom: i < platformStats.length - 1 ? "1px solid var(--border)" : "none" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PLATFORM_COLOR[ps.platform] }} />
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{ps.platform}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                  {ps.imp > 0 ? fmt(ps.imp) : "—"}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                  {ps.cpm > 0 ? usd(ps.cpm, 2) : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                  {ps.clk > 0 ? fmt(ps.clk) : "—"}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                  {ps.ctr > 0 ? pct(ps.ctr, 2) : "—"}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                  {ps.cpc > 0 ? usd(ps.cpc, 2) : "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-indigo-500">
                  {ps.inst > 0 ? fmt(ps.inst, 0) : "—"}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: ps.c2i > 2 ? "#10b981" : "var(--text-muted)" }}>
                  {ps.c2i > 0 ? pct(ps.c2i, 1) : "—"}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: ps.cpi > 0 && ps.cpi < 5 ? "#10b981" : ps.cpi > 10 ? "#f59e0b" : "var(--text-secondary)" }}>
                  {ps.cpi > 0 ? usd(ps.cpi, 2) : "—"}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {ps.spd > 0 ? usd(ps.spd * USD_INR) : "—"}
                </td>
              </tr>
            ))}
            {/* Totals row */}
            <tr style={{ background: "var(--bg-surface)", borderTop: "2px solid var(--border)" }}>
              <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Total</td>
              <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--text-primary)" }}>{fmt(totalImpressions)}</td>
              <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{usd(cpm, 2)}</td>
              <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--text-primary)" }}>{fmt(totalClicks)}</td>
              <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{pct(ctr, 2)}</td>
              <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{usd(cpc, 2)}</td>
              <td className="px-4 py-3 font-bold text-indigo-500">{fmt(totalInstalls, 0)}</td>
              <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{pct(c2i, 1)}</td>
              <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{usd(cpi, 2)}</td>
              <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--text-primary)" }}>{usd(totalSpendINR)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Monthly breakdown ──────────────────────────────────── */}
      <SectionHeader
        title="Month-on-Month"
        sub="All metrics by month with delta vs. prior month — costs in USD"
      />
      <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
              {["Month", "Impressions", "Δ Imp", "CPM", "Clicks", "Δ Clicks", "CTR", "CPC", "Installs", "Δ Inst", "CPI", "Spend"].map((h) => (
                <th key={h} className="text-left px-4 py-3 label-caps whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((m, i) => {
              const prev = i > 0 ? months[i - 1] : null;
              const mCtr = m.imp > 0 ? (m.clk / m.imp) * 100 : 0;
              const mCpi = m.inst > 0 ? m.spdUSD / m.inst : 0;
              const mCpm = m.imp > 0 ? (m.spdUSD / m.imp) * 1000 : 0;
              const mCpc = m.clk > 0 ? m.spdUSD / m.clk : 0;
              const barWidth = maxImp > 0 ? (m.imp / maxImp) * 100 : 0;

              function delta(curr: number, prior: number | undefined): React.ReactElement {
                if (!prior || prior === 0 || curr === 0) return <span style={{ color: "var(--text-muted)" }}>—</span>;
                const d = ((curr - prior) / prior) * 100;
                const up = d >= 0;
                return (
                  <span className="text-xs font-semibold" style={{ color: up ? "#10b981" : "#f59e0b" }}>
                    {up ? "▲" : "▼"} {Math.abs(d).toFixed(0)}%
                  </span>
                );
              }

              return (
                <tr key={m.ym} style={{ borderBottom: i < months.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td className="px-4 py-3 font-semibold text-sm whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${barWidth}%` }} />
                      </div>
                      {m.label}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                    {m.imp > 0 ? fmt(m.imp) : "—"}
                  </td>
                  <td className="px-4 py-3">{delta(m.imp, prev?.imp)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                    {mCpm > 0 ? usd(mCpm * USD_INR, 2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {m.clk > 0 ? fmt(m.clk) : "—"}
                  </td>
                  <td className="px-4 py-3">{delta(m.clk, prev?.clk)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                    {mCtr > 0 ? pct(mCtr, 2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                    {mCpc > 0 ? usd(mCpc * USD_INR, 2) : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-indigo-400">
                    {m.inst > 0 ? fmt(m.inst, 0) : "—"}
                  </td>
                  <td className="px-4 py-3">{delta(m.inst, prev?.inst)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: mCpi > 0 && mCpi < 5 ? "#10b981" : mCpi > 10 ? "#f59e0b" : "var(--text-muted)" }}>
                    {mCpi > 0 ? usd(mCpi * USD_INR, 2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {m.spdUSD > 0 ? `$${m.spdUSD.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
