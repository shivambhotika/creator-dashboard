/**
 * YouTube Data API v3 client — server-side only.
 * All functions degrade gracefully (return empty / "none") when YOUTUBE_API_KEY is missing.
 */

import type { SyncResult } from "@/types";
import { videos } from "@/lib/mock-data";
import { insertMetricSnapshot } from "@/lib/storage";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideoStats {
  videoId: string; // our internal videoId
  youtubeVideoId: string;
  title: string;
  channelId: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  privacyStatus: string;
  capturedAt: string;
}

/** Extract YouTube video ID from common URL shapes. Returns null for channel-only URLs. */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        return u.searchParams.get("v");
      }
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts) return shorts[1];
      const embed = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embed) return embed[1];
    }
    return null;
  } catch {
    return null;
  }
}

interface YtStatItem {
  id: string;
  snippet?: { title?: string; channelId?: string; publishedAt?: string };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
  status?: { privacyStatus?: string };
}

/** Fetch stats for up to 50 YouTube video IDs at a time. Returns [] if API key missing. */
export async function fetchYouTubeVideoStats(youtubeVideoIds: string[]): Promise<YouTubeVideoStats[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];
  const ids = youtubeVideoIds.filter(Boolean);
  if (ids.length === 0) return [];

  const capturedAt = new Date().toISOString();
  const out: YouTubeVideoStats[] = [];

  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,status&id=${batch.join(",")}&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      throw new Error(`YouTube videos.list ${res.status}`);
    }
    const json = (await res.json()) as { items?: YtStatItem[] };
    for (const item of json.items ?? []) {
      out.push({
        videoId: "", // mapped by caller
        youtubeVideoId: item.id,
        title: item.snippet?.title ?? "",
        channelId: item.snippet?.channelId ?? "",
        publishedAt: item.snippet?.publishedAt ?? "",
        views: Number(item.statistics?.viewCount ?? 0),
        likes: Number(item.statistics?.likeCount ?? 0),
        comments: Number(item.statistics?.commentCount ?? 0),
        privacyStatus: item.status?.privacyStatus ?? "unknown",
        capturedAt,
      });
    }
  }
  return out;
}

export interface ChannelResolveInput {
  channelUrl: string;
  plannedGoLiveAt: string;
  campaignKeywords: string[];
  videoId: string;
}

export interface ChannelResolveResult {
  videoId: string;
  foundYoutubeVideoId: string | null;
  foundUrl: string | null;
  confidence: "high" | "medium" | "low" | "none";
  candidateCount: number;
  reason: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Extract a channel handle or id from a channel URL. */
function parseChannel(channelUrl: string): { type: "id" | "handle"; value: string } | null {
  try {
    const u = new URL(channelUrl);
    const handle = u.pathname.match(/\/@([^/?]+)/);
    if (handle) return { type: "handle", value: handle[1] };
    const channel = u.pathname.match(/\/channel\/([^/?]+)/);
    if (channel) return { type: "id", value: channel[1] };
    return null;
  } catch {
    return null;
  }
}

async function resolveChannelId(parsed: { type: "id" | "handle"; value: string }, apiKey: string): Promise<string | null> {
  if (parsed.type === "id") return parsed.value;
  const url = `${YOUTUBE_API_BASE}/channels?part=id&forHandle=@${parsed.value}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { items?: { id?: string }[] };
  return json.items?.[0]?.id ?? null;
}

interface SearchItem {
  id?: { videoId?: string };
  snippet?: { title?: string; description?: string; publishedAt?: string };
}

/** Resolve the most likely YouTube video from a channel URL near the planned go-live date. */
export async function resolveLikelyVideoFromChannel(input: ChannelResolveInput): Promise<ChannelResolveResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const base: ChannelResolveResult = {
    videoId: input.videoId,
    foundYoutubeVideoId: null,
    foundUrl: null,
    confidence: "none",
    candidateCount: 0,
    reason: "",
  };
  if (!apiKey) {
    return { ...base, reason: "YouTube API key not configured" };
  }

  const parsed = parseChannel(input.channelUrl);
  if (!parsed) {
    return { ...base, reason: "Could not parse channel URL" };
  }

  try {
    const channelId = await resolveChannelId(parsed, apiKey);
    if (!channelId) {
      return { ...base, reason: "Could not resolve channel id" };
    }
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=25&key=${apiKey}`;
    const res = await fetch(searchUrl);
    if (!res.ok) {
      return { ...base, reason: `search.list ${res.status}` };
    }
    const json = (await res.json()) as { items?: SearchItem[] };
    const items = json.items ?? [];

    const planned = new Date(input.plannedGoLiveAt).getTime();
    const keywords = input.campaignKeywords.map((k) => k.toLowerCase()).filter(Boolean);

    const candidates = items
      .filter((it) => it.id?.videoId && it.snippet?.publishedAt)
      .map((it) => {
        const publishedAt = new Date(it.snippet!.publishedAt!).getTime();
        const dayDiff = Math.abs(publishedAt - planned) / MS_PER_DAY;
        const text = `${it.snippet?.title ?? ""} ${it.snippet?.description ?? ""}`.toLowerCase();
        const keywordHits = keywords.filter((k) => text.includes(k)).length;
        return { videoId: it.id!.videoId!, dayDiff, keywordHits };
      })
      .filter((c) => c.dayDiff <= 14);

    if (candidates.length === 0) {
      return { ...base, candidateCount: 0, reason: "No uploads within 14 days of planned go-live" };
    }

    candidates.sort((a, b) => {
      if (b.keywordHits !== a.keywordHits) return b.keywordHits - a.keywordHits;
      return a.dayDiff - b.dayDiff;
    });

    const best = candidates[0];
    const confidence: ChannelResolveResult["confidence"] =
      best.keywordHits >= 2 && best.dayDiff <= 3
        ? "high"
        : best.keywordHits >= 1 || best.dayDiff <= 5
          ? "medium"
          : "low";

    return {
      videoId: input.videoId,
      foundYoutubeVideoId: best.videoId,
      foundUrl: `https://www.youtube.com/watch?v=${best.videoId}`,
      confidence,
      candidateCount: candidates.length,
      reason: `Best match: ${best.keywordHits} keyword hit(s), ${best.dayDiff.toFixed(1)} days from planned go-live`,
    };
  } catch (err) {
    return { ...base, reason: err instanceof Error ? err.message : String(err) };
  }
}

