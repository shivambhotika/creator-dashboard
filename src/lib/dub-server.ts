/**
 * Server-side Dub analytics fetcher — never imported by client components.
 * Fetches composite stats (clicks + leads + sales) for each known ref link.
 * Uses ISR: data is cached for 5 minutes on the edge.
 */

const DUB_BASE = "https://api.dub.co";
const DUB_DOMAIN = "ref.wisprflow.ai";
const REVALIDATE = 300;

// Maps videoId → Dub slug(s). Use an array when a creator has multiple ref links that should be combined.
export const DUB_SLUGS: Record<string, string | string[]> = {
  // Wispr × WLDD June 2026
  v50: "infobyshree",
  v51: "insta-nirav",
  v52: "kochu-ai",
  v53: "financewithjobi",
  v54: "prettymuchbusiness",
  v55: "applewale-bhaiya",
  v56: "ezsnippet",
  v57: "vaibhavkadnar",
  v58: "bisboworld",
  v59: "akbershaikh",
  v60: "WhyBhanshu",
  v61: "fraz",            // Mohammed Fraz — confirmed from Social Tag sheet 2026-06-27
  v62: "thinkwings",      // Think Wings — confirmed from Social Tag sheet 2026-06-27
  // v63 Full Disclosure: slug in sheet is "financewithjobi" — same as v53. BUG: wrong slug, needs new unique link from Social Tag.
  v64: "technicalsuneja", // Technical Suneja — confirmed from Social Tag sheet 2026-06-27
  // Coding First — June 2026
  v67: "codingwithsagar",
  v68: "nishantchahar",
  v69: "saumyasingh",
  v70: "pavanlalwani",
  v71: "mehulmpt",
  v73: "engineeringdigest",
  v74: "arshgoyal",
  v75: "codeandbug",
  v76: "astrokj",
  // LinkedIn MTW — ref.wisprflow.ai tracking
  v35: "suryakant-chaurasiya",
  // Multi-slug creators (combined across all their ref links)
  v7:  ["NandiniA", "Nandini"],
  v87: ["ishan-sharma-yt", "IshanYT", "IshanS"],
  v91: "vaibhavyt",
  // Finnet / AEOS — Instagram (March 2026)
  v1: "AnushkaR",
  v2: "NidhiK",
  v3: "AyushS",
  v4: "AnanyaB",
  v5: "JayantM",
  v6: "ShankarB",
  v8: "AevyTV",
  v9: "ArjunV",
  v10: "MaitriM",
  // Batch 1 — Palak / Direct / Social Tag (March 2026)
  v77: "AartiS",
  v78: "Gayatri",
  v79: "Anurag",
  v80: "Ayush",
  v81: "Jivraj",
  v82: "MitiS",
  v83: "AnshM",
  v84: "ParasM",
  v85: "AnikJ",
  v86: "AdityaA",
};

import type { DubLinkMapping } from "@/types";

/**
 * Per-video / per-creator Dub link mapping with explicit attribution certainty.
 * `exactVideoAttribution: false` means the slug(s) are shared across multiple
 * videos, so only creator-level attribution is exact — video-level is estimated.
 */
