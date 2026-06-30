import type { AttributionGroup, MetricConfidence } from "@/types";

export const ATTRIBUTION_GROUPS: AttributionGroup[] = [
  {
    id: "ag-ishan",
    name: "Ishan Sharma Package",
    level: "creator",
    videoIds: ["v87", "v88", "v94"],
    creatorIds: ["c87"],
    dubSlugs: ["ishan-sharma-yt", "IshanYT", "IshanS"],
    allocationMethod: "none",
    warning: "All Ishan Sharma traffic combined under v87 slugs. Video-level CPI unavailable. Creator-level attribution only.",
    confidence: "medium",
  },
  {
    id: "ag-nandini",
    name: "CA Nandini Package",
    level: "creator",
    videoIds: ["v7", "v92"],
    creatorIds: ["c7"],
    dubSlugs: ["NandiniA", "Nandini"],
    allocationMethod: "none",
    warning: "All CA Nandini traffic combined. Video-level CPI unavailable.",
    confidence: "medium",
  },
  {
    id: "ag-anurag",
    name: "Anurag Bansal Package",
    level: "creator",
    videoIds: ["v79", "v89", "v90", "v93"],
    creatorIds: ["c79"],
    dubSlugs: ["Anurag"],
    allocationMethod: "none",
    warning: "Anurag Bansal: 'Anurag' slug tracks his IG reels only (v79, v93). YouTube videos (v89, v90) have no Dub slugs — all traffic attributed creator-level.",
    confidence: "low",
  },
];

export function getAttributionGroupForVideo(videoId: string): AttributionGroup | undefined {
  return ATTRIBUTION_GROUPS.find(g => g.videoIds.includes(videoId));
}

export function getAttributionWarning(videoId: string): string | undefined {
  return getAttributionGroupForVideo(videoId)?.warning;
}

export function canShowVideoLevelCPI(videoId: string): boolean {
  const group = getAttributionGroupForVideo(videoId);
  if (!group) return true;
  return group.videoIds.length === 1;
}

export function getAttributionConfidence(videoId: string): MetricConfidence {
  const group = getAttributionGroupForVideo(videoId);
  if (!group) return "high";
  return group.confidence;
}

export function getAttributionLevel(videoId: string): string {
  const group = getAttributionGroupForVideo(videoId);
  if (!group) return "video";
  return group.level;
}
