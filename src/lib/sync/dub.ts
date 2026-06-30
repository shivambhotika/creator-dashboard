import type { SyncResult } from "@/types";
import { ALL_DUB_SLUGS, DUB_LINK_MAPPINGS, fetchDubStats, fetchDubTimeseries } from "@/lib/dub-server";
import { insertDubSnapshot, insertDubTimeseriesPoints } from "@/lib/storage";
import { mergeSyncWarnings } from "@/lib/sync/utils";

function lookupMapping(slug: string): { videoId: string | null; groupId: string | null } {
  const m = DUB_LINK_MAPPINGS.find((x) => x.slugs.includes(slug));
  if (!m) return { videoId: null, groupId: null };
  return {
    videoId: m.exactVideoAttribution && m.videoIds.length === 1 ? m.videoIds[0] : null,
    groupId: m.attributionGroupId ?? null,
  };
}

export async function syncDubCounts(): Promise<SyncResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!process.env.DUB_API_KEY) {
    return {
      source: "dub",
      status: "partial",
      rowsRead: 0,
      itemsCreated: 0,
      warnings: ["DUB_API_KEY not configured — Dub counts sync skipped"],
      errors: [],
    };
  }

  const capturedAt = new Date().toISOString();
  let itemsCreated = 0;

  for (const slug of ALL_DUB_SLUGS) {
    const stats = await fetchDubStats(slug);
    if (!stats) {
      warnings.push(`Failed to fetch Dub stats for slug "${slug}"`);
      continue;
    }
    const { videoId, groupId } = lookupMapping(slug);
    await insertDubSnapshot({
      slug,
      videoId,
      attributionGroupId: groupId,
      capturedAt,
      interval: "all",
      timezone: "Asia/Kolkata",
      clicks: stats.clicks,
      leads: stats.leads,
      sales: stats.sales,
      source: "dub",
      sourceConfidence: "high",
      rawPayload: stats,
    });
    itemsCreated++;
  }

  return {
    source: "dub",
    status: warnings.length > 0 ? "partial" : "success",
    rowsRead: ALL_DUB_SLUGS.length,
    itemsCreated,
    warnings,
    errors,
  };
}

export async function syncDubTimeseries(daysBack = 30): Promise<SyncResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!process.env.DUB_API_KEY) {
    return {
      source: "dub",
      status: "partial",
      rowsRead: 0,
      itemsCreated: 0,
      warnings: ["DUB_API_KEY not configured — Dub timeseries sync skipped"],
      errors: [],
    };
  }

  const interval = `${daysBack}d`;
  const fetchedAt = new Date().toISOString();
  let itemsCreated = 0;

  for (const slug of ALL_DUB_SLUGS) {
    const series = await fetchDubTimeseries(slug, interval);
    if (series.length === 0) {
      warnings.push(`No timeseries data for slug "${slug}"`);
      continue;
    }
    const { groupId } = lookupMapping(slug);
    const points = series.flatMap((entry) => {
      const date = entry.start.slice(0, 10);
      return ([
        ["clicks", entry.clicks],
        ["leads", entry.leads],
        ["sales", entry.sales],
      ] as const).map(([eventType, count]) => ({
        slug,
        attributionGroupId: groupId,
        date,
        eventType,
        count,
        fetchedAt,
      }));
    });
    await insertDubTimeseriesPoints(points);
    itemsCreated += points.length;
  }

  return {
    source: "dub",
    status: warnings.length > 0 ? "partial" : "success",
    rowsRead: ALL_DUB_SLUGS.length,
    itemsCreated,
    warnings,
    errors,
  };
}

export async function syncDubAll(): Promise<SyncResult> {
  const counts = await syncDubCounts();
  const timeseries = await syncDubTimeseries();
  const status: SyncResult["status"] =
    counts.status === "failed" || timeseries.status === "failed"
      ? "failed"
      : counts.status === "partial" || timeseries.status === "partial"
        ? "partial"
        : "success";
  return {
    source: "dub",
    status,
    rowsRead: (counts.rowsRead ?? 0) + (timeseries.rowsRead ?? 0),
    itemsCreated: (counts.itemsCreated ?? 0) + (timeseries.itemsCreated ?? 0),
    warnings: mergeSyncWarnings(counts, timeseries),
    errors: [...counts.errors, ...timeseries.errors],
  };
}
