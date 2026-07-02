import React from "react";
import { videos, performances, costs, installs, creators, getAllCreatorMetrics } from "@/lib/mock-data";
import { getDubStats } from "@/lib/dub-server";
import { OverviewClient } from "@/components/OverviewClient";
import type { OverviewData, MonthRow, MonthCPI } from "@/components/OverviewClient";
import { getStorageStatus, listSyncRuns, getInferredAttributionForGroup, getLatestSyncRun } from "@/lib/storage";
import { ATTRIBUTION_GROUPS } from "@/lib/attribution";
import { LiveSyncStatus } from "@/components/LiveSyncStatus";
import { SharedAttributionInferenceCard } from "@/components/SharedAttributionInferenceCard";
import { HIGH_PRIORITY_COUNT } from "@/lib/action-items";
import { getAllDataIssues } from "@/lib/data-quality";
import { buildDashboardIntelligence } from "@/lib/insights";
import type { SyncRun, SyncSource } from "@/types";

const USD_INR = 84;
const PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "Twitter"] as const;

const imp = (p: { views: number; impressions?: number }) => p.impressions ?? p.views;

export default async function DashboardPage() {
  const dub = await getDubStats();
  const intelligence = buildDashboardIntelligence(dub.byVideo);

  // ── Totals ──────────────────────────────────────────────────
  const totalImp      = performances.reduce((s, p) => s + imp(p), 0);
  const totalClk      = dub.totalClicks > 0
    ? dub.totalClicks
    : performances.reduce((s, p) => s + p.clickThroughs, 0);
  const totalInst = videos.reduce((s, v) => {
    const dubLeads = dub.byVideo[v.id]?.leads;
    return s + (dubLeads !== undefined ? dubLeads : (installs.find((i) => i.videoId === v.id)?.installs ?? 0));
  }, 0);
  const totalSpendINR = costs.reduce((s, c) => s + c.netCost, 0);
  const totalSpendUSD = totalSpendINR / USD_INR;
  const totalCreators = creators.length;
  const liveVideos    = videos.filter((v) => v.status === "Live").length;

  const cpmUSD = totalImp  > 0 ? (totalSpendUSD / totalImp) * 1000 : 0;
  const cpcUSD = totalClk  > 0 ? totalSpendUSD / totalClk           : 0;
  const cpiUSD = totalInst > 0 ? totalSpendUSD / totalInst          : 0;
  const ctrPct = totalImp  > 0 ? (totalClk / totalImp) * 100        : 0;
  const c2iPct = totalClk  > 0 ? (totalInst / totalClk) * 100       : 0;

  // ── Platform stats ───────────────────────────────────────────
  const platformStats = PLATFORMS.map((platform) => {
    const pvids = videos.filter((v) => v.platform === platform).map((v) => v.id);
    const platImp = performances.filter((p) => pvids.includes(p.videoId)).reduce((s, p) => s + imp(p), 0);
    const clk   = performances.filter((p) => pvids.includes(p.videoId)).reduce((s, p) => s + (dub.byVideo[p.videoId]?.clicks ?? p.clickThroughs), 0);
    const inst  = pvids.reduce((s, vid) => {
      const dubLeads = dub.byVideo[vid]?.leads;
      return s + (dubLeads !== undefined ? dubLeads : (installs.find((i) => i.videoId === vid)?.installs ?? 0));
    }, 0);
    const spendINR = costs.filter((c) => pvids.includes(c.videoId)).reduce((s, c) => s + c.netCost, 0);
    return { platform, imp: platImp, clk, inst, spendINR };
  });

  // ── Monthly buckets (for MoM table) ─────────────────────────
  function buildMonthRows(filterVideoIds?: Set<string>): MonthRow[] {
    const map = new Map<string, MonthRow>();
    for (const video of videos) {
      if (filterVideoIds && !filterVideoIds.has(video.id)) continue;
      const ym = video.goLiveDate?.slice(0, 7);
      if (!ym) continue;
      if (!map.has(ym)) {
        map.set(ym, {
          ym,
          label: new Date(ym + "-15").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          imp: 0, clk: 0, inst: 0, spendINR: 0,
        });
      }
      const b = map.get(ym)!;
      const perf = performances.find((p) => p.videoId === video.id);
      const cost = costs.find((c) => c.videoId === video.id);
      const inst = installs.find((i) => i.videoId === video.id);
      b.imp      += perf ? imp(perf) : 0;
      b.clk      += perf ? (dub.byVideo[video.id]?.clicks ?? perf.clickThroughs) : 0;
      const dubLeads = dub.byVideo[video.id]?.leads;
      b.inst     += dubLeads !== undefined ? dubLeads : (inst?.installs ?? 0);
      b.spendINR += cost?.netCost ?? 0;
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }

  const months = buildMonthRows();

  const platformMonths: Record<string, MonthRow[]> = {};
  for (const p of PLATFORMS) {
    const ids = new Set(videos.filter((v) => v.platform === p).map((v) => v.id));
    platformMonths[p] = buildMonthRows(ids);
  }

  // ── CPI by go-live month (campaign batch efficiency trend) ───
  // Groups videos by the month they went live, computes CPI for that batch.
  // Only months with both spend AND installs are meaningful — skip ₹0 cohorts.
  const cpiMap = new Map<string, { spendINR: number; installs: number }>();
  for (const video of videos) {
    const ym = video.goLiveDate?.slice(0, 7);
    if (!ym) continue;
    const cost = costs.find((c) => c.videoId === video.id);
    if (!cost || cost.netCost === 0) continue;
    const dubLeads = dub.byVideo[video.id]?.leads;
    const videoInst = dubLeads !== undefined
      ? dubLeads
      : (installs.find((i) => i.videoId === video.id)?.installs ?? 0);
    if (!cpiMap.has(ym)) cpiMap.set(ym, { spendINR: 0, installs: 0 });
    const b = cpiMap.get(ym)!;
    b.spendINR += cost.netCost;
    b.installs += videoInst;
  }
  const monthCPIs: MonthCPI[] = [...cpiMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, b]) => ({
      ym,
      label: new Date(ym + "-15").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      spendINR: b.spendINR,
      installs: b.installs,
      // INR CPI — divide by 84 at display time for USD
      cpiINR: b.installs > 0 ? b.spendINR / b.installs : null,
    }));

  // ── Top creators ─────────────────────────────────────────────
  const allMetrics = getAllCreatorMetrics(dub.byVideo);
  const topCreators = creators.map((c) => {
    const m = allMetrics.find((x) => x.creatorId === c.id)!;
    return {
      id: c.id,
      name: c.name,
      platform: c.platform,
      impressions: m?.totalViews ?? 0,
      clicks: m?.totalClicks ?? 0,
      installs: m?.totalInstalls ?? 0,
    };
  });

  // ── Data freshness ───────────────────────────────────────────
  const [ytRun, dubRun] = await Promise.all([
    getLatestSyncRun("youtube"),
    getLatestSyncRun("dub"),
  ]);

  const openIssues = getAllDataIssues().filter((i) => i.status === "open");
  const attributionIssueCount = openIssues.filter((i) =>
    i.issueType === "shared_attribution" || i.issueType === "dub_missing" || i.issueType === "dub_failed"
  ).length;
  const linkIssueCount = openIssues.filter((i) => i.issueType === "missing_url").length;
  const renewalReadyCount = allMetrics.filter((m) =>
    m.totalSpend > 0 && m.totalInstalls > 0 && m.cpi > 0 && m.cpi <= 300
  ).length;
  const syncsToRefresh = [ytRun, dubRun].filter((run) => {
    if (!run?.completedAt) return true;
    return run.status === "failed" || run.status === "partial";
  }).length;

  const data: OverviewData = {
    totalImp, totalClk, totalInst, totalSpendINR,
    totalCreators, liveVideos,
    cpmUSD, cpcUSD, cpiUSD, ctrPct, c2iPct,
    dubPartial: dub.partial,
    platformStats, months, platformMonths, topCreators,
    monthCPIs,
    ytLastSync: ytRun?.completedAt ?? null,
    dubLastSync: dubRun?.completedAt ?? null,
    highPriorityActionCount: HIGH_PRIORITY_COUNT,
    operatorInsights: intelligence.insights,
    coverage: intelligence.coverage,
    todayItems: [
      {
        label: "Fix attribution",
        value: attributionIssueCount,
        detail: "shared or missing Dub links",
        href: "/dashboard/data-health",
        tone: attributionIssueCount > 0 ? "warn" : "good",
      },
      {
        label: "Review renewals",
        value: renewalReadyCount,
        detail: "creators under target CPI",
        href: "/dashboard/decision",
        tone: renewalReadyCount > 0 ? "good" : "neutral",
      },
      {
        label: "Verify live links",
        value: linkIssueCount,
        detail: "URLs or insights pending",
        href: "/dashboard/videos",
        tone: linkIssueCount > 0 ? "warn" : "good",
      },
      {
        label: "Refresh data",
        value: syncsToRefresh,
        detail: "sources older than 24h",
        href: "/dashboard/data-health",
        tone: syncsToRefresh > 0 ? "warn" : "good",
      },
    ],
  };

  // ── Live sync + inferred attribution ────────────────────────
  const storage = await getStorageStatus();
  const recentRuns = await listSyncRuns(50);
  const lastSyncs: Record<string, SyncRun | null> = {};
  for (const source of ["all", "sheets", "youtube", "dub", "attribution"] as SyncSource[]) {
    lastSyncs[source] = recentRuns.find((r) => r.source === source) ?? null;
  }

  const inferenceCards = await Promise.all(
    ATTRIBUTION_GROUPS.map(async (group) => {
      const inferred = await getInferredAttributionForGroup(group.id);
      const creatorTotalLeads = group.creatorIds
        .flatMap((cid) => videos.filter((v) => v.creatorId === cid))
        .reduce<number | null>((acc, v) => {
          const leads = dub.byVideo[v.id]?.leads;
          if (leads == null) return acc;
          return (acc ?? 0) + leads;
        }, null);
      const creatorTotalClicks = group.creatorIds
        .flatMap((cid) => videos.filter((v) => v.creatorId === cid))
        .reduce<number | null>((acc, v) => {
          const clicks = dub.byVideo[v.id]?.clicks;
          if (clicks == null) return acc;
          return (acc ?? 0) + clicks;
        }, null);
      const lastComputedAt = inferred[0]?.computedAt ?? null;
      return { group, inferred, creatorTotalLeads, creatorTotalClicks, lastComputedAt };
    })
  );

  return (
    <div className="space-y-6">
      <div className="p-6 pb-0">
        <LiveSyncStatus
          lastSyncs={lastSyncs}
          storage={{
            persistent: storage.persistent,
            label: storage.label,
            detail: storage.detail,
          }}
        />
      </div>

      <OverviewClient data={data} />

      <div className="p-6 pt-0 space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Shared-attribution creators (estimated splits)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {inferenceCards.map((c) => (
            <SharedAttributionInferenceCard
              key={c.group.id}
              group={c.group}
              inferredAttributions={c.inferred}
              creatorTotalLeads={c.creatorTotalLeads}
              creatorTotalClicks={c.creatorTotalClicks}
              lastComputedAt={c.lastComputedAt}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
