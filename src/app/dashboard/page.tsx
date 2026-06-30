import React from "react";
import { videos, performances, costs, installs, creators, getAllCreatorMetrics } from "@/lib/mock-data";
import { getDubStats } from "@/lib/dub-server";
import { OverviewClient } from "@/components/OverviewClient";
import type { OverviewData, MonthRow } from "@/components/OverviewClient";
import { isDbConnected, listSyncRuns, getInferredAttributionForGroup } from "@/lib/storage";
import { ATTRIBUTION_GROUPS } from "@/lib/attribution";
import { LiveSyncStatus } from "@/components/LiveSyncStatus";
import { SharedAttributionInferenceCard } from "@/components/SharedAttributionInferenceCard";
import type { SyncRun, SyncSource } from "@/types";

const USD_INR = 84;
const PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "Twitter"] as const;

/** Use the `impressions` field when available (e.g. YouTube thumbnail impressions),
 *  otherwise fall back to views. */
const imp = (p: { views: number; impressions?: number }) => p.impressions ?? p.views;

export default async function DashboardPage() {
  const dub = await getDubStats();

  // ── Totals ──────────────────────────────────────────────────
  const totalImp      = performances.reduce((s, p) => s + imp(p), 0);
  const totalClk      = dub.totalClicks > 0
    ? dub.totalClicks
    : performances.reduce((s, p) => s + p.clickThroughs, 0);
  // Sum per-video: Dub leads when slug exists, mock installs otherwise
  const totalInst = videos.reduce((s, v) => {
    const dubLeads = dub.byVideo[v.id]?.leads;
    return s + (dubLeads !== undefined ? dubLeads : (installs.find((i) => i.videoId === v.id)?.installs ?? 0));
  }, 0);
  const totalSpendINR = costs.reduce((s, c) => s + c.netCost, 0);
  const totalSpendUSD = totalSpendINR / USD_INR;
  const totalCreators = creators.length;
  const liveVideos    = videos.filter((v) => v.status === "Live").length;

  // Per-unit USD rates (computed correctly from USD spend)
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

  // ── Monthly buckets (all platforms) ─────────────────────────
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
      b.spendINR += cost?.netCost        ?? 0;
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }

  const months = buildMonthRows();

  const platformMonths: Record<string, MonthRow[]> = {};
  for (const p of PLATFORMS) {
    const ids = new Set(videos.filter((v) => v.platform === p).map((v) => v.id));
    platformMonths[p] = buildMonthRows(ids);
  }

  // ── Top creators ─────────────────────────────────────────
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

  const data: OverviewData = {
    totalImp,
    totalClk,
    totalInst,
    totalSpendINR,
    totalCreators,
    liveVideos,
    cpmUSD,
    cpcUSD,
    cpiUSD,
    ctrPct,
    c2iPct,
    dubPartial: dub.partial,
    platformStats,
    months,
    platformMonths,
    topCreators,
  };

  // ── Live sync + inferred attribution ────────────────────────
  const dbConnected = await isDbConnected();
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
        <LiveSyncStatus lastSyncs={lastSyncs} dbConnected={dbConnected} />
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
