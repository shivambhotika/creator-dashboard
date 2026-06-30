import type { ResolvedMetric, MetricSource, Video, VideoPerformance, InstallRecord, Cost } from "@/types";
import type { DubStats } from "@/lib/dub-server";

export const USD_INR = 84;

export function safeDivide(numerator: number | null | undefined, denominator: number | null | undefined): number | null {
  if (numerator == null || denominator == null || denominator === 0) return null;
  if (!isFinite(numerator) || !isFinite(denominator)) return null;
  return numerator / denominator;
}

export function sumNonNull(values: (number | null | undefined)[]): number {
  return values.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

export function countKnown(values: (number | null | undefined)[]): number {
  return values.filter(v => v != null).length;
}

export function coverage(known: number, total: number): number {
  if (total === 0) return 0;
  return known / total;
}

export function resolveVideoViews(
  video: Video,
  perf: VideoPerformance | undefined
): ResolvedMetric {
  if (video.confirmedDeleted) return { value: 0, source: "platform", confidence: "high", warning: "Content deleted" };
  if (!perf) return { value: null, source: "missing", confidence: "none", warning: "No performance record" };
  if (perf.views === 0 && video.missingInsightReason) {
    return { value: null, source: "missing", confidence: "none", warning: video.missingInsightReason };
  }
  const src: MetricSource = perf.viewSource ?? (video.platform === "YouTube" ? "scrape" : "agency");
  return { value: perf.views, source: src, confidence: perf.views > 0 ? "high" : "low" };
}

export function resolveVideoImpressions(
  video: Video,
  perf: VideoPerformance | undefined
): ResolvedMetric {
  if (!perf) return { value: null, source: "missing", confidence: "none" };
  if (perf.reportedImpressions != null && perf.reportedImpressions > 0) {
    return { value: perf.reportedImpressions, source: perf.impressionSource ?? "platform", confidence: "high" };
  }
  if ((perf.impressions != null && perf.impressions > 0)) {
    return { value: perf.impressions, source: perf.impressionSource ?? "platform", confidence: "high" };
  }
  if (perf.views > 0 && video.platform === "YouTube") {
    const est = Math.round(perf.views / 0.04);
    return { value: est, source: "estimated", confidence: "low", warning: "Estimated from views ÷ 0.04 (assumed 4% YouTube thumbnail CTR)" };
  }
  return { value: null, source: "missing", confidence: "none" };
}

export function resolveVideoClicks(
  video: Video,
  perf: VideoPerformance | undefined,
  dubByVideo: Record<string, DubStats>
): ResolvedMetric {
  const dubEntry = dubByVideo[video.id];
  if (dubEntry !== undefined) {
    return { value: dubEntry.clicks, source: "dub", confidence: "high" };
  }
  if (perf?.clickThroughs && perf.clickThroughs > 0) {
    return { value: perf.clickThroughs, source: "manual", confidence: "medium" };
  }
  return { value: null, source: "missing", confidence: "none", warning: "No Dub slug configured" };
}

export function resolveVideoInstalls(
  video: Video,
  installs: InstallRecord[],
  dubByVideo: Record<string, DubStats>
): ResolvedMetric {
  const dubEntry = dubByVideo[video.id];
  if (dubEntry !== undefined) {
    return { value: dubEntry.leads, source: "dub", confidence: "high" };
  }
  const rec = installs.find(i => i.videoId === video.id);
  if (rec) {
    return { value: rec.installs, source: "manual", confidence: "medium" };
  }
  return { value: null, source: "missing", confidence: "none", warning: "No attribution link" };
}

export function resolveVideoSpend(
  video: Video,
  costs: Cost[]
): ResolvedMetric {
  const rec = costs.find(c => c.videoId === video.id);
  if (!rec) return { value: null, source: "missing", confidence: "none", warning: "No cost record" };
  const conf = rec.costConfidence ?? "actual";
  return {
    value: rec.netCost,
    source: conf === "actual" ? "manual" : "estimated",
    confidence: conf === "actual" ? "high" : conf === "allocated" ? "medium" : "low",
    warning: conf !== "actual" ? `Cost is ${conf}` : undefined,
  };
}

export function calculateCPV(spendINR: number | null, views: number | null): number | null {
  return safeDivide(spendINR, views);
}

export function calculateCPC(spendINR: number | null, clicks: number | null): number | null {
  return safeDivide(spendINR, clicks);
}

export function calculateCPI(spendINR: number | null, installs: number | null): number | null {
  return safeDivide(spendINR, installs);
}

export function calculateTrueCPM(spendINR: number | null, reportedImpressions: number | null): number | null {
  const r = safeDivide(spendINR, reportedImpressions);
  return r != null ? r * 1000 : null;
}

export function calculateEstimatedCPM(spendINR: number | null, views: number | null): number | null {
  if (views == null || spendINR == null || views === 0) return null;
  const estImp = views / 0.04;
  return (spendINR / estImp) * 1000;
}

export function calculateCTR(clicks: number | null, impressionsOrViews: number | null): number | null {
  return safeDivide(clicks, impressionsOrViews);
}

export function calculateClickToInstallRate(installs: number | null, clicks: number | null): number | null {
  return safeDivide(installs, clicks);
}

export function calculateViewToInstallRate(installs: number | null, views: number | null): number | null {
  return safeDivide(installs, views);
}

export function formatMetricValue(
  value: number | null | undefined,
  status?: "deleted" | "scheduled" | "not_shared" | "pending"
): string {
  if (status === "deleted") return "Deleted";
  if (status === "scheduled") return "Scheduled";
  if (status === "not_shared") return "Not shared";
  if (status === "pending") return "Pending";
  if (value == null) return "—";
  return value.toLocaleString("en-IN");
}

export function formatCurrencyINR(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatCurrencyUSD(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNullableNumber(value: number | null | undefined, compact = true): string {
  if (value == null) return "—";
  if (compact) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString("en-IN");
}
