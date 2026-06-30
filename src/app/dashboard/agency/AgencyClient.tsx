"use client";

import { useState, useMemo } from "react";
import { costs, creators, videos, performances, installs, campaigns } from "@/lib/mock-data";
import { useCurrency } from "@/lib/currency-context";

export interface DubByVideo {
  [videoId: string]: { clicks: number; leads: number };
}

// Derived from actual data — no hardcoding that silently hides agencies
const AGENCIES = Array.from(
  new Set(
    creators
      .map((c) => c.agency)
      .filter((a): a is string => Boolean(a) && a.trim().length > 0)
  )
).sort() as string[];
type Agency = string;

const AGENCY_COLOR_PALETTE = [
  "#6366f1", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
  "#06b6d4", "#a855f7", "#64748b", "#78716c", "#d946ef",
];

function agencyColor(agency: string): string {
  const idx = AGENCIES.indexOf(agency);
  return AGENCY_COLOR_PALETTE[idx % AGENCY_COLOR_PALETTE.length] ?? "#6366f1";
}

const AGENCY_COLORS: Record<string, string> = Object.fromEntries(
  AGENCIES.map((a) => [a, agencyColor(a)])
);

type SortKey = "name" | "platform" | "followers" | "spend" | "impressions" | "clicks" | "installs" | "cpi";
type SortDir = "asc" | "desc";

interface CreatorRow {
  id: string;
  name: string;
  platform: string;
  followers: number;
  spend: number;
  impressions: number;
  clicks: number;
  installs: number;
  cpi: number;
}

interface CampaignSummary {
  id: string;
  name: string;
  spend: number;
  impressions: number;
  clicks: number;
  installs: number;
}

interface AgencyData {
  agency: Agency;
  spend: number;
  impressions: number;
  clicks: number;
  installs: number;
  cpm: number;
  cpc: number;
  cpi: number;
  creatorCount: number;
  videosLive: number;
  campaigns: CampaignSummary[];
  creators: CreatorRow[];
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, fontSize: 10 }}>
      {active ? (dir === "asc" ? "▲" : "▼") : "▲▼"}
    </span>
  );
}