export const DUB_LINK_MAPPINGS: DubLinkMapping[] = [
  // Ishan Sharma — 3 videos, shared slug
  { slugs: ["ishan-sharma-yt", "IshanYT", "IshanS"], videoIds: ["v87", "v88", "v94"], creatorId: "c87", attributionGroupId: "ag-ishan", attributionLevel: "creator", exactVideoAttribution: false, notes: "Same 3 slugs reused across v87/v88/v94. Creator-level exact, video-level estimated." },
  // CA Nandini — 2 videos, shared slug
  { slugs: ["NandiniA", "Nandini"], videoIds: ["v7", "v92"], creatorId: "c7", attributionGroupId: "ag-nandini", attributionLevel: "creator", exactVideoAttribution: false, notes: "Shared slugs across v7 and v92." },
  // Anurag Bansal — cross-platform, shared slug
  { slugs: ["Anurag"], videoIds: ["v79", "v89", "v90", "v93"], creatorId: "c79", attributionGroupId: "ag-anurag", attributionLevel: "creator", exactVideoAttribution: false, notes: "IG slug used for YT videos. Cross-platform shared attribution." },
  // Individual video mappings (exact):
  { slugs: ["infobyshree"], videoIds: ["v50"], creatorId: "c50", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["insta-nirav"], videoIds: ["v51"], creatorId: "c51", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["kochu-ai"], videoIds: ["v52"], creatorId: "c52", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["financewithjobi"], videoIds: ["v53"], creatorId: "c53", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["prettymuchbusiness"], videoIds: ["v54"], creatorId: "c54", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["applewale-bhaiya"], videoIds: ["v55"], creatorId: "c55", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["ezsnippet"], videoIds: ["v56"], creatorId: "c56", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["vaibhavkadnar"], videoIds: ["v57"], creatorId: "c57", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["bisboworld"], videoIds: ["v58"], creatorId: "c58", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["akbershaikh"], videoIds: ["v59"], creatorId: "c59", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["WhyBhanshu"], videoIds: ["v60"], creatorId: "c60", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["codingwithsagar"], videoIds: ["v67"], creatorId: "c67", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["nishantchahar"], videoIds: ["v68"], creatorId: "c68", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["saumyasingh"], videoIds: ["v69"], creatorId: "c69", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["pavanlalwani"], videoIds: ["v70"], creatorId: "c70", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["mehulmpt"], videoIds: ["v71"], creatorId: "c71", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["engineeringdigest"], videoIds: ["v73"], creatorId: "c73", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["arshgoyal"], videoIds: ["v74"], creatorId: "c74", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["codeandbug"], videoIds: ["v75"], creatorId: "c75", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["astrokj"], videoIds: ["v76"], creatorId: "c76", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["vaibhavyt"], videoIds: ["v91"], creatorId: "c88", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["suryakant-chaurasiya"], videoIds: ["v35"], creatorId: "c35", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["AnushkaR"], videoIds: ["v1"], creatorId: "c1", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["NidhiK"], videoIds: ["v2"], creatorId: "c2", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["AyushS"], videoIds: ["v3"], creatorId: "c3", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["AnanyaB"], videoIds: ["v4"], creatorId: "c4", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["JayantM"], videoIds: ["v5"], creatorId: "c5", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["ShankarB"], videoIds: ["v6"], creatorId: "c6", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["AevyTV"], videoIds: ["v8"], creatorId: "c8", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["ArjunV"], videoIds: ["v9"], creatorId: "c9", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["MaitriM"], videoIds: ["v10"], creatorId: "c10", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["AartiS"], videoIds: ["v77"], creatorId: "c77", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["Gayatri"], videoIds: ["v78"], creatorId: "c78", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["Ayush"], videoIds: ["v80"], creatorId: "c80", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["Jivraj"], videoIds: ["v81"], creatorId: "c81", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["MitiS"], videoIds: ["v82"], creatorId: "c82", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["AnshM"], videoIds: ["v83"], creatorId: "c83", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["ParasM"], videoIds: ["v84"], creatorId: "c84", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["AnikJ"], videoIds: ["v85"], creatorId: "c85", attributionLevel: "video", exactVideoAttribution: true },
  { slugs: ["AdityaA"], videoIds: ["v86"], creatorId: "c86", attributionLevel: "video", exactVideoAttribution: true },
];

/** Flat, de-duplicated list of every Dub slug referenced by DUB_SLUGS. */
export const ALL_DUB_SLUGS: string[] = Array.from(
  new Set(
    Object.values(DUB_SLUGS).flatMap((s) => (Array.isArray(s) ? s : [s]))
  )
);

export interface DubStats {
  clicks: number;
  leads: number;
  sales: number;
  saleAmount: number;
}

export interface DubTimeseriesEntry {
  start: string;
  clicks: number;
  leads: number;
  sales: number;
}

/** Public per-slug stats fetcher. Returns null when DUB_API_KEY is missing or the request fails. */
export async function fetchDubStats(
  slug: string,
  interval = "all",
  timezone = "Asia%2FKolkata"
): Promise<DubStats | null> {
  const apiKey = process.env.DUB_API_KEY;
  if (!apiKey) return null;
  try {
    return await fetchSlug(slug, apiKey, interval, timezone);
  } catch {
    return null;
  }
}

