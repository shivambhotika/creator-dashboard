"use client";

import { useState, useMemo } from "react";
import { creators } from "@/lib/mock-data";
import type { CreatorMetrics } from "@/types";
import { useCurrency } from "@/lib/currency-context";
import { TopCreatorsWidget } from "@/components/TopCreatorsWidget";
import { SortableTable, type Column } from "@/components/SortableTable";
import { Badge } from "@/components/Badge";
import { tierBadge, statusBadge, platformBadge } from "@/lib/badges";
import { ExternalLink, Link2, Download } from "lucide-react";
import type { Creator } from "@/types";

interface CreatorRow extends Creator {
  totalSpend: number;
  totalViews: number;
  totalInstalls: number;
  cpi: number;
  clickToInstallRate: number;
  roas: number;
  efficiencyScore: number;
  videoCount: number;
}

const PLATFORMS = ["All", "Instagram", "YouTube", "LinkedIn"] as const;
const STATUSES = ["All", "Active", "Paused", "Past", "Negotiating"] as const;

type PlatformFilter = (typeof PLATFORMS)[number];
type StatusFilter = (typeof STATUSES)[number];

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
      style={
        active
          ? { background: "#6366f1", color: "#fff" }
          : { background: "var(--bg-surface)", color: "var(--text-secondary)" }
      }
    >
      {label}
    </button>
  );
}

