"use client";

import { useState } from "react";
import Link from "next/link";
import { useCurrency } from "@/lib/currency-context";
import { TopCreatorsWidget, type TopCreatorEntry } from "@/components/TopCreatorsWidget";
import { Sparkline } from "@/components/Sparkline";
import { MetricHint } from "@/components/MetricHint";

const USD_INR = 84;

const PLATFORM_COLOR: Record<string, string> = {
  YouTube:   "#ff0000",
  Instagram: "#e1306c",
  LinkedIn:  "#0a66c2",
  Twitter:   "#1da1f2",
};

export interface PlatformStat {
  platform: string;
  imp: number;
  clk: number;
  inst: number;
  spendINR: number;
}

export interface MonthRow {
  ym: string;
  label: string;
  imp: number;
  clk: number;
  inst: number;
  spendINR: number;
}

export interface MonthCPI {
  ym: string;
  label: string;
  spendINR: number;
  installs: number;
  /** CPI in INR — divide by 84 for USD */
  cpiINR: number | null;
}

export interface OverviewData {
  totalImp: number;
  totalClk: number;
  totalInst: number;
  totalSpendINR: number;
  totalCreators: number;
  liveVideos: number;
  cpmUSD: number;
  cpcUSD: number;
  cpiUSD: number;
  ctrPct: number;
  c2iPct: number;
  dubPartial: boolean;
  platformStats: PlatformStat[];
  months: MonthRow[];
  platformMonths: Record<string, MonthRow[]>;
  topCreators: TopCreatorEntry[];
  monthCPIs: MonthCPI[];
  ytLastSync: string | null;
  dubLastSync: string | null;
  highPriorityActionCount: number;
  operatorInsights: Array<{
    id: string;
    title: string;
    body: string;
    metric: string;
    tone: "good" | "warn" | "bad" | "neutral";
    href: string;
    source: string;
  }>;
  coverage: Array<{
    id: string;
    label: string;
    known: number;
    total: number;
    pct: number;
    detail: string;
    tone: "good" | "warn" | "bad" | "neutral";
  }>;
  viewLeaders: Array<{
    videoId: string;
    title: string;
    creatorName: string;
    platform: string;
    views: number;
    sharePct: number;
    cpvINR: number | null;
    clickRatePct: number | null;
    installRatePct: number | null;
  }>;
  todayItems: Array<{
    label: string;
    value: number;
    detail: string;
    href: string;
    tone: "good" | "warn" | "bad" | "neutral";
  }>;
}

// ── Helpers ───────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return "Never synced";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function freshnessColor(iso: string | null): string {
  if (!iso) return "var(--text-muted)";
  const hours = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (hours < 6) return "var(--green)";
  if (hours < 26) return "var(--amber)";
  return "var(--red)";
}

function StatCard({ label, value, sub, accent, help }: {
  label: string; value: string; sub?: string; accent?: string; help?: string;
}) {
  return (
    <div
      className="rounded-[18px] p-5 flex flex-col gap-2.5 transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: "var(--bg-card)",
        boxShadow: "var(--nm-raised)",
        border: "1px solid var(--border)",
      }}
    >
      <p className="label-caps flex items-center gap-1">
        {label}
        {help && <MetricHint text={help} />}
      </p>
      <p
        className="stat-number"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sub && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function Delta({ curr, prev }: { curr: number; prev?: number }) {
  if (!prev || prev === 0 || curr === 0) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const d = ((curr - prev) / prev) * 100;
  const up = d >= 0;
  return (
    <span className="text-xs font-bold tabular-nums" style={{ color: up ? "#10b981" : "#f59e0b" }}>
      {up ? "▲" : "▼"} {Math.abs(d).toFixed(0)}%
    </span>
  );
}

const ALL_PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "Twitter"];

function toneColor(tone: "good" | "warn" | "bad" | "neutral"): string {
  if (tone === "good") return "#10b981";
  if (tone === "warn") return "#f59e0b";
  if (tone === "bad") return "#ef4444";
  return "var(--accent)";
}

