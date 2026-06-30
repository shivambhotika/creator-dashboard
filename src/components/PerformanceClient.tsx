"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { videos, performances, costs, installs, creators, campaigns } from "@/lib/mock-data";
import { useCurrency } from "@/lib/currency-context";
import { SortableTable, type Column } from "@/components/SortableTable";
import { PerformanceCharts } from "@/components/PerformanceCharts";
import { StatCard } from "@/components/StatCard";
import { Eye, Zap, Download, Clock } from "lucide-react";

export interface DubByVideo {
  [videoId: string]: { clicks: number; leads: number };
}


interface PerfRow {
  videoId: string;
  title: string;
  creatorName: string;
  platform: string;
  campaignName: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTimeMinutes: number;
  clickThroughs: number;
  videoInstalls: number;
  revenue: number;
  engagementRate: number;
  clickToInstallRate: number;
  viewToInstallRate: number;
  cpi: number;
  roas: number;
  quality: "Full" | "Partial" | "No data";
  isDubMeasured: boolean;
}

function QualityBadge({ quality }: { quality: PerfRow["quality"] }) {
  if (quality === "Full") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        ✓ Full
      </span>
    );
  }
  if (quality === "Partial") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
        ⚠ Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400">
      – No data
    </span>
  );
}

function exportCSV(rows: PerfRow[]) {
  const headers = [
    "Title", "Creator", "Views", "Likes", "Comments", "Shares",
    "Eng%", "Watch Mins", "Dub Clicks", "Installs",
    "Click→Install%", "CPI", "ROAS", "Quality",
  ];
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csvRows = rows.map((r) => [
    escape(r.title),
    escape(r.creatorName),
    r.views,
    r.likes,
    r.comments,
    r.shares,
    r.engagementRate.toFixed(2),
    Math.round(r.watchTimeMinutes),
    r.clickThroughs,
    r.videoInstalls,
    r.clickToInstallRate.toFixed(1),
    r.cpi.toFixed(2),
    r.roas.toFixed(2),
    escape(r.quality),
  ].join(","));
  const csv = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "performance.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function PerformanceClient({ dubByVideo = {} }: { dubByVideo?: DubByVideo }) {
  const { money, count } = useCurrency();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const allRows: PerfRow[] = useMemo(() => {
    return performances.map((p) => {
      const video = videos.find((v) => v.id === p.videoId);
      const cost = costs.find((c) => c.videoId === p.videoId);
      const creator = creators.find((c) => c.id === video?.creatorId);
      const installRec = installs.find((i) => i.videoId === p.videoId);
      const isDubMeasured = dubByVideo[p.videoId] !== undefined;
      const videoInstalls = isDubMeasured ? dubByVideo[p.videoId]!.leads : (installRec?.installs ?? 0);
      const revenue = installRec?.revenue ?? 0;
      const netCost = cost?.netCost ?? 0;
      const engagementRate = p.views > 0 ? ((p.likes + p.comments + p.shares) / p.views) * 100 : 0;
      const dubClicks = dubByVideo[p.videoId]?.clicks ?? p.clickThroughs;
      const clickToInstallRate = dubClicks > 0 ? (videoInstalls / dubClicks) * 100 : 0;
      const viewToInstallRate = p.views > 0 ? (videoInstalls / p.views) * 100 : 0;
      const cpi = videoInstalls > 0 && netCost > 0 ? netCost / videoInstalls : 0;
      const roas = netCost > 0 && revenue > 0 ? revenue / netCost : 0;

      const platform = video?.platform ?? "Unknown";
      const campaign = video?.campaignId ? campaigns.find((c) => c.id === video.campaignId) : undefined;
      const campaignName = campaign?.name ?? "—";

      let quality: PerfRow["quality"];
      if (p.views === 0) {
        quality = "No data";
      } else if (p.likes > 0 || p.comments > 0) {
        quality = "Full";
      } else {
        quality = "Partial";
      }

      return {
        videoId: p.videoId,
        title: video?.title ?? p.videoId,
        creatorName: creator?.name ?? video?.creatorName ?? "—",
        platform,
        campaignName,
        views: p.views,
        likes: p.likes,
        comments: p.comments,
        shares: p.shares,
        watchTimeMinutes: p.watchTimeMinutes,
        clickThroughs: dubClicks,
        videoInstalls,
        revenue,
        engagementRate,
        clickToInstallRate,
        viewToInstallRate,
        cpi,
        roas,
        quality,
        isDubMeasured,
      };
    });
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q) && !r.creatorName.toLowerCase().includes(q)) return false;
      if (platformFilter !== "All" && r.platform !== platformFilter) return false;
      if (campaignFilter !== "All" && r.campaignName !== campaignFilter) return false;
      return true;
    });
  }, [allRows, search, platformFilter, campaignFilter]);

  const totalViews = filteredRows.reduce((s, r) => s + r.views, 0);
  const totalInstalls = filteredRows.reduce((s, r) => s + r.videoInstalls, 0);
  const rowsWithViews = filteredRows.filter((r) => r.views > 0);
  const avgEngagement = rowsWithViews.length > 0
    ? rowsWithViews.reduce((s, r) => s + r.engagementRate, 0) / rowsWithViews.length
    : 0;
  const totalWatchHrs = Math.round(filteredRows.reduce((s, r) => s + r.watchTimeMinutes, 0) / 60);

  const campaignNames = useMemo(() => {
    const names = new Set(allRows.map((r) => r.campaignName).filter((n) => n !== "—"));
    return Array.from(names).sort();
  }, [allRows]);

  const platforms = ["All", "Instagram", "YouTube", "LinkedIn"];

  const columns: Column<PerfRow>[] = [
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
      key: "views", label: "Views", sortable: true,
      getValue: (r) => r.views,
      render: (r) => <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{count(r.views)}</span>,
    },
    {
      key: "engagementRate", label: "Eng %", sortable: true,
      getValue: (r) => r.engagementRate,
      render: (r) => (
        <span className={`text-sm font-medium ${r.engagementRate >= 7 ? "text-emerald-500" : r.engagementRate >= 4 ? "text-amber-500" : "text-red-500"}`}>
          {r.engagementRate.toFixed(2)}%
        </span>
      ),
    },
    {
      key: "watchTimeMinutes", label: "Watch Time", sortable: true,
      getValue: (r) => r.watchTimeMinutes,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{count(Math.round(r.watchTimeMinutes / 60))}h</span>,
    },
    {
      key: "clickThroughs", label: "Dub Clicks", sortable: true,
      getValue: (r) => r.clickThroughs,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{count(r.clickThroughs)}</span>,
    },
    {
      key: "videoInstalls", label: "Installs", sortable: true,
      getValue: (r) => r.videoInstalls,
      render: (r) => r.videoInstalls ? (
        <span
          className="text-sm font-semibold text-indigo-500"
          title={r.isDubMeasured ? "Measured via Dub" : "Estimated (no Dub link)"}
        >
          {r.isDubMeasured ? "" : "~"}{count(r.videoInstalls)}
        </span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "clickToInstallRate", label: "Click→Install", sortable: true,
      getValue: (r) => r.clickToInstallRate,
      render: (r) => r.clickToInstallRate ? (
        <span className={`text-sm font-medium ${r.clickToInstallRate >= 5 ? "text-emerald-500" : r.clickToInstallRate >= 2 ? "text-amber-500" : "text-red-500"}`}>
          {r.clickToInstallRate.toFixed(1)}%
        </span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "cpi", label: "CPI", sortable: true,
      getValue: (r) => r.cpi,
      render: (r) => r.cpi ? (
        <span
          className={`text-sm font-medium ${r.cpi <= 300 ? "text-emerald-500" : r.cpi <= 500 ? "text-amber-500" : "text-red-500"}`}
          title={r.isDubMeasured ? "Measured via Dub" : "Estimated (no Dub link)"}
        >
          {r.isDubMeasured ? "" : "~"}{money(r.cpi)}
        </span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "revenue", label: "Revenue", sortable: true,
      getValue: (r) => r.revenue,
      render: (r) => r.revenue ? (
        <span className="text-sm font-medium text-emerald-500">{money(r.revenue)}</span>
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
    {
      key: "quality", label: "Quality", sortable: true,
      getValue: (r) => r.quality,
      render: (r) => <QualityBadge quality={r.quality} />,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            Performance
            <span className="text-sm font-normal px-2 py-0.5 rounded-full" style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              {filteredRows.length} of {allRows.length}
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Engagement, installs, and ROAS · Attribution via Dub
          </p>
        </div>
        <button
          onClick={() => exportCSV(filteredRows)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Views" value={count(totalViews)} icon={Eye} iconColor="text-indigo-500" iconBg="bg-indigo-100 dark:bg-indigo-500/10" />
        <StatCard label="Total Installs" value={count(totalInstalls)} sub="via Dub attribution" icon={Download} iconColor="text-rose-500" iconBg="bg-rose-100 dark:bg-rose-500/10" />
        <StatCard label="Avg Engagement" value={`${avgEngagement.toFixed(2)}%`} sub="likes + comments + shares" icon={Zap} iconColor="text-amber-500" iconBg="bg-amber-100 dark:bg-amber-500/10" />
        <StatCard label="Total Watch Time" value={`${count(totalWatchHrs)}h`} icon={Clock} iconColor="text-violet-500" iconBg="bg-violet-100 dark:bg-violet-500/10" />
      </div>

      <PerformanceCharts rows={filteredRows} />

      <div className="mt-6">
        {/* Search + Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <input
            type="search"
            placeholder="Search by title or creator…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              minWidth: "220px",
            }}
          />

          {/* Platform pills */}
          <div className="flex items-center gap-1">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                style={
                  platformFilter === p
                    ? { background: "rgb(99 102 241)", color: "#fff", border: "1px solid transparent" }
                    : { background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
                }
              >
                {p}
              </button>
            ))}
          </div>

          {/* Campaign select */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-surface)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <option value="All">All Campaigns</option>
            {campaignNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <SortableTable columns={columns} data={filteredRows} rowKey={(r) => r.videoId} emptyMessage="No performance data matches your filters." />
      </div>
    </div>
  );
}