export function CreatorsClient({ allMetrics }: { allMetrics: CreatorMetrics[] }) {
  const { money, count } = useCurrency();

  const rows: CreatorRow[] = creators.map((c) => {
    const m = allMetrics.find((x) => x.creatorId === c.id)!;
    return {
      ...c,
      totalSpend: m.totalSpend,
      totalViews: m.totalViews,
      totalInstalls: m.totalInstalls,
      cpi: m.cpi,
      clickToInstallRate: m.clickToInstallRate,
      roas: m.roas,
      efficiencyScore: m.efficiencyScore,
      videoCount: m.videoCount,
    };
  });

  const topCreatorEntries = rows.map((r) => ({
    id: r.id,
    name: r.name,
    platform: r.platform,
    impressions: r.totalViews,
    clicks: allMetrics.find((m) => m.creatorId === r.id)?.totalClicks ?? 0,
    installs: r.totalInstalls,
  }));

  const agencies = useMemo(() => {
    const unique = Array.from(new Set(rows.map((r) => r.agency).filter(Boolean)));
    return ["All", ...unique.sort()];
  }, [rows]);

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<PlatformFilter>("All");
  const [agency, setAgency] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("All");

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.handle.toLowerCase().includes(q)) return false;
      if (platform !== "All" && r.platform !== platform) return false;
      if (agency !== "All" && r.agency !== agency) return false;
      if (status !== "All" && r.status !== status) return false;
      return true;
    });
  }, [rows, search, platform, agency, status]);

  function exportCSV() {
    const headers = [
      "Name", "Handle", "Platform", "Tier", "Agency", "Followers",
      "Spend", "Installs", "CPI", "Click→Install%", "ROAS", "Score", "Status",
    ];
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csvRows = [
      headers.join(","),
      ...filteredRows.map((r) =>
        [
          escape(r.name),
          escape(r.handle),
          escape(r.platform),
          escape(r.tier),
          escape(r.agency ?? ""),
          r.followers,
          r.totalSpend ? r.totalSpend.toFixed(2) : "",
          r.totalInstalls || "",
          r.cpi ? r.cpi.toFixed(2) : "",
          r.clickToInstallRate ? r.clickToInstallRate.toFixed(1) : "",
          r.roas ? r.roas.toFixed(2) : "",
          r.efficiencyScore,
          escape(r.status),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creators.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns: Column<CreatorRow>[] = [
    {
      key: "name", label: "Creator", sortable: true,
      getValue: (r) => r.name,
      render: (r) => (
        <div>
          <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{r.name}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.handle}</p>
        </div>
      ),
    },
    {
      key: "platform", label: "Platform", sortable: true,
      getValue: (r) => r.platform,
      render: (r) => <Badge label={r.platform} className={platformBadge[r.platform]} />,
    },
    {
      key: "tier", label: "Tier", sortable: true,
      getValue: (r) => r.tier,
      render: (r) => <Badge label={r.tier} className={tierBadge[r.tier]} />,
    },
    {
      key: "agency", label: "Agency", sortable: true,
      getValue: (r) => r.agency,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.agency}</span>,
    },
    {
      key: "followers", label: "Followers", sortable: true,
      getValue: (r) => r.followers,
      render: (r) => <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{count(r.followers)}</span>,
    },
    {
      key: "totalSpend", label: "Spend", sortable: true,
      getValue: (r) => r.totalSpend,
      render: (r) => <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r.totalSpend ? money(r.totalSpend) : "—"}</span>,
    },
    {
      key: "totalInstalls", label: "Installs", sortable: true,
      getValue: (r) => r.totalInstalls,
      render: (r) => <span className="text-sm font-semibold text-indigo-500">{r.totalInstalls ? count(r.totalInstalls) : "—"}</span>,
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
      key: "clickToInstallRate", label: "Click→Install", sortable: true,
      getValue: (r) => r.clickToInstallRate,
      render: (r) => r.clickToInstallRate ? (
        <span className={`text-sm font-medium ${r.clickToInstallRate >= 5 ? "text-emerald-500" : r.clickToInstallRate >= 2 ? "text-amber-500" : "text-red-500"}`}>
          {r.clickToInstallRate.toFixed(1)}%
        </span>
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
      key: "efficiencyScore", label: "Score", sortable: true,
      getValue: (r) => r.efficiencyScore,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface)" }}>
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${r.efficiencyScore}%` }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{r.efficiencyScore}</span>
        </div>
      ),
    },
    {
      key: "dubLinkSlug", label: "Dub Link", sortable: false,
      getValue: (r) => r.dubLinkSlug ?? "",
      render: (r) => r.dubLinkSlug ? (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}>
          {r.dubLinkSlug}
        </span>
      ) : <Link2 className="w-3 h-3 opacity-20" style={{ color: "var(--text-muted)" }} />,
    },
    {
      key: "status", label: "Status", sortable: true,
      getValue: (r) => r.status,
      render: (r) => <Badge label={r.status} className={statusBadge[r.status]} />,
    },
    {
      key: "link", label: "",
      render: (r) => r.sheetUrl ? (
        <a href={r.sheetUrl} target="_blank" rel="noreferrer" aria-label="Open sheet" style={{ color: "var(--text-muted)" }} className="hover:text-indigo-500 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : null,
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Creators</h1>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}
            >
              {filteredRows.length === rows.length
                ? `${rows.length} creators`
                : `${filteredRows.length} of ${rows.length}`}
            </span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators…"
            className="text-sm px-3 py-1.5 rounded-lg border outline-none transition-colors"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              width: 200,
            }}
          />
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-indigo-50"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Filter pills */}
      <div className="mb-5 flex flex-wrap items-center gap-4">
        {/* Platform */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Platform:</span>
          <div className="flex gap-1">
            {PLATFORMS.map((p) => (
              <FilterPill key={p} label={p} active={platform === p} onClick={() => setPlatform(p)} />
            ))}
          </div>
        </div>

        {/* Agency */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Agency:</span>
          <div className="flex flex-wrap gap-1">
            {agencies.map((a) => (
              <FilterPill key={a} label={a} active={agency === a} onClick={() => setAgency(a)} />
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Status:</span>
          <div className="flex gap-1">
            {STATUSES.map((s) => (
              <FilterPill key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <TopCreatorsWidget creators={topCreatorEntries} />
      </div>

      <SortableTable columns={columns} data={filteredRows} rowKey={(r) => r.id} emptyMessage="No creators found." />
    </div>
  );
}
