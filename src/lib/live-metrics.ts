import type { ContentMetricSnapshot } from "@/types";
import { getLatestMetricSnapshot } from "@/lib/storage";
import { videos, performances, installs } from "@/lib/mock-data";
import { DUB_LINK_MAPPINGS } from "@/lib/dub-server";

export interface ResolvedMetric<T> {
  value: T | null;
  source: "db_snapshot" | "seed" | "estimated" | "none";
  confidence: "high" | "medium" | "low" | "none";
  capturedAt?: string;
  explanation?: string;
}

function none<T>(explanation?: string): ResolvedMetric<T> {
  return { value: null, source: "none", confidence: "none", explanation };
}

export async function resolveLatestVideoViews(videoId: string): Promise<ResolvedMetric<number>> {
  const snap = await getLatestMetricSnapshot(videoId);
  if (snap && snap.views != null) {
    return {
      value: snap.views,
      source: "db_snapshot",
      confidence: snap.sourceConfidence === "none" ? "low" : snap.sourceConfidence,
      capturedAt: snap.capturedAt,
      explanation: `Latest snapshot from ${snap.source}`,
    };
  }
  const perf = performances.find((p) => p.videoId === videoId);
  if (perf && perf.views > 0) {
    return { value: perf.views, source: "seed", confidence: "medium", explanation: "Seed performance data" };
  }
  return none<number>("No views snapshot or seed data");
}

export async function resolveLatestVideoClicks(videoId: string): Promise<ResolvedMetric<number>> {
  const perf = performances.find((p) => p.videoId === videoId);
  if (perf && perf.clickThroughs > 0) {
    return { value: perf.clickThroughs, source: "seed", confidence: "medium", explanation: "Seed click data" };
  }
  return none<number>("No clicks data (Dub clicks resolved server-side elsewhere)");
}

export async function resolveLatestVideoLeads(videoId: string): Promise<ResolvedMetric<number>> {
  const rec = installs.find((i) => i.videoId === videoId);
  if (rec) {
    return { value: rec.installs, source: "seed", confidence: "low", explanation: "Seed install record" };
  }
  return none<number>("No leads data");
}

function mappingFor(videoId: string) {
  return DUB_LINK_MAPPINGS.find((m) => m.videoIds.includes(videoId));
}

export async function resolveExactVideoInstalls(videoId: string): Promise<ResolvedMetric<number>> {
  const mapping = mappingFor(videoId);
  if (!mapping || !mapping.exactVideoAttribution || mapping.videoIds.length !== 1) {
    return none<number>("Video-level installs are not exact (shared slug / no mapping)");
  }
  const rec = installs.find((i) => i.videoId === videoId);
  if (rec) {
    return { value: rec.installs, source: "seed", confidence: "high", explanation: "Exact unique-slug attribution" };
  }
  return none<number>("Exact attribution mapping exists but no install count available yet");
}

export async function resolveEstimatedVideoInstalls(videoId: string): Promise<ResolvedMetric<number>> {
  const mapping = mappingFor(videoId);
  if (!mapping || mapping.exactVideoAttribution) {
    return none<number>("Estimated split only applies to shared-slug videos");
  }
  // Estimated even-split fallback when no inferred attribution is available.
  const rec = installs.find((i) => i.videoId === videoId);
  if (rec) {
    return {
      value: rec.installs,
      source: "estimated",
      confidence: "low",
      explanation: "ESTIMATED — shared slug; video-level split is not exact",
    };
  }
  return none<number>("No estimated installs available");
}

export async function resolveCreatorLevelInstalls(creatorId: string): Promise<ResolvedMetric<number>> {
  const creatorVideos = videos.filter((v) => v.creatorId === creatorId).map((v) => v.id);
  const total = installs
    .filter((i) => creatorVideos.includes(i.videoId))
    .reduce<number | null>((acc, i) => (acc == null ? i.installs : acc + i.installs), null);
  if (total == null) return none<number>("No install records for creator");
  return { value: total, source: "seed", confidence: "high", explanation: "Creator-level total across all videos" };
}

export function calculateMetricDelta(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null) return null;
  return current - previous;
}

export function calculateWindowDelta(
  snapshots: ContentMetricSnapshot[],
  metric: keyof ContentMetricSnapshot,
  days: number
): number | null {
  if (snapshots.length === 0) return null;
  const sorted = [...snapshots].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  const latest = sorted[sorted.length - 1];
  const cutoff = new Date(new Date(latest.capturedAt).getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  const baseline = [...sorted].reverse().find((s) => s.capturedAt <= cutoff) ?? sorted[0];
  const cur = latest[metric];
  const prev = baseline[metric];
  if (typeof cur !== "number" || typeof prev !== "number") return null;
  return cur - prev;
}

export function calculateVelocity(
  snapshots: ContentMetricSnapshot[],
  metric: keyof ContentMetricSnapshot,
  days: number
): number | null {
  const delta = calculateWindowDelta(snapshots, metric, days);
  if (delta == null || days <= 0) return null;
  return delta / days;
}

export function mergeSeedAndSnapshotMetric(
  seedMetric: ResolvedMetric<number>,
  latestSnapshot: ContentMetricSnapshot | null
): ResolvedMetric<number> {
  if (latestSnapshot && latestSnapshot.views != null) {
    return {
      value: latestSnapshot.views,
      source: "db_snapshot",
      confidence: latestSnapshot.sourceConfidence === "none" ? "low" : latestSnapshot.sourceConfidence,
      capturedAt: latestSnapshot.capturedAt,
      explanation: "Live snapshot supersedes seed value",
    };
  }
  return seedMetric;
}
