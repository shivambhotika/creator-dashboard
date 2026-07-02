import { NextRequest, NextResponse } from "next/server";
import { videos } from "@/lib/mock-data";
import { extractYouTubeVideoId, fetchYouTubeVideoStats } from "@/lib/youtube";
import { insertMetricSnapshot } from "@/lib/storage";
import { DUB_LINK_MAPPINGS, fetchDubStats } from "@/lib/dub-server";
import { insertDubSnapshot } from "@/lib/storage";
import { verifyDashboardRequest } from "@/lib/dashboard-auth";

export async function POST(req: NextRequest, ctx: { params: Promise<{ videoId: string }> }) {
  if (!(await verifyDashboardRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId } = await ctx.params;
  const video = videos.find((v) => v.id === videoId);
  if (!video) return NextResponse.json({ error: "Unknown video" }, { status: 404 });

  const warnings: string[] = [];
  let snapshots = 0;

  try {
    if (video.platform === "YouTube") {
      const ytId = extractYouTubeVideoId(video.url);
      if (ytId) {
        const stats = await fetchYouTubeVideoStats([ytId]);
        const s = stats[0];
        if (s) {
          await insertMetricSnapshot({
            videoId,
            creatorId: video.creatorId,
            campaignId: video.campaignId,
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
        } else {
          warnings.push("No YouTube stats returned");
        }
      } else {
        warnings.push("Video has no resolvable YouTube video URL");
      }
    } else {
      warnings.push(`Live snapshot sync not supported for platform ${video.platform}`);
    }

    // Dub snapshot if the video has an exact mapping.
    const mapping = DUB_LINK_MAPPINGS.find((m) => m.videoIds.includes(videoId));
    if (mapping) {
      const capturedAt = new Date().toISOString();
      for (const slug of mapping.slugs) {
        const stats = await fetchDubStats(slug);
        if (stats) {
          await insertDubSnapshot({
            slug,
            videoId: mapping.exactVideoAttribution && mapping.videoIds.length === 1 ? videoId : null,
            attributionGroupId: mapping.attributionGroupId ?? null,
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
        }
      }
    }

    return NextResponse.json({ videoId, status: "success", snapshots, warnings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ videoId, error: msg, status: "failed" }, { status: 500 });
  }
}