function CreatorTable({ rows }: { rows: CreatorRow[] }) {
  const { money, count } = useCurrency();
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggle(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const th: React.CSSProperties = {
    padding: "8px 12px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    borderBottom: "1px solid var(--border)",
  };

  const td: React.CSSProperties = {
    padding: "8px 12px",
    fontSize: 13,
    borderBottom: "1px solid var(--border)",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
  };

  const cols: { key: SortKey; label: string }[] = [
    { key: "name", label: "Creator" },
    { key: "platform", label: "Platform" },
    { key: "followers", label: "Followers" },
    { key: "spend", label: "Spend" },
    { key: "impressions", label: "Impressions" },
    { key: "clicks", label: "Clicks" },
    { key: "installs", label: "Installs" },
    { key: "cpi", label: "CPI" },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key} style={th} onClick={() => toggle(c.key)}>
                {c.label}
                <SortIcon active={sortKey === c.key} dir={sortDir} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id} style={{ transition: "background 0.1s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ ...td, color: "var(--text-primary)", fontWeight: 500 }}>{r.name}</td>
              <td style={td}>{r.platform}</td>
              <td style={td}>{r.followers ? count(r.followers) : "—"}</td>
              <td style={{ ...td, color: "var(--text-primary)", fontWeight: 600 }}>{r.spend ? money(r.spend) : "—"}</td>
              <td style={td}>{r.impressions ? count(r.impressions) : "—"}</td>
              <td style={td}>{r.clicks ? count(r.clicks) : "—"}</td>
              <td style={{ ...td, color: "#6366f1", fontWeight: 600 }}>{r.installs ? count(r.installs) : "—"}</td>
              <td style={td}>{r.cpi ? money(r.cpi) : "—"}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={8} style={{ ...td, textAlign: "center", color: "var(--text-muted)", padding: 24 }}>
                No creators
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      borderRadius: 8,
      padding: "10px 14px",
      border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

function AgencySection({ data }: { data: AgencyData }) {
  const { money, count } = useCurrency();
  const [open, setOpen] = useState(true);
  const color = AGENCY_COLORS[data.agency];

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: 12,
      border: "1px solid var(--border)",
      overflow: "hidden",
      marginBottom: 24,
    }}>
      <div style={{ height: 4, background: color }} />

      <div
        style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color,
          }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{data.agency}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>
            {data.creatorCount} creators · {data.videosLive} videos live
          </span>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
            <MetricTile label="Total Spend" value={data.spend ? money(data.spend) : "—"} />
            <MetricTile label="Impressions" value={data.impressions ? count(data.impressions) : "—"} />
            <MetricTile label="Clicks" value={data.clicks ? count(data.clicks) : "—"} />
            <MetricTile label="Installs" value={data.installs ? count(data.installs) : "—"} />
            <MetricTile label="CPM" value={data.cpm ? money(data.cpm) : "—"} />
            <MetricTile label="CPC" value={data.cpc ? money(data.cpc) : "—"} />
            <MetricTile label="CPI" value={data.cpi ? money(data.cpi) : "—"} />
            <MetricTile label="Creators" value={String(data.creatorCount)} />
            <MetricTile label="Videos Live" value={String(data.videosLive)} />
          </div>

          {data.campaigns.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>
                Campaigns
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {data.campaigns.map((camp) => (
                  <div key={camp.id} style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    minWidth: 180,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{camp.name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                      {[
                        ["Spend", camp.spend ? money(camp.spend) : "—"],
                        ["Impr.", camp.impressions ? count(camp.impressions) : "—"],
                        ["Clicks", camp.clicks ? count(camp.clicks) : "—"],
                        ["Installs", camp.installs ? count(camp.installs) : "—"],
                      ].map(([l, v]) => (
                        <div key={l} style={{ fontSize: 11 }}>
                          <span style={{ color: "var(--text-muted)" }}>{l}: </span>
                          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
            Creator Roster
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <CreatorTable rows={data.creators} />
          </div>
        </div>
      )}
    </div>
  );
}

export function AgencyClient({ dubByVideo = {} }: { dubByVideo?: DubByVideo }) {
  const agencyData = useMemo((): AgencyData[] => {
    return AGENCIES.map((agency) => {
      const agencyCreators = creators.filter((c) => c.agency === agency);
      const creatorIds = new Set(agencyCreators.map((c) => c.id));

      const agencyVideos = videos.filter((v) => creatorIds.has(v.creatorId));
      const videoIds = new Set(agencyVideos.map((v) => v.id));
      const videosLive = agencyVideos.filter((v) => v.status === "Live").length;

      const agencyCosts = costs.filter((c) => creatorIds.has(c.creatorId));
      const spend = agencyCosts.reduce((s, c) => s + c.netCost, 0);

      let impressions = 0;
      let clicks = 0;
      for (const p of performances) {
        if (videoIds.has(p.videoId)) {
          impressions += (p.impressions ?? p.views) ?? 0;
          clicks += dubByVideo[p.videoId]?.clicks ?? p.clickThroughs ?? 0;
        }
      }

      let totalInstalls = 0;
      for (const v of agencyVideos) {
        const dubLeads = dubByVideo[v.id]?.leads;
        if (dubLeads !== undefined) {
          totalInstalls += dubLeads;
        } else {
          const inst = installs.find((i) => i.videoId === v.id);
          totalInstalls += inst?.installs ?? 0;
        }
      }

      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const cpi = totalInstalls > 0 ? spend / totalInstalls : 0;

      const campaignIds = Array.from(new Set(agencyCosts.map((c) => c.campaignId).filter(Boolean)));
      const campaignSummaries: CampaignSummary[] = campaignIds.map((cid) => {
        const campCosts = agencyCosts.filter((c) => c.campaignId === cid);
        const campSpend = campCosts.reduce((s, c) => s + c.netCost, 0);
        const campVideoIds = new Set(campCosts.map((c) => c.videoId));
        let campImpr = 0, campClicks = 0;
        for (const p of performances) {
          if (campVideoIds.has(p.videoId)) {
            campImpr += (p.impressions ?? p.views) ?? 0;
            campClicks += dubByVideo[p.videoId]?.clicks ?? p.clickThroughs ?? 0;
          }
        }
        let campInstalls = 0;
        for (const vid of campVideoIds) {
          const dubLeads = dubByVideo[vid]?.leads;
          if (dubLeads !== undefined) {
            campInstalls += dubLeads;
          } else {
            campInstalls += installs.find((i) => i.videoId === vid)?.installs ?? 0;
          }
        }
        const campaign = campaigns.find((c) => c.id === cid);
        return {
          id: cid,
          name: campaign?.name ?? cid,
          spend: campSpend,
          impressions: campImpr,
          clicks: campClicks,
          installs: campInstalls,
        };
      });

      const creatorRows: CreatorRow[] = agencyCreators.map((creator) => {
        const cCosts = agencyCosts.filter((c) => c.creatorId === creator.id);
        const cSpend = cCosts.reduce((s, c) => s + c.netCost, 0);
        const cVideoIds = new Set(cCosts.map((c) => c.videoId));
        const cAllVideos = videos.filter((v) => v.creatorId === creator.id);
        let cImpr = 0, cClicks = 0;
        for (const p of performances) {
          if (cVideoIds.has(p.videoId)) {
            cImpr += (p.impressions ?? p.views) ?? 0;
            cClicks += dubByVideo[p.videoId]?.clicks ?? p.clickThroughs ?? 0;
          }
        }
        let cInstalls = 0;
        for (const v of cAllVideos) {
          const dubLeads = dubByVideo[v.id]?.leads;
          if (dubLeads !== undefined) {
            cInstalls += dubLeads;
          } else {
            cInstalls += installs.find((i) => i.videoId === v.id)?.installs ?? 0;
          }
        }
        return {
          id: creator.id,
          name: creator.name,
          platform: creator.platform,
          followers: creator.followers ?? 0,
          spend: cSpend,
          impressions: cImpr,
          clicks: cClicks,
          installs: cInstalls,
          cpi: cInstalls > 0 && cSpend > 0 ? cSpend / cInstalls : 0,
        };
      });

      return {
        agency,
        spend,
        impressions,
        clicks,
        installs: totalInstalls,
        cpm,
        cpc,
        cpi,
        creatorCount: agencyCreators.length,
        videosLive,
        campaigns: campaignSummaries,
        creators: creatorRows,
      };
    });
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Agency Performance
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
          Spend, reach, and install metrics grouped by agency — click a header to sort creator roster
        </p>
      </div>

      {agencyData.map((data) => (
        <AgencySection key={data.agency} data={data} />
      ))}
    </div>
  );
}
