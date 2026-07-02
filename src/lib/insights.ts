import { ATTRIBUTION_GROUPS } from "@/lib/attribution";
import { getAllDataIssues } from "@/lib/data-quality";
import { DUB_LINK_MAPPINGS, type DubStats } from "@/lib/dub-server";
import { costs, installs, performances, videos } from "@/lib/mock-data";

export type InsightTone = "good" | "warn" | "bad" | "neutral";

export interface CoverageMetric {
  id: string;
  label: string;
  known: number;
  total: number;
  pct: number;
  detail: string;
  tone: InsightTone;
}

export interface OperatorInsight {
  id: string;
  title: string;
  body: string;
  metric: string;
  tone: InsightTone;
  href: string;
  source: "mock_data" | "dub_api" | "storage" | "data_quality";
}

export interface PlatformInsight {
  platform: string;
  videos: number;
  spendINR: number;
  views: number;
  clicks: number;
  installs: number;
  cpiINR: number | null;
  cpvINR: number | null;
}

export interface ViewLeader {
  videoId: string;
  title: string;
  creatorName: string;
  platform: string;
  views: number;
  sharePct: number;
  cpvINR: number | null;
  clickRatePct: number | null;
  installRatePct: number | null;
}

export interface DashboardIntelligence {
  coverage: CoverageMetric[];
  insights: OperatorInsight[];
  platforms: PlatformInsight[];
  viewLeaders: ViewLeader[];
}

function pct(known: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((known / total) * 100);
}

function toneForPct(value: number): InsightTone {
  if (value >= 80) return "good";
  if (value >= 55) return "warn";
  return "bad";
}

