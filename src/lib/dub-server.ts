/**
 * Server-side Dub analytics fetcher — never imported by client components.
 * Fetches composite stats (clicks + leads + sales) for each known ref link.
 * Uses ISR: data is cached for 5 minutes on the edge.
 */

const DUB_BASE = "https://api.dub.co";
const DUB_DOMAIN = "ref.wisprflow.ai";
const REVALIDATE = 300;

// Maps videoId → Dub slug (ref.wisprflow.ai/<slug>)
export const DUB_SLUGS: Record<string, string> = {
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

export interface DubStats {
  clicks: number;
  leads: number;
  sales: number;
  saleAmount: number;
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
}

async function fetchSlug(slug: string, apiKey: string): Promise<DubStats> {
  const url = `${DUB_BASE}/analytics?domain=${DUB_DOMAIN}&key=${slug}&event=composite`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`Dub ${res.status} for ${slug}`);
  return res.json() as Promise<DubStats>;
}

export async function getDubStats(): Promise<DubSummary> {
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
    };
  }

  const entries = Object.entries(DUB_SLUGS);
  const results = await Promise.allSettled(
    entries.map(([, slug]) => fetchSlug(slug, apiKey))
  );

  const byVideo: Record<string, DubStats> = {};
  let partial = false;
  let totalClicks = 0;
  let totalLeads = 0;
  let totalSales = 0;
  let totalSaleAmount = 0;

  results.forEach((result, i) => {
    const [videoId] = entries[i];
    if (result.status === "fulfilled") {
      byVideo[videoId] = result.value;
      totalClicks += result.value.clicks;
      totalLeads += result.value.leads;
      totalSales += result.value.sales;
      totalSaleAmount += result.value.saleAmount;
    } else {
      partial = true;
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
  };
}