export function OverviewClient({ data }: { data: OverviewData }) {
  const { money, rate, count, pct, mode } = useCurrency();
  const [momTab, setMomTab] = useState<string>("All");

  const months = momTab === "All"
    ? data.months
    : (data.platformMonths[momTab] ?? []);

  const maxImp = Math.max(...months.map((m) => m.imp), 1);
  const viewsCoverage = data.coverage.find((metric) => metric.id === "views");
  const avgViewsPerLiveVideo = data.liveVideos > 0 ? data.totalImp / data.liveVideos : 0;
  const cpvINR = data.totalImp > 0 ? data.totalSpendINR / data.totalImp : 0;
  const viewToInstallPct = data.totalImp > 0 ? (data.totalInst / data.totalImp) * 100 : 0;
  const maxPlatformViews = Math.max(...data.platformStats.map((platform) => platform.imp), 1);
  const sortedPlatformViews = [...data.platformStats].sort((a, b) => b.imp - a.imp);

  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            Views Overview
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Reach-first read across {data.liveVideos} live videos · {data.totalCreators} creators
            {data.dubPartial && (
              <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>· partial Dub data</span>
            )}
          </p>
        </div>
        <div
          className="text-xs px-3 py-1.5 rounded-full font-semibold"
          style={{
            background: "var(--bg-surface)",
            boxShadow: "var(--nm-inset)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          {mode === "usd" ? "USD · ₹84/$" : "INR · ₹84/$"}
        </div>
      </div>

      {/* ── Views command center ─────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="section-heading">View Command Center</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Views are the primary operating layer; conversion and spend explain what those views are worth.
            </p>
          </div>
          <Link
            href="/dashboard/performance"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--accent-dim-border)" }}
          >
            Open performance
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
          <div className="rounded-[18px] p-5" style={{ background: "var(--bg-card)", boxShadow: "var(--nm-raised)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="label-caps flex items-center gap-1">
                  Total views / reach
                  <MetricHint text="Comparable top-of-funnel volume. Uses reported impressions where available and views otherwise." />
                </p>
                <p className="mt-2 text-4xl font-black tabular-nums leading-none" style={{ color: "var(--text-primary)" }}>
                  {count(data.totalImp)}
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  {count(avgViewsPerLiveVideo)} avg per live video · {viewsCoverage?.pct ?? 0}% view coverage
                </p>
              </div>
              <div className="shrink-0" style={{ width: 190, height: 54 }}>
                <Sparkline values={data.months.map((month) => month.imp)} width={190} height={54} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <p className="label-caps">View CPV</p>
                <p className="mt-1 text-lg font-bold" style={{ color: cpvINR > 0 && cpvINR <= 0.5 ? "#10b981" : "#f59e0b" }}>
                  {cpvINR > 0 ? money(cpvINR) : "—"}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <p className="label-caps">View → click</p>
                <p className="mt-1 text-lg font-bold" style={{ color: data.ctrPct >= 1 ? "#10b981" : "#f59e0b" }}>
                  {pct(data.ctrPct, 2)}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <p className="label-caps">View → install</p>
                <p className="mt-1 text-lg font-bold" style={{ color: viewToInstallPct >= 0.05 ? "#10b981" : "#f59e0b" }}>
                  {pct(viewToInstallPct, 3)}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <p className="label-caps">Views covered</p>
                <p className="mt-1 text-lg font-bold" style={{ color: toneColor(viewsCoverage?.tone ?? "neutral") }}>
                  {viewsCoverage?.known ?? 0}/{viewsCoverage?.total ?? 0}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {sortedPlatformViews.map((platform) => {
                const width = (platform.imp / maxPlatformViews) * 100;
                const platformCpv = platform.imp > 0 && platform.spendINR > 0 ? platform.spendINR / platform.imp : null;
                return (
                  <div key={platform.platform}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{platform.platform}</span>
                      <span style={{ color: "var(--text-muted)" }}>
                        {platform.imp > 0 ? count(platform.imp) : "—"} · CPV {platformCpv != null ? money(platformCpv) : "—"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                      <div className="h-full rounded-full" style={{ width: `${width}%`, background: PLATFORM_COLOR[platform.platform] ?? "var(--accent)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: "var(--bg-card)", boxShadow: "var(--nm-raised)", border: "1px solid var(--border)" }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="section-heading">View Leaders</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Top live videos by current view volume</p>
              </div>
              <Link href="/dashboard/videos" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {data.viewLeaders.slice(0, 6).map((leader, index) => (
                <Link
                  key={leader.videoId}
                  href={`/dashboard/videos?search=${encodeURIComponent(leader.creatorName)}`}
                  className="block rounded-xl p-3 transition-colors"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", textDecoration: "none" }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-black tabular-nums" style={{ color: "var(--accent)" }}>{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{leader.creatorName}</p>
                      <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{leader.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{count(leader.views)}</p>
                      <p className="text-[0.65rem]" style={{ color: "var(--text-muted)" }}>{leader.sharePct.toFixed(1)}% share</p>
                    </div>
                  </div>
                </Link>
              ))}
              {data.viewLeaders.length === 0 && (
                <p className="rounded-xl p-4 text-sm" style={{ color: "var(--text-muted)", background: "var(--bg-surface)" }}>
                  No view leaders yet. Add fresh view data to source sheets or run a sync.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Today / workflow strip ───────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="section-heading">Today</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              The fastest paths from diagnosis to decision
            </p>
          </div>
          <Link
            href="/dashboard/decision"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--accent-dim-border)" }}
          >
            Open decision view
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {data.todayItems.map((item) => {
            const color =
              item.tone === "good" ? "#10b981" : item.tone === "warn" ? "#f59e0b" : item.tone === "bad" ? "#ef4444" : "var(--accent)";
            return (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-2xl p-4 transition-all duration-150 hover:translate-y-[-1px]"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--nm-sm)",
                  textDecoration: "none",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{item.detail}</p>
                  </div>
                  <span className="text-2xl font-black tabular-nums leading-none" style={{ color }}>
                    {item.value}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Operator insights ────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h2 className="section-heading">Operator Insights</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Computed from current campaign data, Dub availability, and known data-health issues
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.operatorInsights.slice(0, 6).map((insight) => {
            const color = toneColor(insight.tone);
            return (
              <Link
                key={insight.id}
                href={insight.href}
                className="rounded-2xl p-4 transition-all duration-150 hover:translate-y-[-1px]"
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${color}33`,
                  boxShadow: "var(--nm-sm)",
                  textDecoration: "none",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{insight.title}</p>
                  <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap" style={{ background: `${color}22`, color }}>
                    {insight.metric}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {insight.body}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="section-heading">Data Precision</h2>
          <Link href="/dashboard/data-health" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
            See health details
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {data.coverage.map((metric) => {
            const color = toneColor(metric.tone);
            return (
              <div key={metric.id} className="rounded-xl p-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} title={metric.detail}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text-secondary)" }}>{metric.label}</p>
                  <span className="text-xs font-bold tabular-nums" style={{ color }}>{metric.pct}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                  <div className="h-full rounded-full" style={{ width: `${metric.pct}%`, background: color }} />
                </div>
                <p className="mt-2 text-[0.65rem] tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {metric.known}/{metric.total}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Freshness + Decision callout row ──────────────────── */}
      <div className="flex flex-wrap gap-3">
        {/* Data freshness */}
        <div
          className="flex items-center gap-4 px-4 py-2.5 rounded-2xl flex-1 min-w-0"
          style={{ background: "var(--bg-card)", boxShadow: "var(--nm-sm)", border: "1px solid var(--border)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            Data freshness
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: freshnessColor(data.ytLastSync) }}
              />
              <span style={{ color: "var(--text-secondary)" }}>YouTube</span>
              <span style={{ color: freshnessColor(data.ytLastSync) }}>
                {relativeTime(data.ytLastSync)}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: freshnessColor(data.dubLastSync) }}
              />
              <span style={{ color: "var(--text-secondary)" }}>Dub</span>
              <span style={{ color: freshnessColor(data.dubLastSync) }}>
                {relativeTime(data.dubLastSync)}
              </span>
            </span>
          </div>
        </div>

        {/* Decision callout */}
        {data.highPriorityActionCount > 0 && (
          <Link
            href="/dashboard/decision"
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-150 hover:translate-y-[-1px]"
            style={{
              background: "var(--bg-card)",
              boxShadow: "var(--nm-sm), 0 0 0 1.5px rgba(239,68,68,0.25)",
              border: "1px solid rgba(239,68,68,0.2)",
              textDecoration: "none",
            }}
          >
            <span
              className="text-sm font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#ef4444", color: "#fff" }}
            >
              {data.highPriorityActionCount}
            </span>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                Action items need attention
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                P0 / P1 issues open → Decision Center
              </p>
            </div>
            <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>→</span>
          </Link>
        )}
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Views / Reach"
          value={count(data.totalImp)}
          sub="Primary top-of-funnel volume"
          help="Uses reported impressions when available, otherwise views as the comparable top-of-funnel volume."
        />
        <StatCard
          label="Cost / 1k Views"
          value={rate(data.cpmUSD)}
          sub="Spend efficiency for reach"
          accent="var(--accent)"
          help="Net spend divided by impressions, multiplied by 1,000."
        />
        <StatCard
          label="Clicks"
          value={count(data.totalClk)}
          sub="Link clicks via Dub"
          help="Prefers live Dub clicks. Falls back to recorded click-throughs where Dub data is unavailable."
        />
        <StatCard
          label="CPC"
          value={rate(data.cpcUSD)}
          sub="Cost per click"
          accent="#0ea5e9"
          help="Net spend divided by measured or fallback clicks."
        />
        <StatCard
          label="CTR"
          value={pct(data.ctrPct, 2)}
          sub="Click-through rate"
          accent="#8b5cf6"
          help="Clicks divided by impressions or comparable view volume."
        />
        <StatCard
          label="Cost per Install"
          value={rate(data.cpiUSD)}
          sub={`${count(data.totalInst)} installs · C→I ${pct(data.c2iPct, 1)}`}
          accent="#10b981"
          help="Net spend divided by installs/leads. Shared attribution should be read at creator level."
        />
      </div>

      {/* ── Platform breakdown ─────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="section-heading">Platform View Breakdown</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Views first, then the click/install path by channel</p>
        </div>
        <div className="rounded-[18px] overflow-hidden" style={{ boxShadow: "var(--nm-raised)", border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                {["Platform", "Views / Reach", "Cost / 1k", "Clicks", "View→Click", "CPC", "Installs", "C→I", "CPI", "Spend"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 label-caps whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.platformStats.map((ps, i) => {
                const spd = ps.spendINR / USD_INR;
                const cpm = ps.imp  > 0 ? (spd / ps.imp) * 1000 : 0;
                const ctr = ps.imp  > 0 ? (ps.clk / ps.imp) * 100 : 0;
                const cpc = ps.clk  > 0 ? spd / ps.clk : 0;
                const c2i = ps.clk  > 0 ? (ps.inst / ps.clk) * 100 : 0;
                const cpi = ps.inst > 0 ? spd / ps.inst : 0;
                const isLast = i === data.platformStats.length - 1;
                return (
                  <tr
                    key={ps.platform}
                    className="transition-colors"
                    style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PLATFORM_COLOR[ps.platform] ?? "#888" }} />
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{ps.platform}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--text-secondary)" }}>{ps.imp > 0 ? count(ps.imp) : "—"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{cpm > 0 ? rate(cpm) : "—"}</td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--text-secondary)" }}>{ps.clk > 0 ? count(ps.clk) : "—"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{ctr > 0 ? pct(ctr, 2) : "—"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{cpc > 0 ? rate(cpc) : "—"}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums" style={{ color: "var(--accent)" }}>{ps.inst > 0 ? count(ps.inst) : "—"}</td>
                    <td className="px-4 py-3" style={{ color: c2i > 2 ? "#10b981" : "var(--text-muted)" }}>{c2i > 0 ? pct(c2i, 1) : "—"}</td>
                    <td className="px-4 py-3" style={{ color: cpi > 0 && cpi < 5 ? "#10b981" : cpi > 10 ? "#f59e0b" : "var(--text-muted)" }}>{cpi > 0 ? rate(cpi) : "—"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{ps.spendINR > 0 ? money(ps.spendINR) : "—"}</td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr style={{ background: "var(--bg-elevated)", borderTop: "2px solid var(--border)" }}>
                <td className="px-4 py-3 label-caps">Total</td>
                <td className="px-4 py-3 font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{count(data.totalImp)}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>{rate(data.cpmUSD)}</td>
                <td className="px-4 py-3 font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{count(data.totalClk)}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>{pct(data.ctrPct, 2)}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>{rate(data.cpcUSD)}</td>
                <td className="px-4 py-3 font-bold tabular-nums" style={{ color: "var(--accent)" }}>{count(data.totalInst)}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>{pct(data.c2iPct, 1)}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>{rate(data.cpiUSD)}</td>
                <td className="px-4 py-3 font-bold" style={{ color: "var(--text-primary)" }}>{money(data.totalSpendINR)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Top Creators ───────────────────────────────────────── */}
      <TopCreatorsWidget creators={data.topCreators} />

      {/* ── Month-on-Month ─────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="section-heading">Monthly View Trend</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>View/reach growth vs. prior month — toggle platform to drill down</p>
          </div>
          {/* Platform tabs */}
          <div className="flex gap-1 flex-wrap">
            {["All", ...ALL_PLATFORMS].map((p) => {
              const active = momTab === p;
              const hasData = p === "All"
                ? data.months.length > 0
                : (data.platformMonths[p]?.some((m) => m.imp > 0 || m.inst > 0) ?? false);
              return (
                <button
                  key={p}
                  onClick={() => setMomTab(p)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? "var(--accent)" : "var(--bg-surface)",
                    color: active ? "#fff" : hasData ? "var(--text-secondary)" : "var(--text-muted)",
                    border: active ? "none" : "1px solid var(--border)",
                    opacity: hasData ? 1 : 0.5,
                  }}
                >
                  {p === "All" ? "All" : (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: PLATFORM_COLOR[p] ?? "#888" }} />
                      {p}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[18px] overflow-hidden" style={{ boxShadow: "var(--nm-raised)", border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                {["Month", "Views / Reach", "Δ", "Cost / 1k", "Clicks", "Δ", "View→Click", "CPC", "Installs", "Δ", "CPI", "Spend"].map((h, i) => (
                  <th key={`${h}${i}`} className="text-left px-4 py-3 label-caps whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No data for {momTab}
                  </td>
                </tr>
              ) : months.map((m, i) => {
                const prev = i > 0 ? months[i - 1] : undefined;
                const spd = m.spendINR / USD_INR;
                const mCpm = m.imp  > 0 ? (spd / m.imp) * 1000 : 0;
                const mCtr = m.imp  > 0 ? (m.clk / m.imp) * 100 : 0;
                const mCpc = m.clk  > 0 ? spd / m.clk : 0;
                const mCpi = m.inst > 0 ? spd / m.inst : 0;
                const barW = maxImp > 0 ? (m.imp / maxImp) * 100 : 0;
                return (
                  <tr
                    key={m.ym}
                    className="transition-colors"
                    style={{ borderBottom: i < months.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 rounded-full overflow-hidden shrink-0" style={{ background: "var(--border)" }}>
                          <div className="h-full rounded-full" style={{ width: `${barW}%`, background: "var(--accent)" }} />
                        </div>
                        {m.label}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--text-secondary)" }}>{m.imp > 0 ? count(m.imp) : "—"}</td>
                    <td className="px-4 py-3"><Delta curr={m.imp} prev={prev?.imp} /></td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{mCpm > 0 ? rate(mCpm) : "—"}</td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--text-secondary)" }}>{m.clk > 0 ? count(m.clk) : "—"}</td>
                    <td className="px-4 py-3"><Delta curr={m.clk} prev={prev?.clk} /></td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{mCtr > 0 ? pct(mCtr, 2) : "—"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{mCpc > 0 ? rate(mCpc) : "—"}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums" style={{ color: "var(--accent)" }}>{m.inst > 0 ? count(m.inst) : "—"}</td>
                    <td className="px-4 py-3"><Delta curr={m.inst} prev={prev?.inst} /></td>
                    <td className="px-4 py-3" style={{ color: mCpi > 0 && mCpi < 5 ? "#10b981" : mCpi > 10 ? "#f59e0b" : "var(--text-muted)" }}>{mCpi > 0 ? rate(mCpi) : "—"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{m.spendINR > 0 ? money(m.spendINR) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CPI Trend by Campaign Batch ──────────────────────── */}
      {data.monthCPIs.filter((m) => m.cpiINR !== null).length >= 2 && (
        <section className="card p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="section-heading">CPI Trend — Campaign Batches</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Cost-per-install for each cohort of creators launched that month
              </p>
            </div>
            <div className="shrink-0" style={{ width: 160, height: 44 }}>
              <Sparkline
                values={data.monthCPIs.map((m) => m.cpiINR ?? 0).filter((_, i) => data.monthCPIs[i].cpiINR !== null)}
                invertTrend
                width={160}
                height={44}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Cohort", "Installs", "Spend", "CPI (INR)", "CPI (USD)"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-semibold"
                      style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.monthCPIs.map((m, i) => {
                  const cpiINR = m.cpiINR;
                  const cpiUSD = cpiINR != null ? cpiINR / USD_INR : null;
                  const cpiColor =
                    cpiINR == null
                      ? "var(--text-muted)"
                      : cpiINR <= 300
                      ? "#10b981"
                      : cpiINR <= 600
                      ? "#f59e0b"
                      : "#ef4444";
                  return (
                    <tr
                      key={m.ym}
                      style={{ borderBottom: i < data.monthCPIs.length - 1 ? "1px solid var(--border)" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      className="transition-colors"
                    >
                      <td className="px-3 py-2.5 font-semibold" style={{ color: "var(--text-primary)" }}>
                        {m.label}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {m.installs > 0 ? m.installs.toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {m.spendINR > 0 ? `₹${(m.spendINR / 1000).toFixed(1)}k` : "—"}
                      </td>
                      <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: cpiColor }}>
                        {cpiINR != null ? `₹${cpiINR.toFixed(0)}` : "—"}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: "var(--text-muted)" }}>
                        {cpiUSD != null ? `$${cpiUSD.toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
