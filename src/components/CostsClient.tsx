"use client";

import { useState, useMemo } from "react";
import { costs, videos, creators, performances, installs, campaigns } from "@/lib/mock-data";
import { useCurrency } from "@/lib/currency-context";

export interface DubByVideo {
  [videoId: string]: { clicks: number; leads: number };
}
import { SortableTable, type Column } from "@/components/SortableTable";
import { StatCard } from "@/components/StatCard";
import { CostCharts } from "@/components/CostCharts";
import { Sparkline } from "@/components/Sparkline";
import { DollarSign, TrendingUp, Target, Percent, Download } from "lucide-react";

interface CostRow {
  videoId: string;
  title: string;
  creatorName: string;
  agency: string;
  campaignId: string;
  grossCost: number;
  agencyFee: number;
  agencyFeePct: number;
  netCost: number;
  views: number;
  videoInstalls: number;
  cpi: number;
  cpv: number;
  cpm: number;
  clickToInstallRate: number;
  roas: number;
}

export function CostsClient({ dubByVideo = {} }: { dubByVideo?: DubByVideo }) {
  const { money, count } = useCurrency();
  const [search, setSearch] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");

  const allRows: CostRow[] = useMemo(() => costs.map((c) => {
    const video = videos.find((v) => v.id === c.videoId);
    const creator = creators.find((cr) => cr.id === c.creatorId);
    const perf = performances.find((p) => p.videoId === c.videoId);
    const installRec = installs.find((i) => i.videoId === c.videoId);
    const views = perf ? (perf.impressions ?? perf.views) : 0;
    const clicks = dubByVideo[c.videoId]?.clicks ?? perf?.clickThroughs ?? 0;
    const videoInstalls = dubByVideo[c.videoId]?.leads ?? installRec?.installs ?? 0;
    const revenue = installRec?.revenue ?? 0;
    const cpi = videoInstalls > 0 && c.netCost > 0 ? c.netCost / videoInstalls : 0;
    const cpv = views > 0 && c.netCost > 0 ? c.netCost / views : 0;
    const cpm = views > 0 && c.netCost > 0 ? (c.netCost / views) * 1000 : 0;
    const clickToInstallRate = clicks > 0 ? (videoInstalls / clicks) * 100 : 0;
    const roas = c.netCost > 0 && revenue > 0 ? revenue / c.netCost : 0;
    return {
      videoId: c.videoId,
      title: video?.title ?? c.videoId,
      creatorName: creator?.name ?? "—",
      agency: creator?.agency ?? "—",
      campaignId: c.campaignId ?? "",
      grossCost: c.grossCost,
      agencyFee: c.agencyFee,
      agencyFeePct: c.grossCost > 0 ? (c.agencyFee / c.grossCost) * 100 : 0,
      netCost: c.netCost,
      views,
      videoInstalls,
      cpi,
      cpv,
      cpm,
      clickToInstallRate,
      roas,
    };
  }), []);

  // Distinct agencies and campaigns for filter controls
  const agencies = useMemo(() => {
    const vals = Array.from(new Set(allRows.map((r) => r.agency))).filter(Boolean).sort();
    return vals;
  }, [allRows]);

  const campaignOptions = useMemo(() => {
    return campaigns.filter((camp) =>
      allRows.some((r) => r.campaignId === camp.id)
    );
  }, [allRows]);

  // Filtered rows
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (agencyFilter !== "All" && r.agency !== agencyFilter) return false;
      if (campaignFilter !== "All" && r.campaignId !== campaignFilter) return false;
      if (q && !r.title.toLowerCase().includes(q) && !r.creatorName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allRows, search, agencyFilter, campaignFilter]);

  // Stats over ALL rows (not filtered), bug-fixed avgCPV
  const totalGross = costs.reduce((s, c) => s + c.grossCost, 0);
  const totalFees = costs.reduce((s, c) => s + c.agencyFee, 0);
  const totalNet = costs.reduce((s, c) => s + c.netCost, 0);
  const totalInstalls = allRows.reduce((s, r) => s + r.videoInstalls, 0);
  const overallCPI = totalInstalls > 0 ? totalNet / totalInstalls : 0;
  const cpvRows = allRows.filter((r) => r.netCost > 0 && r.views > 0);
  const cpvTotalNet = cpvRows.reduce((s, r) => s + r.netCost, 0);
  const cpvTotalViews = cpvRows.reduce((s, r) => s + r.views, 0);
  const avgCPV = cpvTotalViews > 0 ? cpvTotalNet / cpvTotalViews : 0;

  // CPI by go-live month (campaign batch trend)
  const monthCPIs = useMemo(() => {
    const map = new Map<string, { spendINR: number; installs: number }>();
    for (const row of allRows) {
      const video = videos.find((v) => v.id === row.videoId);
      const ym = video?.goLiveDate?.slice(0, 7);
      if (!ym || row.netCost === 0) continue;
      if (!map.has(ym)) map.set(ym, { spendINR: 0, installs: 0 });
      const b = map.get(ym)!;
      b.spendINR += row.netCost;
      b.installs += row.videoInstalls;
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, b]) => ({
        ym,
        label: new Date(ym + "-15").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        cpiINR: b.installs > 0 ? b.spendINR / b.installs : null,
      }));
  }, [allRows]);

  // CSV export
  function handleExport() {
    const headers = ["Title", "Creator", "Agency", "Gross Cost", "Agency Fee", "Net Cost", "Views", "Installs", "CPI", "CPV", "CPM", "ROAS"];
    const csvRows = rows.map((r) => [
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.creatorName}"`,
      `"${r.agency}"`,
      r.grossCost,
      r.agencyFee,
      r.netCost,
      r.views,
      r.videoInstalls,
      r.cpi.toFixed(2),
      r.cpv.toFixed(4),
      r.cpm.toFixed(2),
      r.roas.toFixed(2),
    ]);
    const content = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "costs-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns: Column<CostRow>[] = [
    {
      key: "title", label: "Video", sortable: true,
      getValue: (r) => r.title,
      render: (r) => (
        <div className="max-w-xs">
          <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{r.title}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.creatorName}</p>
        </div>
      ),
    },
    {
      key: "agency", label: "Agency", sortable: true,
      getValue: (r) => r.agency,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.agency}</span>,
    },
    {
      key: "grossCost", label: "Gross", sortable: true,
      getValue: (r) => r.grossCost,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{money(r.grossCost)}</span>,
    },
    {
      key: "agencyFee", label: "Agency Fee", sortable: true,
      getValue: (r) => r.agencyFee,
      render: (r) => (
        <div>
          <span className="text-sm text-amber-500">{money(r.agencyFee)}</span>
          <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>({r.agencyFeePct.toFixed(0)}%)</span>
        </div>
      ),
    },
    {
      key: "netCost", label: "Net Cost", sortable: true,
      getValue: (r) => r.netCost,
      render: (r) => <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{money(r.netCost)}</span>,
    },
    {
      key: "views", label: "Views", sortable: true,
      getValue: (r) => r.views,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.views ? count(r.views) : "—"}</span>,
    },
    {
      key: "videoInstalls", label: "Installs", sortable: true,
      getValue: (r) => r.videoInstalls,
      render: (r) => <span className="text-sm font-semibold text-indigo-500">{r.videoInstalls ? count(r.videoInstalls) : "—"}</span>,
    },
    {
      key: "cpi", label: "CPI", sortable: true,
      getValue: (r) => r.cpi,
      render: (r) => r.cpi ? (
        <span className={`text-sm font-medium ${r.cpi <= 300 ? "text-emerald-500" : r.cpi <= 500 ? "text-amber-500" : "text-red-500"}`}>
          {money(r.cpi)}
        </span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "cpv", label: "CPV", sortable: true,
      getValue: (r) => r.cpv,
      render: (r) => r.cpv ? (
        <span className={`text-sm ${r.cpv <= 0.4 ? "text-emerald-500" : r.cpv <= 0.5 ? "text-amber-500" : "text-red-500"}`}>
          {money(r.cpv)}
        </span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "cpm", label: "CPM", sortable: true,
      getValue: (r) => r.cpm,
      render: (r) => r.cpm ? (
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{money(r.cpm)}</span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "roas", label: "ROAS", sortable: true,
      getValue: (r) => r.roas,
      render: (r) => r.roas ? (
        <span className={`text-sm font-medium ${r.roas >= 2 ? "text-emerald-500" : r.roas >= 1 ? "text-amber-500" : "text-red-500"}`}>
          {r.roas.toFixed(1)}x
        </span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Costs &amp; ROI
            <span className="ml-3 text-sm font-normal px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              {rows.length} of {allRows.length}
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Spend breakdown, CPI, CPV, CPM, ROAS — click headers to sort
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface-1)" }}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatCard label="Gross Spend" value={money(totalGross)} icon={DollarSign} iconColor="text-slate-500" iconBg="bg-slate-100 dark:bg-slate-500/10" />
        <StatCard label="Agency Fees" value={money(totalFees)} sub={`${((totalFees / totalGross) * 100).toFixed(0)}% of gross`} icon={Percent} iconColor="text-amber-500" iconBg="bg-amber-100 dark:bg-amber-500/10" />
        <StatCard label="Net Spend" value={money(totalNet)} icon={DollarSign} iconColor="text-emerald-500" iconBg="bg-emerald-100 dark:bg-emerald-500/10" />
        <StatCard label="Overall CPI" value={overallCPI ? money(overallCPI) : "—"} sub={`${count(totalInstalls)} installs`} icon={Target} iconColor="text-indigo-500" iconBg="bg-indigo-100 dark:bg-indigo-500/10" />
        <StatCard label="Avg CPV" value={avgCPV ? money(avgCPV) : "—"} icon={TrendingUp} iconColor="text-rose-500" iconBg="bg-rose-100 dark:bg-rose-500/10" />
      </div>

      {/* CPI trajectory sparkline */}
      {monthCPIs.filter((m) => m.cpiINR !== null).length >= 2 && (
        <div
          className="mb-6 px-5 py-4 rounded-2xl flex items-center gap-6"
          style={{ background: "var(--bg-card)", boxShadow: "var(--nm-sm)", border: "1px solid var(--border)" }}
        >
          <div className="flex-1">
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>CPI Trend — Campaign Batches</p>
            <div className="flex items-center gap-4 flex-wrap">
              {monthCPIs.map((m) => (
                m.cpiINR !== null && (
                  <span key={m.ym} className="flex items-center gap-1 text-xs">
                    <span style={{ color: "var(--text-muted)" }}>{m.label}</span>
                    <span
                      className="font-semibold"
                      style={{ color: m.cpiINR <= 300 ? "#10b981" : m.cpiINR <= 600 ? "#f59e0b" : "#ef4444" }}
                    >
                      ₹{m.cpiINR.toFixed(0)}
                    </span>
                  </span>
                )
              ))}
            </div>
          </div>
          <Sparkline
            values={monthCPIs.filter((m) => m.cpiINR !== null).map((m) => m.cpiINR!)}
            invertTrend
            width={140}
            height={40}
          />
        </div>
      )}

      <CostCharts rows={allRows} />

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by title or creator…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border outline-none w-64"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)", color: "var(--text-primary)" }}
        />

        {/* Agency pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", ...agencies].map((a) => (
            <button
              key={a}
              onClick={() => setAgencyFilter(a)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                agencyFilter === a
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-transparent"
              }`}
              style={agencyFilter !== a ? { background: "var(--surface-2)", color: "var(--text-secondary)", borderColor: "var(--border)" } : {}}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Campaign select */}
        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="text-sm px-2.5 py-1.5 rounded-lg border outline-none"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)", color: "var(--text-primary)" }}
        >
          <option value="All">All Campaigns</option>
          {campaignOptions.map((camp) => (
            <option key={camp.id} value={camp.id}>{camp.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <SortableTable columns={columns} data={rows} rowKey={(r) => r.videoId} emptyMessage="No cost data matches your filters." />
      </div>

      <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
        Note: WLDD and LinkedIn Seeding campaigns have no cost data — they are excluded from this table.
      </p>
    </div>
  );
}
