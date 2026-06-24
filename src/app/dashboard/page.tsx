import React from "react";
import { videos, performances, costs, installs, creators } from "@/lib/mock-data";
import { getDubStats } from "@/lib/dub-server";
import { OverviewClient } from "@/components/OverviewClient";
import type { OverviewData, MonthRow } from "@/components/OverviewClient";

const USD_INR = 84;
const PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "Twitter"] as const;

export default async function DashboardPage() {
  const dub = await getDubStats();

  // ── Totals ──────────────────────────────────────────────────
  const totalImp      = performances.reduce((s, p) => s + p.views, 0);
  const totalClk      = dub.totalClicks > 0
    ? dub.totalClicks
    : performances.reduce((s, p) => s + p.clickThroughs, 0);
  const totalInst     = installs.reduce((s, i) => s + i.installs, 0);
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
    const imp   = performances.filter((p) => pvids.includes(p.videoId)).reduce((s, p) => s + p.views, 0);
    const clk   = performances.filter((p) => pvids.includes(p.videoId)).reduce((s, p) => s + p.clickThroughs, 0);
    const inst  = installs.filter((i) => pvids.includes(i.videoId)).reduce((s, i) => s + i.installs, 0);
    const spendINR = costs.filter((c) => pvids.includes(c.videoId)).reduce((s, c) => s + c.netCost, 0);
    return { platform, imp, clk, inst, spendINR };
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
      b.imp      += perf?.views         ?? 0;
      b.clk      += perf?.clickThroughs ?? 0;
      b.inst     += inst?.installs       ?? 0;
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
  };

  return <OverviewClient data={data} />;
}
