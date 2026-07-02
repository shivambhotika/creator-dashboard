import { NextRequest, NextResponse } from "next/server";
import { videos } from "@/lib/mock-data";
import { extractYouTubeVideoId, fetchYouTubeVideoStats } from "@/lib/youtube";
import { insertMetricSnapshot } from "@/lib/storage";
import { verifyDashboardRequest } from "@/lib/dashboard-auth";

export async function POST(req: NextRequest, ctx: { params: Promise<{ creatorId: string }> }) {
  if (!(await verifyDashboardRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId } = await ctx.params;
  const creatorVideos = videos.filter((v) => v.creatorId === creatorId);
  if (creatorVideos.length === 0) {
    return NextResponse.json({ error: "No videos for creator" }, { status: 404 });
  }

  const warnings: string[] = [];
  let snapshots = 0;

  try {
    const yt = creatorVideos
      .filter((v) => v.platform === "YouTube")
      .map((v) => ({ v, ytId: extractYouTubeVideoId(v.url) }))
      .filter((x): x is { v: (typeof creatorVideos)[number]; ytId: string } => x.ytId != null);

    if (yt.length > 0) {
      const stats = await fetchYouTubeVideoStats(yt.map((x) => x.ytId));
      const byYt = new Map(stats.map((s) => [s.youtubeVideoId, s]));
      for (const { v, ytId } of yt) {
        const s = byYt.get(ytId);
        if (!s) {
          warnings.push(`No stats for ${v.id}`);
          continue;
        }
        await insertMetricSnapshot({
          videoId: v.id,
          creatorId: v.creatorId,
          campaignId: v.campaignId,
          platform: "youtube",
          capturedAt: s.capturedAt,
          source: "youtube_api",
          views: s.views,
          likes: s.likes,
          comments: s.comments,
          sourceConfidence: "high",
          rawPayload: s,
        });
        snapshots++;
      }
    } else {
      warnings.push("No resolvable YouTube videos for this creator");
    }

    return NextResponse.json({ creatorId, status: "success", snapshots, warnings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ creatorId, error: msg, status: "failed" }, { status: 500 });
  }
}
