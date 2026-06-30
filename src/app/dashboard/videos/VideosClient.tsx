"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { videos, performances, costs, installs, campaigns } from "@/lib/mock-data";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { SortableTable, type Column } from "@/components/SortableTable";
import { Badge } from "@/components/Badge";
import { statusBadge, formatBadge, platformBadge } from "@/lib/badges";
import { ExternalLink } from "lucide-react";
import type { Video } from "@/types";

type Activity = "Active" | "Exhausted" | "Upcoming";

const TODAY = new Date().toISOString().slice(0, 10);
const ACTIVE_DAYS = 10;

function computeActivity(goLiveDate: string, status: string): Activity {
  if (status === "Scheduled") return "Upcoming";
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = (new Date(TODAY).getTime() - new Date(goLiveDate).getTime()) / msPerDay;
  return diffDays <= ACTIVE_DAYS ? "Active" : "Exhausted";
}

const ACTIVITY_BADGE: Record<Activity, string> = {
  Active:    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  Exhausted: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  Upcoming:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

interface VideoRow extends Video {
  views: number;
  clickThroughs: number;
  videoInstalls: number;
  cpi: number;
  clickToInstallRate: number;
  cpv: number;
  netCost: number;
  roas: number;
  activity: Activity;
}

const PLATFORMS = ["All", "Instagram", "YouTube", "LinkedIn"] as const;
const STATUSES  = ["All", "Live", "Scheduled"] as const;
const ACTIVITIES = ["All", "Active", "Exhausted", "Upcoming"] as const;

type Platform       = (typeof PLATFORMS)[number];
type Status         = (typeof STATUSES)[number];
type ActivityFilter = (typeof ACTIVITIES)[number];

interface DubStats { clicks: number; leads: number }

function PillButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
        active ? "bg-indigo-600 text-white" : "text-sm"
      }`}
      style={active ? undefined : { background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
    >
      {label}
    </button>
  );
}

function exportCSV(rows: VideoRow[]) {
  const headers = ["Title", "Creator", "Platform", "Format", "Live Date", "Views", "Clicks", "Installs", "CPI", "Click→Install%", "Net Cost", "Status", "URL"];
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csvRows = [
    headers.join(","),
    ...rows.map((r) =>
      [r.title, r.creatorName, r.platform, r.format, r.goLiveDate, r.views, r.clickThroughs, r.videoInstalls,
       r.cpi ? r.cpi.toFixed(2) : "", r.clickToInstallRate ? r.clickToInstallRate.toFixed(1) + "%" : "",
       r.netCost ? r.netCost.toFixed(2) : "", r.status, r.url].map(escape).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csvRows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "videos.csv"; a.click();
  URL.revokeObjectURL(url);
}

export function VideosClient({ dubByVideo = {} }: { dubByVideo?: Record<string, DubStats> }) {
  const searchParams = useSearchParams();
  const [search, setSearch]     = useState(searchParams.get("search") ?? "");
  const [platform, setPlatform] = useState<Platform>("All");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);
  const [campaign, setCampaign] = useState("All");
  const [status, setStatus]     = useState<Status>("All");
  const [activity, setActivity] = useState<ActivityFilter>("All");

  const allRows: VideoRow[] = useMemo(
    () =>
      videos.map((v) => {
        const perf       = performances.find((p) => p.videoId === v.id);
        const cost       = costs.find((c) => c.videoId === v.id);
        const installRec = installs.find((i) => i.videoId === v.id);
        const views      = perf?.views ?? 0;

        // Clicks: prefer live Dub, fall back to perf record
        const dubEntry   = dubByVideo[v.id];
        const clicks     = dubEntry?.clicks   ?? perf?.clickThroughs ?? 0;
        // Installs: prefer live Dub leads, fall back to mock record
        const videoInstalls = dubEntry?.leads ?? installRec?.installs ?? 0;

        const netCost  = cost?.netCost ?? 0;
        const revenue  = installRec?.revenue ?? 0;
        const cpi      = videoInstalls > 0 && netCost > 0 ? netCost / videoInstalls : 0;
        const cpv      = views > 0 && netCost > 0 ? netCost / views : 0;
        const clickToInstallRate = clicks > 0 ? (videoInstalls / clicks) * 100 : 0;
        const roas     = netCost > 0 && revenue > 0 ? revenue / netCost : 0;
        return { ...v, views, clickThroughs: clicks, videoInstalls, cpi, clickToInstallRate, cpv, netCost, roas, activity: computeActivity(v.goLiveDate, v.status) };
      }),
    [dubByVideo]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q) && !r.creatorName.toLowerCase().includes(q)) return false;
      if (platform !== "All" && r.platform !== platform) return false;
      if (status !== "All" && r.status !== status) return false;
      if (activity !== "All" && r.activity !== activity) return false;
      if (campaign !== "All" && r.campaignId !== campaign) return false;
      return true;
    });
  }, [allRows, search, platform, status, activity, campaign]);

  const columns: Column<VideoRow>[] = [
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
    { key: "platform", label: "Platform", sortable: true, getValue: (r) => r.platform, render: (r) => <Badge label={r.platform} className={platformBadge[r.platform]} /> },
    { key: "format",   label: "Format",   sortable: true, getValue: (r) => r.format,   render: (r) => <Badge label={r.format}   className={formatBadge[r.format] ?? ""} /> },
    {
      key: "goLiveDate", label: "Go-Live", sortable: true,
      getValue: (r) => r.goLiveDate,
      render: (r) => <span className="text-sm whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{formatDate(r.goLiveDate)}</span>,
    },
    {
      key: "views", label: "Views", sortable: true, getValue: (r) => r.views,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.views ? formatNumber(r.views) : "—"}</span>,
    },
    {
      key: "clickThroughs", label: "Clicks", sortable: true, getValue: (r) => r.clickThroughs,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.clickThroughs ? formatNumber(r.clickThroughs) : "—"}</span>,
    },
    {
      key: "videoInstalls", label: "Installs", sortable: true, getValue: (r) => r.videoInstalls,
      render: (r) => <span className="text-sm font-semibold text-indigo-500">{r.videoInstalls ? formatNumber(r.videoInstalls) : "—"}</span>,
    },
    {
      key: "cpi", label: "CPI", sortable: true, getValue: (r) => r.cpi,
      render: (r) => r.cpi ? (
        <span className={`text-sm font-medium ${r.cpi <= 300 ? "text-emerald-500" : r.cpi <= 500 ? "text-amber-500" : "text-red-500"}`}>
          {formatCurrency(r.cpi)}
        </span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "clickToInstallRate", label: "Click→Install", sortable: true, getValue: (r) => r.clickToInstallRate,
      render: (r) => r.clickToInstallRate ? (
        <span className={`text-sm font-medium ${r.clickToInstallRate >= 5 ? "text-emerald-500" : r.clickToInstallRate >= 2 ? "text-amber-500" : "text-red-500"}`}>
          {r.clickToInstallRate.toFixed(1)}%
        </span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "roas", label: "ROAS", sortable: true, getValue: (r) => r.roas,
      render: (r) => r.roas ? (
        <span className={`text-sm font-medium ${r.roas >= 2 ? "text-emerald-500" : r.roas >= 1 ? "text-amber-500" : "text-red-500"}`}>
          {r.roas.toFixed(1)}x
        </span>
      ) : <span style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "netCost", label: "Net Cost", sortable: true, getValue: (r) => r.netCost,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.netCost ? formatCurrency(r.netCost) : "—"}</span>,
    },
    { key: "status",   label: "Status",   sortable: true, getValue: (r) => r.status,   render: (r) => <Badge label={r.status}   className={statusBadge[r.status]} /> },
    { key: "activity", label: "Activity", sortable: true, getValue: (r) => r.activity, render: (r) => <Badge label={r.activity} className={ACTIVITY_BADGE[r.activity]} /> },
    {
      key: "link", label: "",
      render: (r) => (
        <a href={r.url} target="_blank" rel="noreferrer" aria-label="Open video" style={{ color: "var(--text-muted)" }} className="hover:text-indigo-500 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Video Repository</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              {filteredRows.length} of {allRows.length} videos
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Clicks &amp; installs via Dub (live) · Click headers to sort
          </p>
        </div>
        <button
          onClick={() => exportCSV(filteredRows)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-indigo-700 bg-indigo-600 text-white"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search title or creator…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
          style={{ background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border)", minWidth: 200 }}
        />
        <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
        {PLATFORMS.map((p) => <PillButton key={p} label={p} active={platform === p} onClick={() => setPlatform(p)} />)}
        <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
        {STATUSES.map((s)  => <PillButton key={s} label={s}  active={status === s}   onClick={() => setStatus(s)} />)}
        <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
        {ACTIVITIES.map((a) => <PillButton key={a} label={a} active={activity === a} onClick={() => setActivity(a)} />)}
        <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
        <select
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          className="text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
          style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          <option value="All">All campaigns</option>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <SortableTable columns={columns} data={filteredRows} rowKey={(r) => r.id} emptyMessage="No videos match your filters." />
    </div>
  );
}