/** Fetch daily timeseries (groupBy=timeseries) for a slug. Returns [] on missing key / failure. */
export async function fetchDubTimeseries(
  slug: string,
  interval = "30d",
  timezone = "Asia%2FKolkata"
): Promise<DubTimeseriesEntry[]> {
  const apiKey = process.env.DUB_API_KEY;
  if (!apiKey) return [];
  try {
    const url = `${DUB_BASE}/analytics?domain=${DUB_DOMAIN}&key=${slug}&event=composite&groupBy=timeseries&interval=${interval}&timezone=${timezone}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as Array<{ start?: string; clicks?: number; leads?: number; sales?: number }>;
    return json.map((e) => ({
      start: e.start ?? "",
      clicks: e.clicks ?? 0,
      leads: e.leads ?? 0,
      sales: e.sales ?? 0,
    }));
  } catch {
    return [];
  }
}

export interface DubVideoStats {
  videoId: string;
  slug: string;
  stats: DubStats;
}

export interface DubSummary {
  byVideo: Record<string, DubStats>;
  totalClicks: number;
  totalLeads: number;
  totalSales: number;
  totalSaleAmount: number;
  fetchedAt: string;
  partial: boolean;
  warnings: string[];
  interval: string;
  timezone: string;
}

async function fetchSlug(
  slug: string,
  apiKey: string,
  interval = "all",
  timezone = "Asia%2FKolkata"
): Promise<DubStats> {
  const url = `${DUB_BASE}/analytics?domain=${DUB_DOMAIN}&key=${slug}&event=composite&interval=${interval}&timezone=${timezone}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`Dub ${res.status} for ${slug}`);
  return res.json() as Promise<DubStats>;
}

async function fetchVideoStats(
  videoId: string,
  slugOrSlugs: string | string[],
  apiKey: string,
  interval = "all",
  timezone = "Asia%2FKolkata"
): Promise<{ videoId: string; stats: DubStats }> {
  const slugs = Array.isArray(slugOrSlugs) ? slugOrSlugs : [slugOrSlugs];
  const results = await Promise.all(slugs.map((s) => fetchSlug(s, apiKey, interval, timezone)));
  const combined: DubStats = results.reduce(
    (acc, r) => ({
      clicks: acc.clicks + r.clicks,
      leads: acc.leads + r.leads,
      sales: acc.sales + r.sales,
      saleAmount: acc.saleAmount + r.saleAmount,
    }),
    { clicks: 0, leads: 0, sales: 0, saleAmount: 0 }
  );
  return { videoId, stats: combined };
}

export async function getDubStats(
  interval = "all",
  timezone = "Asia%2FKolkata"
): Promise<DubSummary> {
  const apiKey = process.env.DUB_API_KEY;
  if (!apiKey) {
    return {
      byVideo: {},
      totalClicks: 0,
      totalLeads: 0,
      totalSales: 0,
      totalSaleAmount: 0,
      fetchedAt: new Date().toISOString(),
      partial: true,
      warnings: ["DUB_API_KEY is not configured — Dub analytics unavailable"],
      interval,
      timezone,
    };
  }

  const entries = Object.entries(DUB_SLUGS);
  const results = await Promise.allSettled(
    entries.map(([videoId, slugOrSlugs]) =>
      fetchVideoStats(videoId, slugOrSlugs, apiKey, interval, timezone)
    )
  );

  const byVideo: Record<string, DubStats> = {};
  let partial = false;
  let totalClicks = 0;
  let totalLeads = 0;
  let totalSales = 0;
  let totalSaleAmount = 0;
  const warnings: string[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      const { videoId, stats } = result.value;
      byVideo[videoId] = stats;
      totalClicks += stats.clicks;
      totalLeads += stats.leads;
      totalSales += stats.sales;
      totalSaleAmount += stats.saleAmount;
    } else {
      partial = true;
      const [videoId] = entries[i];
      warnings.push(`Failed to fetch Dub stats for ${videoId}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
    }
  });

  return {
    byVideo,
    totalClicks,
    totalLeads,
    totalSales,
    totalSaleAmount,
    fetchedAt: new Date().toISOString(),
    partial,
    warnings,
    interval,
    timezone,
  };
}