const CHANNEL_ONLY_VIDEO_IDS = ["v72", "v74", "v75", "v62", "v63", "v64", "v65", "v66"];

/** Sync YouTube snapshots for all known YouTube videos with resolvable video URLs. */
export async function syncYouTubeSnapshots(): Promise<SyncResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!process.env.YOUTUBE_API_KEY) {
    return {
      source: "youtube",
      status: "partial",
      rowsRead: 0,
      itemsCreated: 0,
      warnings: ["YOUTUBE_API_KEY not configured — YouTube sync skipped"],
      errors: [],
    };
  }

  const ytVideos = videos.filter((v) => v.platform === "YouTube");

  // Map our videoId → youtube video id (only those with a real video URL)
  const resolvable: { videoId: string; ytId: string }[] = [];
  for (const v of ytVideos) {
    const ytId = extractYouTubeVideoId(v.url);
    if (ytId) resolvable.push({ videoId: v.id, ytId });
  }

  let itemsCreated = 0;
  try {
    const stats = await fetchYouTubeVideoStats(resolvable.map((r) => r.ytId));
    const byYt = new Map(stats.map((s) => [s.youtubeVideoId, s]));

    for (const r of resolvable) {
      const s = byYt.get(r.ytId);
      if (!s) {
        warnings.push(`No YouTube stats returned for ${r.videoId} (${r.ytId})`);
        continue;
      }
      const v = ytVideos.find((x) => x.id === r.videoId)!;
      await insertMetricSnapshot({
        videoId: r.videoId,
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
      itemsCreated++;
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  // Attempt channel resolution for channel-URL-only videos.
  for (const id of CHANNEL_ONLY_VIDEO_IDS) {
    const v = ytVideos.find((x) => x.id === id);
    if (!v) continue;
    if (extractYouTubeVideoId(v.url)) continue; // already had a video URL
    try {
      const result = await resolveLikelyVideoFromChannel({
        channelUrl: v.url,
        plannedGoLiveAt: v.goLiveDate,
        campaignKeywords: ["wispr", "flow", "ai", v.creatorName.split(" ")[0]].filter(Boolean),
        videoId: id,
      });
      if (result.foundYoutubeVideoId && result.confidence !== "none") {
        warnings.push(
          `Resolved candidate video for ${id} from channel (${result.confidence}): ${result.foundUrl}`
        );
      } else {
        warnings.push(`Could not resolve video for ${id}: ${result.reason}`);
      }
    } catch (err) {
      warnings.push(`Channel resolve error for ${id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    source: "youtube",
    status: errors.length > 0 ? "partial" : "success",
    rowsRead: resolvable.length,
    itemsCreated,
    itemsUpdated: 0,
    warnings,
    errors,
  };
}
