import type { InferredAttribution, InferredAttributionConfidence, SyncResult } from "@/types";
import type { InferredAttributionInput } from "@/lib/sync/types";
import { ATTRIBUTION_GROUPS } from "@/lib/attribution";
import { videos } from "@/lib/mock-data";
import { fetchDubStats } from "@/lib/dub-server";
import {
  clearInferredAttributionForGroup,
  getLatestMetricSnapshot,
  insertInferredAttribution,
} from "@/lib/storage";

interface PlatformWindows {
  strongDays: number;
  normalDays: number;
  longTailDays: number;
}

const ATTRIBUTION_WINDOWS: Record<"youtube" | "instagram" | "linkedin", PlatformWindows> = {
  youtube: { strongDays: 3, normalDays: 14, longTailDays: 45 },
  instagram: { strongDays: 2, normalDays: 7, longTailDays: 14 },
  linkedin: { strongDays: 3, normalDays: 7, longTailDays: 14 },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizePlatform(p: string): "youtube" | "instagram" | "linkedin" {
  const lower = p.toLowerCase();
  if (lower.includes("youtube")) return "youtube";
  if (lower.includes("linkedin")) return "linkedin";
  return "instagram";
}

/** Time-decay weight: 1.0 strong window, 0.6 normal, 0.25 long-tail, 0 outside. */
function computeTimeWeight(daysSinceLive: number, windows: PlatformWindows): number {
  if (daysSinceLive < 0) return 0;
  if (daysSinceLive <= windows.strongDays) return 1.0;
  if (daysSinceLive <= windows.normalDays) return 0.6;
  if (daysSinceLive <= windows.longTailDays) return 0.25;
  return 0;
}

function confidenceFromProbability(p: number, exact: boolean): InferredAttributionConfidence {
  if (exact) return "exact";
  if (p >= 0.6) return "high_estimated";
  if (p >= 0.35) return "medium_estimated";
  if (p > 0) return "low_estimated";
  return "unassigned";
}

export async function inferAttributionForGroup(groupId: string): Promise<InferredAttribution[]> {
  const group = ATTRIBUTION_GROUPS.find((g) => g.id === groupId);
  if (!group) return [];

  const creatorId = group.creatorIds[0] ?? "";
  const computedAt = new Date().toISOString();
  const now = Date.now();

  // Creator-level exact total (sum across all the group's shared slugs).
  let creatorLeads = 0;
  let haveDub = false;
  for (const slug of group.dubSlugs) {
    const stats = await fetchDubStats(slug);
    if (stats) {
      haveDub = true;
      creatorLeads += stats.leads;
    }
  }

  // Build per-video candidate weights.
  const candidates = await Promise.all(
    group.videoIds.map(async (videoId) => {
      const v = videos.find((x) => x.id === videoId);
      const platform = normalizePlatform(v?.platform ?? "instagram");
      const windows = ATTRIBUTION_WINDOWS[platform];
      const daysSinceLive = v?.goLiveDate ? (now - new Date(v.goLiveDate).getTime()) / MS_PER_DAY : -1;
      const timeWeight = computeTimeWeight(daysSinceLive, windows);

      // View velocity, if a snapshot is available.
      const snap = await getLatestMetricSnapshot(videoId);
      const views = snap?.views ?? null;

      return { videoId, platform, timeWeight, views, daysSinceLive };
    })
  );

  const anyVelocity = candidates.some((c) => c.views != null && c.views > 0);
  const totalViews = candidates.reduce((s, c) => s + (c.views ?? 0), 0);

  // Score each candidate.
  const scored = candidates.map((c) => {
    let score: number;
    if (!anyVelocity) {
      // 100% time weight
      score = c.timeWeight;
    } else {
      const viewShare = totalViews > 0 ? (c.views ?? 0) / totalViews : 0;
      // recent velocity approximated by view share scaled by recency band
      const recentVelocity = c.timeWeight > 0 ? viewShare * c.timeWeight : 0;
      const platformWeight = c.platform === "youtube" ? 1 : 0.8;
      score =
        0.45 * c.timeWeight +
        0.35 * viewShare +
        0.15 * recentVelocity +
        0.05 * (platformWeight / 1);
    }
    return { ...c, score };
  });

  const totalScore = scored.reduce((s, c) => s + c.score, 0);

  const results: InferredAttributionInput[] = scored.map((c) => {
    const probability = totalScore > 0 ? c.score / totalScore : 1 / (scored.length || 1);
    const allocatedValue = haveDub ? creatorLeads * probability : 0;
    const confidence = confidenceFromProbability(probability, false);
    const method: InferredAttribution["method"] = anyVelocity
      ? "time_window_view_velocity"
      : "time_window";
    const explanation = haveDub
      ? `ESTIMATED split of ${creatorLeads} creator-level Dub leads. ${(probability * 100).toFixed(1)}% allocated via ${method} (days since live: ${c.daysSinceLive < 0 ? "n/a" : c.daysSinceLive.toFixed(1)}${c.views != null ? `, views: ${c.views}` : ""}). Not exact — slugs shared across videos.`
      : `ESTIMATED probability ${(probability * 100).toFixed(1)}% — no Dub data available to allocate.`;
    return {
      attributionGroupId: groupId,
      creatorId,
      videoId: c.videoId,
      eventType: "lead",
      allocatedValue,
      probability,
      method,
      confidence,
      explanation,
      computedAt,
    };
  });

  await clearInferredAttributionForGroup(groupId);
  const persisted: InferredAttribution[] = [];
  for (const r of results) {
    persisted.push(await insertInferredAttribution(r));
  }
  return persisted;
}

export async function recomputeInferredAttribution(): Promise<SyncResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  let itemsCreated = 0;

  for (const group of ATTRIBUTION_GROUPS) {
    try {
      const results = await inferAttributionForGroup(group.id);
      itemsCreated += results.length;
      if (results.length === 0) {
        warnings.push(`No inferred attributions produced for group ${group.id}`);
      }
    } catch (err) {
      errors.push(`${group.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    source: "attribution",
    status: errors.length > 0 ? "partial" : "success",
    rowsRead: ATTRIBUTION_GROUPS.length,
    itemsCreated,
    warnings,
    errors,
  };
}
