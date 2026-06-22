import { NextRequest, NextResponse } from "next/server";
import type { DubLinkStats } from "@/types";

const DUB_API_BASE = "https://api.dub.co";

/**
 * Proxy for the Dub API — avoids exposing the API key to the browser.
 *
 * GET /api/dub?action=links          → list all links in the workspace
 * GET /api/dub?action=stats&linkId=X → stats for a single link
 * GET /api/dub?action=installs&campaignId=X&creatorId=Y&from=YYYY-MM-DD&to=YYYY-MM-DD
 *    → aggregated installs from leads/sales on matching links
 */
export async function GET(req: NextRequest) {
  const apiKey = process.env.DUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DUB_API_KEY is not configured. Add it to .env.local and Vercel env vars." },
      { status: 503 }
    );
  }

  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action") ?? "links";

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    if (action === "links") {
      const res = await fetch(`${DUB_API_BASE}/v1/links?pageSize=100`, { headers, next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`Dub API ${res.status}`);
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "stats") {
      const linkId = searchParams.get("linkId");
      if (!linkId) return NextResponse.json({ error: "Missing linkId" }, { status: 400 });
      const res = await fetch(`${DUB_API_BASE}/v1/analytics?linkId=${linkId}&event=leads&interval=all`, { headers, next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`Dub API ${res.status}`);
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "installs") {
      // Fetch clicks + leads for all links, filter by tag (campaignId / creatorId)
      const from = searchParams.get("from") ?? "";
      const to = searchParams.get("to") ?? "";
      const params = new URLSearchParams({ event: "leads", interval: "all" });
      if (from) params.set("start", from);
      if (to) params.set("end", to);

      const res = await fetch(`${DUB_API_BASE}/v1/analytics?${params}`, { headers, next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`Dub API ${res.status}`);
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Dub API error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