function moneyCompactINR(value: number): string {
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(0)}K`;
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function coverageMetric(id: string, label: string, known: number, total: number, detail: string): CoverageMetric {
  const value = pct(known, total);
  return { id, label, known, total, pct: value, detail, tone: toneForPct(value) };
}

function videoHasExactMapping(videoId: string): boolean {
  return DUB_LINK_MAPPINGS.some((mapping) => mapping.videoIds.includes(videoId) && mapping.exactVideoAttribution);
}

function videoHasAnyMapping(videoId: string): boolean {
  return DUB_LINK_MAPPINGS.some((mapping) => mapping.videoIds.includes(videoId));
}

export function buildDashboardIntelligence(
  dubByVideo: Record<string, Pick<DubStats, "clicks" | "leads">> = {}
): DashboardIntelligence {
  const liveVideos = videos.filter((video) => video.status === "Live");
  const liveIds = new Set(liveVideos.map((video) => video.id));

  const perfByVideo = new Map(performances.map((perf) => [perf.videoId, perf]));
  const costByVideo = new Map(costs.map((cost) => [cost.videoId, cost]));
  const installByVideo = new Map(installs.map((install) => [install.videoId, install]));

  const viewsKnown = liveVideos.filter((video) => (perfByVideo.get(video.id)?.views ?? 0) > 0).length;
  const clicksKnown = liveVideos.filter((video) => {
    const dubClicks = dubByVideo[video.id]?.clicks;
    return (dubClicks ?? perfByVideo.get(video.id)?.clickThroughs ?? 0) > 0;
  }).length;
  const installsKnown = liveVideos.filter((video) => {
    const dubLeads = dubByVideo[video.id]?.leads;
    return (dubLeads ?? installByVideo.get(video.id)?.installs ?? 0) > 0;
  }).length;
  const costKnown = liveVideos.filter((video) => (costByVideo.get(video.id)?.netCost ?? 0) > 0).length;
  const mappedDub = liveVideos.filter((video) => videoHasAnyMapping(video.id)).length;
  const exactDub = liveVideos.filter((video) => videoHasExactMapping(video.id)).length;
  const totalViews = liveVideos.reduce((sum, video) => sum + (perfByVideo.get(video.id)?.views ?? 0), 0);

  const coverage = [
    coverageMetric("views", "Views coverage", viewsKnown, liveVideos.length, "Live videos with non-zero view data."),
    coverageMetric("clicks", "Click coverage", clicksKnown, liveVideos.length, "Live videos with Dub or recorded click data."),
    coverageMetric("installs", "Install coverage", installsKnown, liveVideos.length, "Live videos with Dub leads or manual installs."),
    coverageMetric("costs", "Cost coverage", costKnown, liveVideos.length, "Live videos with net cost records."),
    coverageMetric("dub_mapping", "Dub mapping", mappedDub, liveVideos.length, "Live videos mapped to a known Dub slug/group."),
    coverageMetric("exact_attribution", "Exact video CPI", exactDub, liveVideos.length, "Live videos with unique video-level attribution."),
  ];

  const platforms: PlatformInsight[] = ["Instagram", "YouTube", "LinkedIn", "Twitter"].map((platform) => {
    const platformVideos = liveVideos.filter((video) => video.platform === platform);
    const ids = new Set(platformVideos.map((video) => video.id));
    const spendINR = costs.filter((cost) => ids.has(cost.videoId)).reduce((sum, cost) => sum + cost.netCost, 0);
    const views = performances.filter((perf) => ids.has(perf.videoId)).reduce((sum, perf) => sum + (perf.impressions ?? perf.views), 0);
    const clicks = platformVideos.reduce((sum, video) => sum + (dubByVideo[video.id]?.clicks ?? perfByVideo.get(video.id)?.clickThroughs ?? 0), 0);
    const platformInstalls = platformVideos.reduce((sum, video) => sum + (dubByVideo[video.id]?.leads ?? installByVideo.get(video.id)?.installs ?? 0), 0);
    return {
      platform,
      videos: platformVideos.length,
      spendINR,
      views,
      clicks,
      installs: platformInstalls,
      cpiINR: spendINR > 0 && platformInstalls > 0 ? spendINR / platformInstalls : null,
      cpvINR: spendINR > 0 && views > 0 ? spendINR / views : null,
    };
  }).filter((row) => row.videos > 0);

  const openIssues = getAllDataIssues().filter((issue) => issue.status === "open");
  const criticalIssues = openIssues.filter((issue) => issue.severity === "critical").length;
  const sharedVideoIds = new Set(ATTRIBUTION_GROUPS.flatMap((group) => group.videoIds).filter((id) => liveIds.has(id)));
  const dubApiMeasured = Object.keys(dubByVideo).filter((id) => liveIds.has(id)).length;
  const highSpendNoInstalls = liveVideos
    .map((video) => {
      const spendINR = costByVideo.get(video.id)?.netCost ?? 0;
      const videoInstalls = dubByVideo[video.id]?.leads ?? installByVideo.get(video.id)?.installs ?? 0;
      return { video, spendINR, installs: videoInstalls };
    })
    .filter((row) => row.spendINR >= 150000 && row.installs === 0)
    .sort((a, b) => b.spendINR - a.spendINR);

  const bestPlatform = platforms
    .filter((row) => row.cpiINR != null && row.installs >= 5)
    .sort((a, b) => (a.cpiINR ?? Infinity) - (b.cpiINR ?? Infinity))[0];
  const bestViewPlatform = platforms
    .filter((row) => row.cpvINR != null && row.views > 0)
    .sort((a, b) => (a.cpvINR ?? Infinity) - (b.cpvINR ?? Infinity))[0];

  const viewLeaders: ViewLeader[] = liveVideos
    .map((video) => {
      const perf = perfByVideo.get(video.id);
      const viewCount = perf?.views ?? 0;
      const spendINR = costByVideo.get(video.id)?.netCost ?? 0;
      const clicks = dubByVideo[video.id]?.clicks ?? perf?.clickThroughs ?? 0;
      const videoInstalls = dubByVideo[video.id]?.leads ?? installByVideo.get(video.id)?.installs ?? 0;
      return {
        videoId: video.id,
        title: video.title,
        creatorName: video.creatorName,
        platform: video.platform,
        views: viewCount,
        sharePct: totalViews > 0 ? (viewCount / totalViews) * 100 : 0,
        cpvINR: viewCount > 0 && spendINR > 0 ? spendINR / viewCount : null,
        clickRatePct: viewCount > 0 && clicks > 0 ? (clicks / viewCount) * 100 : null,
        installRatePct: viewCount > 0 && videoInstalls > 0 ? (videoInstalls / viewCount) * 100 : null,
      };
    })
    .filter((row) => row.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const insights: OperatorInsight[] = [
    {
      id: "view-coverage",
      title: "View data coverage",
      body: `${viewsKnown} of ${liveVideos.length} live videos have non-zero view data. The dashboard is now using this as the primary operating layer.`,
      metric: `${pct(viewsKnown, liveVideos.length)}% views`,
      tone: toneForPct(pct(viewsKnown, liveVideos.length)),
      href: "/dashboard/data-health",
      source: "mock_data",
    },
    {
      id: "best-view-platform",
      title: "Most efficient views",
      body: bestViewPlatform
        ? `${bestViewPlatform.platform} currently has the lowest cost per view at ${moneyCompactINR(bestViewPlatform.cpvINR ?? 0)} across ${bestViewPlatform.views.toLocaleString("en-IN")} views.`
        : "No platform has enough spend and view data to call a view-efficiency winner yet.",
      metric: bestViewPlatform ? bestViewPlatform.platform : "Pending",
      tone: bestViewPlatform ? "good" : "neutral",
      href: "/dashboard/performance",
      source: "mock_data",
    },
    {
      id: "exact-attribution",
      title: "Video-level precision",
      body: `${exactDub} of ${liveVideos.length} live videos have unique video-level Dub attribution. Shared groups still need creator-level interpretation.`,
      metric: `${pct(exactDub, liveVideos.length)}% exact`,
      tone: toneForPct(pct(exactDub, liveVideos.length)),
      href: "/dashboard/data-health",
      source: "data_quality",
    },
    {
      id: "dub-api-coverage",
      title: "Live Dub API coverage",
      body: dubApiMeasured > 0
        ? `${dubApiMeasured} live videos returned live Dub stats in this render. Manual records fill the remaining gaps.`
        : "Dub API is unavailable or not configured for this render, so clicks/leads are falling back to recorded data.",
      metric: dubApiMeasured > 0 ? `${dubApiMeasured} videos` : "Fallback",
      tone: dubApiMeasured > 0 ? "good" : "warn",
      href: "/dashboard/data-health",
      source: "dub_api",
    },
    {
      id: "issue-load",
      title: "Data health load",
      body: criticalIssues > 0
        ? `${criticalIssues} critical issues remain open. Treat decision outputs as blocked until resolved.`
        : `${openIssues.length} non-critical open issues remain; no critical data-health blocker is currently open.`,
      metric: criticalIssues > 0 ? `${criticalIssues} critical` : `${openIssues.length} open`,
      tone: criticalIssues > 0 ? "bad" : openIssues.length > 8 ? "warn" : "good",
      href: "/dashboard/data-health",
      source: "data_quality",
    },
    {
      id: "spend-without-installs",
      title: "Spend without installs",
      body: highSpendNoInstalls.length > 0
        ? `${highSpendNoInstalls[0].video.creatorName} has ${moneyCompactINR(highSpendNoInstalls[0].spendINR)} spend with no attributed installs.`
        : "No high-spend live video is currently showing zero attributed installs.",
      metric: highSpendNoInstalls.length > 0 ? `${highSpendNoInstalls.length} videos` : "Clear",
      tone: highSpendNoInstalls.length > 0 ? "warn" : "good",
      href: "/dashboard/costs",
      source: "mock_data",
    },
    {
      id: "best-platform",
      title: "Best current channel",
      body: bestPlatform
        ? `${bestPlatform.platform} is the most efficient channel with ${moneyCompactINR(bestPlatform.cpiINR ?? 0)} CPI on ${bestPlatform.installs.toLocaleString("en-IN")} installs.`
        : "No platform has enough installs and spend to call a clear CPI winner yet.",
      metric: bestPlatform ? bestPlatform.platform : "Pending",
      tone: bestPlatform ? "good" : "neutral",
      href: "/dashboard/performance",
      source: "mock_data",
    },
    {
      id: "shared-attribution",
      title: "Shared attribution footprint",
      body: `${sharedVideoIds.size} live videos sit inside shared attribution groups. Compare them as creator packages, not isolated video CPI.`,
      metric: `${sharedVideoIds.size} videos`,
      tone: sharedVideoIds.size > 0 ? "warn" : "good",
      href: "/dashboard/decision",
      source: "data_quality",
    },
  ];

  return { coverage, insights, platforms, viewLeaders };
}
